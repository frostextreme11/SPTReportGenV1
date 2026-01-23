// Supabase Edge Function: create-payment-v2
// Uses Mayar Sandbox API or DOKU Sandbox API
// Deploy: npx supabase functions deploy create-payment-v2

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-token',
}

// ---------------------------------------------------------
// MAYAR CONFIGURATION (PRODUCTION/SANDBOX V2)
// ---------------------------------------------------------
const MAYAR_API_URL = 'https://api.mayar.id/hl/v1/payment/create'
const MAYAR_API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmOWM0Njc0MC1jOTc0LTRjMDUtOWM4MC03NDQ3YzZlM2IwNWIiLCJhY2NvdW50SWQiOiJkNjk5OWJmMi02ZDczLTQxYmUtYTNlYS0wMGU0NzdjNjM3NjEiLCJjcmVhdGVkQXQiOiIxNzY4ODgyMDUzMDM1Iiwicm9sZSI6ImRldmVsb3BlciIsInN1YiI6Im5vdmFuYWRpdHlhMTFAZ21haWwuY29tIiwibmFtZSI6IkZyb3N0Q29yZSIsImxpbmsiOiJkaWdpdGFsc3F1YWQiLCJpc1NlbGZEb21haW4iOm51bGwsImlhdCI6MTc2ODg4MjA1M30.LhZxlKT7Kd5RaQKl8IWYXDlaRPf0-GV8dweeis0jI1xmvjSwcpIEWdMbMIx5GyVBTBkis7fOt7VElhv4SYX-mJzmCWV4bTPnJ8k79c-1yNFnpIin8sN_qcSx1OEFFekloZ7fPNuZRqYaxCaPbYyqlCrKYekfmm7XRnVPq_p8YZDAJsvKHgd4QpP8U4XF8CRWdYGtpp6lOUJ0ijfWtc4rBTF-h8jfJScNfiYCm1MQZH7AMs5vLC-kzo-wKVlZ78SduMKP79TKsF35hsDWp75Z54RtPdOPSwrVVW17itCQTQZbw5md5hBee3KcNRI6kkWfFFG6XuKK3p3ZU-llJA74jA'

const VERIFICATION_SECRET = 'b3a5f974a4050a21e56fd9502dcb2b111bb02e1aa01ec7d1f34fd1b9e2a6f246d98337cb928a17de45a18c76665a3dcc1acd0f54af0e3a7e4c5a75fa7202c736'
const REDIRECT_BASE_URL = 'https://buatspt.vercel.app/payment_success'

// ---------------------------------------------------------
// DOKU CONFIGURATION (PRODUCTION)
// ---------------------------------------------------------
const DOKU_CLIENT_ID = 'BRN-0246-1759407773449'
const DOKU_SECRET_KEY = 'SK-DkDrAIUhTpb3oXphQJdp'
const DOKU_API_URL = 'https://api.doku.com/checkout/v1/payment'

// ---------------------------------------------------------
// HELPER FUNCTIONS
// ---------------------------------------------------------

/**
 * Generate HMAC-SHA256 signature for Mayar verification
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
 * Generate secure redirect URL with verification parameters for Mayar
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

/**
 * Generate DOKU Signature
 */
async function generateDokuSignature(clientId: string, requestId: string, timestamp: string, requestTarget: string, digest: string, secretKey: string): Promise<string> {
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

/**
 * Generate SHA256 Digest for DOKU
 */
async function generateDokuDigest(body: string): Promise<string> {
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
        console.log('--- START CREATE-PAYMENT-V2 ---')

        // Get auth
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
        const { package_type, amount, quota_amount, provider } = await req.json()

        if (!package_type || !amount) {
            throw new Error('Missing required fields: package_type and amount')
        }

        const selectedProvider = provider === 'doku' ? 'doku' : 'mayar_sandbox';
        console.log(`Processing payment for provider: ${selectedProvider}`)

        // Generate unique invoice number
        // SPT + Timestamp (shorter)
        const invoiceNumber = `INV${Date.now()}`
        console.log('Generated invoice number:', invoiceNumber)

        let paymentUrl = '';
        let paymentLinkId = '';
        let verificationData = {};

        // ----------------------------------------------------------------------
        // DOKU PROVIDER
        // ----------------------------------------------------------------------
        if (selectedProvider === 'doku') {
            // Start with a clean request ID and fresh timestamp
            const requestId = crypto.randomUUID()
            const timestamp = new Date().toISOString().split('.')[0] + 'Z'
            const requestTarget = '/checkout/v1/payment'

            // Set Redirect URL specific for DOKU Success
            const DOKU_REDIRECT_URL = `${REDIRECT_BASE_URL.replace('/payment_success', '')}/doku-payment-success?invoice_number=${invoiceNumber}`

            // Trim keys to be safe
            const cleanClientId = DOKU_CLIENT_ID.trim()
            const cleanSecretKey = DOKU_SECRET_KEY.trim()

            // Create DOKU request body - Basic Request + Callback URL
            const dokuBody = {
                order: {
                    amount: parseInt(String(amount)),
                    invoice_number: invoiceNumber,
                    callback_url: DOKU_REDIRECT_URL, // Auto-redirect after payment
                    auto_redirect: true, // This ensures user goes to our success page
                },
                payment: {
                    payment_due_date: 60 // 60 minutes
                }
            }

            const bodyString = JSON.stringify(dokuBody)

            // Generate Digest (SHA-256 Base64)
            const encoderText = new TextEncoder()
            const data = encoderText.encode(bodyString)
            const hashBuffer = await crypto.subtle.digest('SHA-256', data)
            const digest = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))

            // Prepare Signature Component exactly as per Node.js example
            let componentSignature = "Client-Id:" + cleanClientId;
            componentSignature += "\n";
            componentSignature += "Request-Id:" + requestId;
            componentSignature += "\n";
            componentSignature += "Request-Timestamp:" + timestamp;
            componentSignature += "\n";
            componentSignature += "Request-Target:" + requestTarget;
            // If body not send when access API with HTTP method GET/DELETE
            componentSignature += "\n";
            componentSignature += "Digest:" + digest;

            console.log('Component Signature To Sign:\n' + componentSignature)

            // Calculate HMAC-SHA256 base64
            const key = await crypto.subtle.importKey(
                'raw',
                encoderText.encode(cleanSecretKey),
                { name: 'HMAC', hash: 'SHA-256' },
                false,
                ['sign']
            )
            const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoderText.encode(componentSignature))
            const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
            const finalSignature = `HMACSHA256=${base64Signature}`

            // Debug data
            verificationData = {
                componentSignature,
                digest,
                requestId,
                timestamp,
                signatureFromServer: finalSignature
            }

            console.log('Sending DOKU request:', JSON.stringify(dokuBody))

            // Call DOKU API
            const dokuResponse = await fetch(DOKU_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Client-Id': cleanClientId,
                    'Request-Id': requestId,
                    'Request-Timestamp': timestamp,
                    'Signature': finalSignature,
                    // 'Digest': digest, // Removed Digest header
                },
                body: bodyString,
            })

            const dokuData = await dokuResponse.json()
            console.log('DOKU Response:', JSON.stringify(dokuData))

            if (!dokuResponse.ok || dokuData.error) {
                console.error('DOKU API Error:', dokuData)
                // Return detailed error for debugging
                throw new Error(`DOKU Failed: ${JSON.stringify(dokuData)} | Debug: ${JSON.stringify(verificationData)}`)
            }

            // Extract Payment URL
            paymentUrl = dokuData.response?.payment?.url
            paymentLinkId = dokuData.response?.payment?.token_id || '-'

            if (!paymentUrl) {
                throw new Error('Failed to retrieve payment URL from DOKU')
            }

        } else {
            // ----------------------------------------------------------------------
            // MAYAR PROVIDER (Default / Sandbox)
            // ----------------------------------------------------------------------

            // Generate secure redirect URL with verification parameters
            const { redirectUrl, timestamp, signature } = await generateSecureRedirectUrl(invoiceNumber)
            verificationData = { signature, timestamp }

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
            paymentUrl = mayarData.data?.link || mayarData.link_url || mayarData.url
            paymentLinkId = mayarData.data?.id || mayarData.id

            if (!paymentUrl) {
                console.error('Unknown Mayar response structure:', mayarData)
                throw new Error('Failed to retrieve payment URL from Mayar')
            }
        }

        console.log('Payment URL obtained:', paymentUrl)

        // Save payment record to database
        const { error: insertError } = await supabase.from('payments').insert({
            user_id: user.id,
            invoice_number: invoiceNumber,
            package_type: package_type,
            amount: amount,
            status: 'pending',
            provider: selectedProvider,
            payment_link_id: paymentLinkId,
            doku_payment_url: paymentUrl,
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
                provider: selectedProvider,
                redirect_url: verificationData?.redirectUrl || REDIRECT_BASE_URL,
                verification: verificationData,
                version: 'v2-combined'
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
                version: 'v2-combined'
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
