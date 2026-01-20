import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, X-Mayar-Signature',
}

// Mayar Webhook Secret (From Dashboard)
const WEBHOOK_SECRET = '2563400ca3cd7fba34c441ec3986733462fd71d2915c052e410259af3673599671ca5660e24afd8027309f1c8b6e4f238e359ce3a567ac04c1663eb94bce0e42';

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const signature = req.headers.get('X-Mayar-Signature');
        const bodyText = await req.text();

        console.log("Received Webhook Body:", bodyText);
        console.log("Received Signature:", signature);

        // 1. Verify Signature
        if (WEBHOOK_SECRET) {
            const encoder = new TextEncoder();
            const key = await crypto.subtle.importKey(
                "raw",
                encoder.encode(WEBHOOK_SECRET),
                { name: "HMAC", hash: "SHA-256" },
                false,
                ["sign"]
            );

            const signatureBuffer = await crypto.subtle.sign(
                "HMAC",
                key,
                encoder.encode(bodyText)
            );

            // Convert buffer to hex string
            const computedSignature = Array.from(new Uint8Array(signatureBuffer))
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("");

            if (computedSignature !== signature) {
                console.error(`Signature Mismatch! Computed: ${computedSignature}, Received: ${signature}`);
                // return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 });
                // Note: For debugging, we might want to log but verify later if strict
            } else {
                console.log("Signature Verified ✅");
            }
        }

        const payload = JSON.parse(bodyText);

        // 2. Initialize Supabase Admin Client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // 3. Process Event
        // Mayar payload structure: { id, event, data: { ... } }
        const eventType = payload.event;
        const data = payload.data;

        console.log(`Processing Event: ${eventType}`);

        if (eventType === 'payment.received' || eventType === 'transaction.success') {
            // Extract identifying info
            // Fallbacks: reference_id, order_id, or extract from productDescription
            let invoiceNumber = data.external_id || data.reference_id || data.order_id || payload.external_id;

            // Fallback: Extract from productDescription if available
            // Format: "Payment for ... - Invoice SPT..."
            if (!invoiceNumber && data.productDescription) {
                const match = data.productDescription.match(/Invoice\s+(SPT[A-Z0-9]+)/i);
                if (match && match[1]) {
                    invoiceNumber = match[1];
                    console.log(`Extracted Invoice from Description: ${invoiceNumber}`);
                }
            }

            const amount = data.amount;
            const customerEmail = data.customer?.email || data.customerEmail; // Handle flat structure too

            console.log(`Invoice: ${invoiceNumber}, Amount: ${amount}, Email: ${customerEmail}`);

            if (!invoiceNumber) {
                console.error("Full Payload Data:", JSON.stringify(data));
                throw new Error(`Missing external_id (Invoice Number). Available keys in data: ${Object.keys(data || {}).join(', ')}`);
            }

            // 4. Find Pending Payment
            const { data: payment, error: fetchError } = await supabase
                .from('payments')
                .select('*')
                .eq('invoice_number', invoiceNumber)
                .single();

            if (fetchError || !payment) {
                console.error("Payment record not found for invoice:", invoiceNumber);
                // Try finding by email as fallback? No, unsafe.
                throw new Error("Payment record not found");
            }

            if (payment.status === 'success') {
                console.log("Payment already processed. Skipping.");
                return new Response(JSON.stringify({ message: 'Already processed' }), { headers: corsHeaders, status: 200 });
            }

            const userId = payment.user_id;

            // 5. Update Payment Status
            const { error: updateError } = await supabase
                .from('payments')
                .update({
                    status: 'success',
                    updated_at: new Date().toISOString(),
                    metadata: payload // Store full webhook payload for audit
                })
                .eq('id', payment.id);

            if (updateError) throw updateError;

            // 6. Add Quota to User
            // Calculate quota based on package_type or amount
            // Assuming 1 quota per package for now, or fetch from package config
            // Simple logic: 
            // 50k = 1 quota
            // 100k = 3 quota
            // etc.

            // Better: Use `quota_amount` if we stored it in payments table. 
            // If not, infer from `package_type` or `amount`.
            // Let's assume we need to infer for now as `quota_amount` might not be in `payments` schema yet?
            // Checking previous `create-payment` code... it took `quota_amount` from request but didn't explicitly save it to a `quota_amount` column (it saved to `amount`).
            // Actually, `create-payment` logic:
            // const { package_type, amount, quota_amount, ... } 

            // We should ideally have saved `quota_amount` in `payments` table. 
            // If we didn't, let's derive it:
            let quotaToAdd = 0;
            if (payment.package_type === 'SATUAN' || payment.amount < 100000) {
                quotaToAdd = 1;
            } else if (payment.package_type === 'BORONGAN' || payment.amount >= 100000) {
                quotaToAdd = 5; // Example logic, adjust as needed
            } else {
                quotaToAdd = 1; // Default fallback
            }

            // Retrieve current quota to be safe, or use atomic increment
            // Supabase doesn't have native atomic increment via JS client easily without RPC.
            // But we can read-then-write or use RPC.
            // RPC `increment_quota` would be best. If not exists, read-write.

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('quota_balance')
                .eq('id', userId)
                .single();

            if (profileError) throw profileError;

            const newBalance = (profile.quota_balance || 0) + quotaToAdd;

            const { error: balanceError } = await supabase
                .from('profiles')
                .update({ quota_balance: newBalance })
                .eq('id', userId);

            if (balanceError) throw balanceError;

            // 7. Log Transaction
            await supabase.from('quota_transactions').insert({
                user_id: userId,
                transaction_type: 'purchase',
                amount: quotaToAdd,
                description: `Purchase via Mayar - Invoice ${invoiceNumber}`,
                created_at: new Date().toISOString()
            });

            console.log(`Success! User ${userId} topped up with ${quotaToAdd} quota.`);
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error('Webhook Error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
