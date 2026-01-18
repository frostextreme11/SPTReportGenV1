// Supabase Edge Function: doku-webhook
// Deploy this to Supabase Edge Functions
// This handles DOKU payment notifications

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Initialize Supabase client with service role
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Parse webhook payload
        const payload = await req.json()
        console.log('DOKU Webhook received:', JSON.stringify(payload))

        // Extract relevant data from DOKU notification
        // Note: The exact structure depends on DOKU's webhook format
        const invoiceNumber = payload.order?.invoice_number || payload.invoice_number
        const transactionStatus = payload.transaction?.status || payload.status

        if (!invoiceNumber) {
            console.error('No invoice number in payload')
            return new Response(JSON.stringify({ error: 'Invalid payload' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        // Find the payment record
        const { data: payment, error: findError } = await supabase
            .from('payments')
            .select('*')
            .eq('invoice_number', invoiceNumber)
            .single()

        if (findError || !payment) {
            console.error('Payment not found:', invoiceNumber)
            return new Response(JSON.stringify({ error: 'Payment not found' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 404,
            })
        }

        // Check if payment is successful
        const isSuccess = transactionStatus === 'SUCCESS' ||
            transactionStatus === 'PAID' ||
            transactionStatus === 'success' ||
            transactionStatus === 'paid'

        if (isSuccess && payment.status !== 'success') {
            // Update payment status
            const { error: updateError } = await supabase
                .from('payments')
                .update({
                    status: 'success',
                    paid_at: new Date().toISOString(),
                })
                .eq('id', payment.id)

            if (updateError) {
                console.error('Failed to update payment:', updateError)
                throw updateError
            }

            // Determine quota amount based on package type
            const quotaAmount = payment.package_type === '5_quota' ? 5 : 1

            // Update user's quota balance
            const { error: profileError } = await supabase.rpc('increment_quota', {
                user_id_input: payment.user_id,
                amount_input: quotaAmount,
            })

            if (profileError) {
                console.error('Failed to update quota:', profileError)
                // Try direct update as fallback
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('quota_balance')
                    .eq('id', payment.user_id)
                    .single()

                if (profile) {
                    await supabase
                        .from('profiles')
                        .update({ quota_balance: (profile.quota_balance || 0) + quotaAmount })
                        .eq('id', payment.user_id)
                }
            }

            // Log the quota transaction
            await supabase.from('quota_transactions').insert({
                user_id: payment.user_id,
                transaction_type: 'purchase',
                amount: quotaAmount,
                payment_id: payment.id,
            })

            console.log(`Payment ${invoiceNumber} successful, added ${quotaAmount} quota to user ${payment.user_id}`)
        }

        // Return success response (DOKU expects 200 OK)
        return new Response(
            JSON.stringify({ success: true }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Webhook Error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            }
        )
    }
})
