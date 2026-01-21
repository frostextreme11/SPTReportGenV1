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

/**
 * Verify HMAC-SHA256 signature
 */
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

// Package type to quota mapping
const PACKAGE_QUOTA_MAP: Record<string, number> = {
    '1_quota': 1,
    '5_quota': 5,
    // Add more package types as needed
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

        // Initialize Supabase client with service role for admin operations
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Validate user token
        const { data: { user }, error: userError } = await supabase.auth.getUser(token)

        if (userError || !user) {
            console.error('Auth error:', userError)
            throw new Error('Unauthorized')
        }

        console.log('User authenticated:', user.id)

        // Parse request body
        const { invoice_number, signature, timestamp } = await req.json()

        if (!invoice_number || !signature || !timestamp) {
            throw new Error('Missing required fields: invoice_number, signature, timestamp')
        }

        console.log('Verifying payment:', { invoice_number, signature, timestamp })

        // Verify signature
        const isValidSignature = await verifySignature(
            invoice_number,
            parseInt(timestamp),
            signature,
            VERIFICATION_SECRET
        )

        if (!isValidSignature) {
            console.error('Invalid signature')
            throw new Error('Invalid payment signature')
        }

        console.log('Signature verified successfully')

        // Check timestamp expiry (24 hours max)
        const now = Math.floor(Date.now() / 1000)
        const paymentTimestamp = parseInt(timestamp)
        const maxAge = 24 * 60 * 60 // 24 hours in seconds

        if (now - paymentTimestamp > maxAge) {
            console.error('Payment verification expired')
            throw new Error('Payment verification has expired')
        }

        // Find the payment record
        const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .select('*')
            .eq('invoice_number', invoice_number)
            .eq('user_id', user.id)
            .single()

        if (paymentError || !payment) {
            console.error('Payment not found:', paymentError)
            throw new Error('Payment not found')
        }

        console.log('Found payment:', payment)

        // Check if already processed
        if (payment.status === 'completed') {
            console.log('Payment already completed, returning success')
            return new Response(
                JSON.stringify({
                    success: true,
                    message: 'Payment already processed',
                    already_processed: true,
                    version: 'verify-v2'
                }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200,
                }
            )
        }

        // Determine quota amount from package type
        const quotaAmount = PACKAGE_QUOTA_MAP[payment.package_type] || 1
        console.log('Quota to add:', quotaAmount)

        // Get current user profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('quota_balance')
            .eq('id', user.id)
            .single()

        if (profileError) {
            console.error('Profile error:', profileError)
            throw new Error('Failed to get user profile')
        }

        const currentQuota = profile?.quota_balance || 0
        const newQuota = currentQuota + quotaAmount

        console.log(`Updating quota: ${currentQuota} -> ${newQuota}`)

        // Update payment status to completed
        const { error: updatePaymentError } = await supabase
            .from('payments')
            .update({ status: 'completed' })
            .eq('id', payment.id)

        if (updatePaymentError) {
            console.error('Failed to update payment status:', updatePaymentError)
            throw new Error('Failed to update payment status')
        }

        // Update user quota
        const { error: updateQuotaError } = await supabase
            .from('profiles')
            .update({ quota_balance: newQuota })
            .eq('id', user.id)

        if (updateQuotaError) {
            console.error('Failed to update quota:', updateQuotaError)
            throw new Error('Failed to update quota')
        }

        console.log('Payment verified and quota updated successfully')
        console.log('--- END VERIFY-PAYMENT-V2 ---')

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Payment verified and quota added',
                quota_added: quotaAmount,
                new_quota_balance: newQuota,
                version: 'verify-v2'
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error: any) {
        console.error('Error in verify-payment-v2:', error)
        return new Response(
            JSON.stringify({
                error: error.message,
                version: 'verify-v2'
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
