// Supabase Edge Function: use-quota
// Deploy this to Supabase Edge Functions
// This handles unlocking download access for a report

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
        // Get auth header
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('Missing authorization header')
        }

        // Initialize Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Get user from token
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: userError } = await supabase.auth.getUser(token)

        if (userError || !user) {
            throw new Error('Unauthorized')
        }

        // Parse request body
        const { report_id } = await req.json()

        if (!report_id) {
            throw new Error('Missing report_id')
        }

        // Get user's profile and quota balance
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('quota_balance')
            .eq('id', user.id)
            .single()

        if (profileError || !profile) {
            throw new Error('Profile not found')
        }

        if (profile.quota_balance < 1) {
            return new Response(
                JSON.stringify({ success: false, message: 'Kuota tidak mencukupi' }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400,
                }
            )
        }

        // Verify the report belongs to the user
        const { data: report, error: reportError } = await supabase
            .from('tax_reports')
            .select('id, user_id, is_download_unlocked')
            .eq('id', report_id)
            .single()

        if (reportError || !report) {
            throw new Error('Report not found')
        }

        if (report.user_id !== user.id) {
            throw new Error('Unauthorized access to report')
        }

        if (report.is_download_unlocked) {
            return new Response(
                JSON.stringify({ success: true, message: 'Download sudah terbuka' }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200,
                }
            )
        }

        // Deduct quota
        const { error: updateProfileError } = await supabase
            .from('profiles')
            .update({ quota_balance: profile.quota_balance - 1 })
            .eq('id', user.id)

        if (updateProfileError) {
            throw new Error('Failed to deduct quota')
        }

        // Unlock the report download
        const { error: updateReportError } = await supabase
            .from('tax_reports')
            .update({ is_download_unlocked: true })
            .eq('id', report_id)

        if (updateReportError) {
            // Rollback quota deduction
            await supabase
                .from('profiles')
                .update({ quota_balance: profile.quota_balance })
                .eq('id', user.id)
            throw new Error('Failed to unlock report')
        }

        // Log the quota transaction
        await supabase.from('quota_transactions').insert({
            user_id: user.id,
            transaction_type: 'usage',
            amount: -1,
            report_id: report_id,
        })

        return new Response(
            JSON.stringify({ success: true, message: 'Download berhasil dibuka' }),
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
