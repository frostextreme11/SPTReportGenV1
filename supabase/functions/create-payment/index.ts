// Supabase Edge Function: create-payment
// Deploy this to Supabase Edge Functions

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-token',
}

// DOKU Sandbox Configuration
const DOKU_CLIENT_ID = 'BRN-0224-1759408646518'
const DOKU_SECRET_KEY = 'SK-QHqUQtCsHFUBGtm8KSkl'
const DOKU_API_URL = 'https://api-sandbox.doku.com/checkout/v1/payment'

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
        const { package_type, amount, quota_amount } = await req.json()

        if (!package_type || !amount) {
            throw new Error('Missing required fields')
        }

        // Generate unique invoice number
        const invoiceNumber = `SPT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        const requestId = crypto.randomUUID()
        const timestamp = new Date().toISOString()

        // Create DOKU request body
        const dokuBody = {
            order: {
                amount: amount,
                invoice_number: invoiceNumber,
                currency: 'IDR',
                callback_url: `${Deno.env.get('PUBLIC_URL') || 'http://localhost:5173'}/payment/success`,
                callback_url_cancel: `${Deno.env.get('PUBLIC_URL') || 'http://localhost:5173'}/payment/cancel`,
                language: 'ID',
                auto_redirect: true,
            },
            customer: {
                id: user.id,
                name: user.user_metadata?.full_name || 'Customer',
                email: user.email,
            },
            additional_info: {
                allow_payment_methods: ['QRIS', 'VIRTUAL_ACCOUNT', 'EMONEY', 'CREDIT_CARD'],
            }
        }

        const bodyString = JSON.stringify(dokuBody)
        const digest = await generateDigest(bodyString)

        // DEBUG LOGGING
        const componentSignature = `Client-Id:${DOKU_CLIENT_ID}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:/checkout/v1/payment\nDigest:${digest}`
        console.log('--- DOKU DEBUG ---')
        console.log('Component Signature To Sign:\n', componentSignature)
        console.log('DOKU Body:', bodyString)

        const signature = await generateSignature(
            DOKU_CLIENT_ID,
            requestId,
            timestamp,
            '/checkout/v1/payment',
            digest,
            DOKU_SECRET_KEY
        )

        console.log('Generated Signature:', signature)
        console.log('--- END DEBUG ---')

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
            throw new Error(`DOKU Failed: ${JSON.stringify(dokuData)}`)
        }

        // Save payment record to database
        const { error: insertError } = await supabase.from('payments').insert({
            user_id: user.id,
            invoice_number: invoiceNumber,
            package_type: package_type,
            amount: amount,
            status: 'pending',
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
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
