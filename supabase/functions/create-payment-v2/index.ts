// Supabase Edge Function: create-payment-v2
// Uses Mayar Sandbox API with URL-based verification (no webhook required)
// Deploy: npx supabase functions deploy create-payment-v2

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-token',
}

// MAYAR PRODUCTION Configuration
const MAYAR_API_URL = 'https://api.mayar.id/hl/v1/payment/create'
const MAYAR_API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmOWM0Njc0MC1jOTc0LTRjMDUtOWM4MC03NDQ3YzZlM2IwNWIiLCJhY2NvdW50SWQiOiJkNjk5OWJmMi02ZDczLTQxYmUtYTNlYS0wMGU0NzdjNjM3NjEiLCJjcmVhdGVkQXQiOiIxNzY4ODgyMDUzMDM1Iiwicm9sZSI6ImRldmVsb3BlciIsInN1YiI6Im5vdmFuYWRpdHlhMTFAZ21haWwuY29tIiwibmFtZSI6IkZyb3N0Q29yZSIsImxpbmsiOiJkaWdpdGFsc3F1YWQiLCJpc1NlbGZEb21haW4iOm51bGwsImlhdCI6MTc2ODg4MjA1M30.LhZxlKT7Kd5RaQKl8IWYXDlaRPf0-GV8dweeis0jI1xmvjSwcpIEWdMbMIx5GyVBTBkis7fOt7VElhv4SYX-mJzmCWV4bTPnJ8k79c-1yNFnpIin8sN_qcSx1OEFFekloZ7fPNuZRqYaxCaPbYyqlCrKYekfmm7XRnVPq_p8YZDAJsvKHgd4QpP8U4XF8CRWdYGtpp6lOUJ0ijfWtc4rBTF-h8jfJScNfiYCm1MQZH7AMs5vLC-kzo-wKVlZ78SduMKP79TKsF35hsDWp75Z54RtPdOPSwrVVW17itCQTQZbw5md5hBee3KcNRI6kkWfFFG6XuKK3p3ZU-llJA74jA'

// Secret key for generating verification signatures (using webhook token)
const VERIFICATION_SECRET = 'b3a5f974a4050a21e56fd9502dcb2b111bb02e1aa01ec7d1f34fd1b9e2a6f246d98337cb928a17de45a18c76665a3dcc1acd0f54af0e3a7e4c5a75fa7202c736'

// Redirect URL base (PRODUCTION)
const REDIRECT_BASE_URL = 'https://buatspt.vercel.app/payment_success'

/**
 * Generate HMAC-SHA256 signature for verification
 * @param invoiceNumber - Unique invoice identifier
 * @param timestamp - Unix timestamp
 * @param secretKey - Secret key for HMAC
 * @returns Base64 encoded signature
 */
async function generateVerificationSignature(
    invoiceNumber: string,
    timestamp: number,
    secretKey: string
): Promise<string> {
    const message = `${invoiceNumber}:${timestamp}`
    const encoder = new TextEncoder()

    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secretKey),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    )

    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(message)
    )

    // Convert to URL-safe base64
    const base64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Generate secure redirect URL with verification parameters
 */
async function generateSecureRedirectUrl(invoiceNumber: string): Promise<{
    redirectUrl: string,
    timestamp: number,
    signature: string
}> {
    const timestamp = Math.floor(Date.now() / 1000) // Unix timestamp in seconds
    const signature = await generateVerificationSignature(invoiceNumber, timestamp, VERIFICATION_SECRET)

    const redirectUrl = `${REDIRECT_BASE_URL}?invoice_number=${encodeURIComponent(invoiceNumber)}&signature=${encodeURIComponent(signature)}&timestamp=${timestamp}`

    return { redirectUrl, timestamp, signature }
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log('--- START CREATE-PAYMENT-V2 (SANDBOX) ---')

        // Get auth: Try custom header first (to bypass Gateway 401), then standard Auth header
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

        // Validate token
        const { data: { user }, error: userError } = await supabase.auth.getUser(token)

        if (userError || !user) {
            console.error('Auth error:', userError)
            throw new Error('Unauthorized')
        }

        console.log('User authenticated:', user.id)

        // Parse request body
        const { package_type, amount, quota_amount } = await req.json()

        if (!package_type || !amount) {
            throw new Error('Missing required fields: package_type and amount')
        }

        console.log('Payment request:', { package_type, amount, quota_amount })

        // Generate unique invoice number
        // SPT + Timestamp + Random Chars
        const invoiceNumber = `SPT${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        console.log('Generated invoice number:', invoiceNumber)

        // Generate secure redirect URL with verification parameters
        const { redirectUrl, timestamp, signature } = await generateSecureRedirectUrl(invoiceNumber)
        console.log('Generated redirect URL:', redirectUrl)

        // Prepare Mayar request body
        const mayarBody = {
            name: user.user_metadata?.full_name || 'Customer',
            email: user.email,
            amount: parseInt(String(amount)),
            mobile: user.user_metadata?.phone || '081234567890',
            redirectUrl: redirectUrl,
            description: `Payment for ${package_type} - Invoice ${invoiceNumber}`,
        }

        console.log('Mayar request body:', JSON.stringify(mayarBody))

        // Call Mayar Sandbox API
        const mayarResponse = await fetch(MAYAR_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MAYAR_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mayarBody)
        })

        const mayarData = await mayarResponse.json()
        console.log('Mayar response:', mayarData)

        if (!mayarResponse.ok) {
            console.error('Mayar API error:', mayarData)
            throw new Error(`Mayar Failed: ${JSON.stringify(mayarData)}`)
        }

        // Extract payment URL from Mayar response
        const paymentUrl = mayarData.data?.link || mayarData.link_url || mayarData.url

        if (!paymentUrl) {
            console.error('Unknown Mayar response structure:', mayarData)
            throw new Error('Failed to retrieve payment URL from Mayar')
        }

        console.log('Payment URL:', paymentUrl)

        // Save payment record to database (matching existing table structure)
        // First try with minimal fields that we know exist
        const { error: insertError } = await supabase.from('payments').insert({
            user_id: user.id,
            invoice_number: invoiceNumber,
            package_type: package_type,
            amount: amount,
            status: 'pending',
            provider: 'mayar_sandbox',
            payment_link_id: mayarData.data?.id || mayarData.id,
            doku_payment_url: paymentUrl, // Reuse existing column for payment URL
        })

        if (insertError) {
            console.error('Database insert error:', insertError)
            throw new Error(`Failed to save payment record: ${JSON.stringify(insertError)}`)
        }

        console.log('Payment record saved successfully')
        console.log('--- END CREATE-PAYMENT-V2 ---')

        return new Response(
            JSON.stringify({
                success: true,
                payment_url: paymentUrl,
                invoice_number: invoiceNumber,
                provider: 'mayar_sandbox',
                redirect_url: redirectUrl,
                verification: {
                    signature: signature,
                    timestamp: timestamp,
                },
                version: 'v2-sandbox'
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error: any) {
        console.error('Error in create-payment-v2:', error)
        return new Response(
            JSON.stringify({
                error: error.message,
                version: 'v2-sandbox'
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
