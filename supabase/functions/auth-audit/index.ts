// Auth Audit Logging — Supabase Edge Function
// Logs sign-in, sign-out, password_reset, etc. for audit trail.
// Client calls via supabase.functions.invoke('auth-audit', { body: { action, metadata? } })
// Server-side only; captures IP and user agent.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type AuditAction =
  | 'sign_in'
  | 'sign_out'
  | 'sign_up'
  | 'password_reset_request'
  | 'password_reset_confirm'
  | 'email_verification_sent'
  | 'magic_link_sent'

interface AuditRequestBody {
  action: AuditAction
  metadata?: Record<string, unknown>
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '').trim()
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ message: 'Auth audit not configured' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = (await req.json().catch(() => ({}))) as AuditRequestBody
    const { action, metadata = {} } = body

    if (!action || !['sign_in', 'sign_out', 'sign_up', 'password_reset_request', 'password_reset_confirm', 'email_verification_sent', 'magic_link_sent'].includes(action)) {
      return new Response(
        JSON.stringify({ message: 'Valid action required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let userId: string | null = null
    if (token) {
      const supabase = createClient(supabaseUrl, supabaseKey)
      const { data: { user } } = await supabase.auth.getUser(token)
      userId = user?.id ?? null
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? null
    const userAgent = req.headers.get('user-agent') ?? null

    const supabase = createClient(supabaseUrl, supabaseKey)
    const { error } = await supabase.from('auth_audit_log').insert({
      user_id: userId,
      action,
      metadata: { ...metadata },
      ip_address: ip,
      user_agent: userAgent,
    })

    if (error) {
      return new Response(
        JSON.stringify({ message: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(
      JSON.stringify({ message: e instanceof Error ? e.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
