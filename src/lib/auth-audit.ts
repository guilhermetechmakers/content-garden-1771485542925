import { supabase } from '@/lib/supabase'

type AuditAction =
  | 'sign_in'
  | 'sign_out'
  | 'sign_up'
  | 'password_reset_request'
  | 'password_reset_confirm'
  | 'email_verification_sent'
  | 'magic_link_sent'

/**
 * Log auth event to Edge Function for audit trail.
 * Fire-and-forget; does not block auth flow.
 */
export async function logAuthAudit(
  action: AuditAction,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await supabase.functions.invoke('auth-audit', {
      body: { action, metadata },
    })
  } catch {
    // Silently ignore audit failures
  }
}
