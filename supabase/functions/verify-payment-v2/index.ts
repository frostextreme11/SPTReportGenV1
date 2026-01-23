// Supabase Edge Function: verify-payment-v2
// Verifies payment signature and adds quota to user profile
// Deploy: npx supabase functions deploy verify-payment-v2

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-token',
}

// Same verification secret used in create-payment-v2 (PRODUCTION webhook token)
const VERIFICATION_SECRET = 'b3a5f974a4050a21e56fd9502dcb2b111bb02e1aa01ec7d1f34fd1b9e2a6f246d98337cb928a17de45a18c76665a3dcc1acd0f54af0e3a7e4c5a75fa7202c736'

// Package type to quota mapping
const PACKAGE_QUOTA_MAP: Record<string, number> = {
    '1_quota': 1,
    '5_quota': 5,
}

// Helper to verify Mayar signature
async function verifySignature(
    invoiceNumber: string,
    timestamp: number,
    signature: string,
    secretKey: string
): Promise<boolean> {
    const message = `${invoiceNumber}:${timestamp}`
    const encoder = new TextEncoder()

    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secretKey),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    )

    const expectedSignature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(message)
    )

    // Convert to URL-safe base64
    const base64 = btoa(String.fromCharCode(...new Uint8Array(expectedSignature)))
    const expectedBase64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

    return signature === expectedBase64
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log('--- START VERIFY-PAYMENT-V2 ---')

        // Get auth token
        const authHeader = req.headers.get('Authorization')
        const customToken = req.headers.get('x-user-token')

        let token: string
        if (customToken) {
            token = customToken
        } else if (authHeader) {
            token = authHeader.replace('Bearer ', '')
        } else {
            throw new Error('Missing authorization header')
        }

        // Initialize Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Validate user
        const { data: { user }, error: userError } = await supabase.auth.getUser(token)

        if (userError || !user) {
            throw new Error('Unauthorized')
        }

        // Parse request body
        const { invoice_number } = await req.json()

        if (!invoice_number) {
            throw new Error('Missing invoice_number')
        }

        // Find the payment record first
        const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .select('*')
            .eq('invoice_number', invoice_number)
            .eq('user_id', user.id)
            .single()

        if (paymentError || !payment) {
            throw new Error('Payment not found')
        }

        console.log(`Payment found: ${payment.id}, Status: ${payment.status}, Provider: ${payment.provider}`)

        // If ALREADY SUCCESS, return success
        if (payment.status === 'success' || payment.status === 'completed') {
            return new Response(
                JSON.stringify({
                    success: true,
                    message: 'Payment already processed',
                    quota_added: 0 // Already added
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        // --- DOKU SPECIFIC CHECK ---
        if (payment.provider === 'doku' && payment.status === 'pending') {
            console.log("Checking DOKU Production Status API...")

            // CORRECT CREDENTIALS (PRODUCTION)
            const clientId = 'BRN-0246-1759407773449';
            const secretKey = 'SK-DkDrAIUhTpb3oXphQJdp';

            // Generate Signature for "Check Status"
            // Path: /orders/v1/status/{invoice_number}

            const requestId = crypto.randomUUID()
            const requestTimestamp = new Date().toISOString().slice(0, 19) + "Z"
            const requestPath = `/orders/v1/status/${invoice_number}`

            // Component Signature: ClientId + RequestId + Timestamp + RequestTarget
            // (No Digest for GET/DELETE or bodies without content)
            const componentSignature = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nRequest-Target:${requestPath}`

            const encoder = new TextEncoder()
            const key = await crypto.subtle.importKey(
                'raw', encoder.encode(secretKey), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
            )
            const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(componentSignature))
            const signature = "HMACSHA256=" + btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))

            console.log("Calling DOKU API:", `https://api.doku.com${requestPath}`)

            const dokuResponse = await fetch(`https://api.doku.com${requestPath}`, {
                method: 'GET',
                headers: {
                    'Client-Id': clientId,
                    'Request-Id': requestId,
                    'Request-Timestamp': requestTimestamp,
                    'Signature': signature
                }
            })

            if (!dokuResponse.ok) {
                const errText = await dokuResponse.text()
                console.error("DOKU API Error:", dokuResponse.status, errText)
                // Don't fail the whole request, just return pending state so client retries
                throw new Error(`DOKU API connection failed: ${dokuResponse.status} ${errText}`)
            }

            const dokuData = await dokuResponse.json()
            console.log("DOKU Status Response:", dokuData)

            // Check content
            if (dokuData?.transaction?.status === 'SUCCESS') {
                console.log("DOKU confirmed SUCCESS via API. Updating DB...")

                const quotaAmount = payment.package_type === '5_quota' ? 5 : 1

                // Update DB to success with Optimistic Concurrency Control
                // Only update if status is still 'pending' to prevent double-quota addition from race conditions
                const { error: updateError, count } = await supabase
                    .from('payments')
                    .update({ status: 'success', paid_at: new Date().toISOString() })
                    .eq('id', payment.id)
                    .eq('status', 'pending')
                    .select('id', { count: 'exact' }) // Needed to get count

                if (updateError) {
                    throw new Error(`Database update failed: ${updateError.message}`)
                }

                // If count is 0, it means the payment was already updated by another process (webhook or parallel request)
                if (count === 0) {
                    console.log("Payment status was already updated by another process. Skipping quota increment.")
                    return new Response(
                        JSON.stringify({
                            success: true,
                            message: 'Payment verified (already processed by concurrency check)',
                            quota_added: 0
                        }),
                        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
                    )
                }

                // Only increment quota if we successfully transitioned from pending -> success
                console.log("Status updated to SUCCESS. Incrementing quota...")
                await supabase.rpc('increment_quota', { user_id_input: user.id, amount_input: quotaAmount })

                return new Response(
                    JSON.stringify({
                        success: true,
                        message: 'Payment verified via DOKU API',
                        quota_added: quotaAmount
                    }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
                )
            } else {
                console.log("DOKU says payment is not success yet:", dokuData?.transaction?.status)
                throw new Error('Payment still pending at DOKU')
            }
        }

        // Falls through if not DOKU or other provider
        throw new Error("Payment is pending and provider verification not implemented or failed.")

    } catch (error: any) {
        console.error('Error in verify-payment-v2:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
