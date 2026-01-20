// Supabase Edge Function: create-payment
// Deploy this to Supabase Edge Functions

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-token',
}

// DOKU Sandbox Configuration
const DOKU_CLIENT_ID = 'BRN-0246-1759407773449' // PRODUCTION KEY
const DOKU_SECRET_KEY = 'SK-DkDrAIUhTpb3oXphQJdp' // PRODUCTION KEY
const DOKU_API_URL = 'https://api.doku.com/checkout/v1/payment' // PRODUCTION URL

// MAYAR Configuration
const MAYAR_API_URL = 'https://api.mayar.club/hl/v1/payment/create'
const MAYAR_API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyZGU0YjVlNS1mOTExLTRmODItOGUzYi1hODRjODAwM2VlMGEiLCJhY2NvdW50SWQiOiI3YzMzNDU3OC0xZjZiLTQ1MjEtOTI0YS01MzZiZDg3MGUxMTMiLCJjcmVhdGVkQXQiOiIxNzY4ODk5MjA0NDY1Iiwicm9sZSI6ImRldmVsb3BlciIsInN1YiI6Im5vdmFuYWRpdHlhMTFAZ21haWwuY29tIiwibmFtZSI6IkRpZ2l0YWwgU3F1YWQiLCJsaW5rIjoiZGlnaXRhbHNxdWFkIiwiaXNTZWxmRG9tYWluIjpudWxsLCJpYXQiOjE3Njg4OTkyMDR9.VFmdk0bPE77Xe79EkpwEOfKQJ4qIhRJM0LrWbMre8CeR_iTKUbWsNKr5oD5ONIzHXOoNC3Kb-N1EZnlN1adBzK6MmNftmPc4sRa2hKZKnoQeYiOkjzQhX8JzpCDWxxCeMZ02djgWCVQavoCl4oLQzzU3IimzvdOj_ZcY-So4spd-NtdA8XIHewjBsEm-ODPoNm6f2I1TK7Evt8e_XgI6gL4eQ9Np3RnyUVdz8NcODtFzn-mVB-utioB-jlVq_3HATWjnwYSG8Lv78DBze1c8N6mYi97aumYidTtSuuVqh-xinJ8m3Wf2oNOefZkKk9v6ERv5M3wPF4OkMOh871KW9A'

// Generate DOKU Signature
async function generateSignature(clientId: string, requestId: string, timestamp: string, requestTarget: string, digest: string, secretKey: string): Promise<string> {
    const componentSignature = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`

    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secretKey),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    )

    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(componentSignature))
    const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)))

    return `HMACSHA256=${base64Signature}`
}

// Generate SHA256 Digest
async function generateDigest(body: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(body)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Initialize debug info container
        let debugInfo: any = {};

        // Get auth: Try custom header first (to bypass Gateway 401), then standard Auth header
        const authHeader = req.headers.get('Authorization')
        const customToken = req.headers.get('x-user-token')

        let token;
        if (customToken) {
            token = customToken;
        } else if (authHeader) {
            token = authHeader.replace('Bearer ', '');
        } else {
            throw new Error('Missing authorization header')
        }

        // Initialize Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Validate token
        const { data: { user }, error: userError } = await supabase.auth.getUser(token)

        if (userError || !user) {
            throw new Error('Unauthorized')
        }

        // Parse request body
        const { package_type, amount, quota_amount, provider = 'mayar' } = await req.json()

        if (!package_type || !amount) {
            throw new Error('Missing required fields')
        }

        // Generate unique invoice number
        // SPT + Timestamp + Random Chars
        const invoiceNumber = `SPT${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`

        // ---------------------------------------------------------
        // MAYAR PAYMENT FLOW
        // ---------------------------------------------------------
        if (provider === 'mayar') {
            console.log('--- START MAYAR PAYMENT ---')
            const mayarBody = {
                name: user.user_metadata?.full_name || 'Customer',
                email: user.email,
                amount: parseInt(String(amount)),
                mobile: user.user_metadata?.phone || '081234567890',
                "redirectUrl": "https://buatspt.vercel.app/payment/success",
                description: `Payment for ${package_type} - Invoice ${invoiceNumber}`,
            }
            // const mayarBody = {
            //     amount: parseInt(String(amount)),
            //     currency: 'IDR',
            //     description: `Payment for ${package_type} - Invoice ${invoiceNumber}`,
            //     external_id: invoiceNumber,
            //     name: user.user_metadata?.full_name || 'Customer',
            //     email: user.email,
            //     mobile: user.user_metadata?.phone || '081234567890', // Required by Mayar, fallback needed
            //     customer_id: user.id, // Optional, for Mayar tracking // Redirect to custom success page
            //     redirect_url: 'https://buatspt.vercel.app/payment/success', // Fallback spelling
            //     mobile_redirect_url: 'https://buatspt.vercel.app/payment/success', // Fallback for some flows
            //     type: 'ONETIME' // Explicitly set type
            // }

            console.log('Mayar Body:', JSON.stringify(mayarBody))

            const mayarResponse = await fetch(MAYAR_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${MAYAR_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(mayarBody)
            })

            const mayarData = await mayarResponse.json()
            console.log('Mayar Response:', mayarData)

            if (!mayarResponse.ok) {
                throw new Error(`Mayar Failed: ${JSON.stringify(mayarData)}`)
            }

            // Mayar usually returns 'data.link' or similar. 
            // Adjust based on actual API response structure if needed.
            // Assuming response: { status: 'success', data: { link: '...', id: '...' } }
            // Or simple { link_url: '...', ... } depending on exact endpoint

            // Fallback checking for common fields if exact structure is unknown
            const paymentUrl = mayarData.data?.link || mayarData.link_url || mayarData.url;

            if (!paymentUrl) {
                console.error("Unknown Mayar response structure", mayarData);
                throw new Error('Failed to retrieve payment URL from Mayar')
            }

            // Save payment record to database
            const { error: insertError } = await supabase.from('payments').insert({
                user_id: user.id,
                invoice_number: invoiceNumber,
                package_type: package_type,
                amount: amount,
                status: 'pending',
                provider: 'mayar',
                payment_link_id: mayarData.data?.id || mayarData.id,
                doku_payment_url: paymentUrl, // Reuse column for now, or add new 'payment_url' column
            })

            if (insertError) {
                console.error('Insert Error:', insertError)
                throw new Error(`Failed to save payment record: ${JSON.stringify(insertError)}`)
            }

            return new Response(
                JSON.stringify({
                    success: true,
                    payment_url: paymentUrl, // Return generic payment_url
                    invoice_number: invoiceNumber,
                    provider: 'mayar'
                }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200,
                }
            )
        }

        // ---------------------------------------------------------
        // DOKU PAYMENT FLOW (Legacy/Alternative)
        // ---------------------------------------------------------
        else {
            const requestId = crypto.randomUUID()
            // DOKU expects ISO 8601 without milliseconds (e.g. 2023-01-01T12:00:00Z)
            const timestamp = new Date().toISOString().split('.')[0] + 'Z'

            // Create DOKU request body
            const dokuBody = {
                order: {
                    amount: parseInt(String(amount)), // Ensure integer
                    invoice_number: invoiceNumber,
                    currency: 'IDR',
                    // DOKU requires HTTPS callback usually
                    callback_url: 'https://example.com/payment/success',
                    language: 'ID',
                },
                customer: {
                    id: user.id,
                    name: user.user_metadata?.full_name || 'Customer',
                    email: user.email,
                },
                additional_info: {
                    allow_payment_methods: ['Virtual Account'],
                }
            }

            const bodyString = JSON.stringify(dokuBody)
            const digest = await generateDigest(bodyString)

            // DEBUG LOGGING
            const componentSignature = `Client-Id:${DOKU_CLIENT_ID}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:/checkout/v1/payment\nDigest:${digest}`

            debugInfo.componentSignature = componentSignature;
            debugInfo.bodyString = bodyString;

            const signature = await generateSignature(
                DOKU_CLIENT_ID,
                requestId,
                timestamp,
                '/checkout/v1/payment',
                digest,
                DOKU_SECRET_KEY
            )

            debugInfo.signature = signature;

            // Call DOKU API
            const dokuResponse = await fetch(DOKU_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Client-Id': DOKU_CLIENT_ID,
                    'Request-Id': requestId,
                    'Request-Timestamp': timestamp,
                    'Signature': signature,
                },
                body: bodyString,
            })

            const dokuData = await dokuResponse.json()

            if (!dokuResponse.ok) {
                console.error('DOKU Error:', dokuData)
                return new Response(
                    JSON.stringify({
                        error: `DOKU Failed: ${JSON.stringify(dokuData)}`,
                        debug_info: debugInfo,
                        version: 'debug-v9-production'
                    }),
                    {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                        status: 400,
                    }
                )
            }

            // Save payment record to database
            const { error: insertError } = await supabase.from('payments').insert({
                user_id: user.id,
                invoice_number: invoiceNumber,
                package_type: package_type,
                amount: amount,
                status: 'pending',
                provider: 'doku',
                doku_payment_url: dokuData.response?.payment?.url,
            })

            if (insertError) {
                console.error('Insert Error:', insertError)
                throw new Error('Failed to save payment record')
            }

            return new Response(
                JSON.stringify({
                    success: true,
                    payment_url: dokuData.response?.payment?.url,
                    invoice_number: invoiceNumber,
                    provider: 'doku'
                }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200,
                }
            )
        }

    } catch (error: any) {
        console.error('Error:', error)
        return new Response(
            JSON.stringify({
                error: error.message,
                debug_info: error.debugInfo,
                version: 'mayar-v2'
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
