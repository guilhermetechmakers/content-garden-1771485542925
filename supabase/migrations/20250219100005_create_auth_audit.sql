-- Auth audit log for sign-in, sign-out, password reset, etc.
CREATE TABLE IF NOT EXISTS auth_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_audit_user_id ON auth_audit_log (user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_created_at ON auth_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_audit_action ON auth_audit_log (action);

ALTER TABLE auth_audit_log ENABLE ROW LEVEL SECURITY;

-- Service role can insert (via Edge Function or backend)
-- Users can read their own audit entries
CREATE POLICY "auth_audit_read_own" ON auth_audit_log
  FOR SELECT USING (auth.uid() = user_id);

-- Allow service role to insert (handled by backend/Edge Function)
-- For now, allow authenticated users to insert their own (client-side audit)
CREATE POLICY "auth_audit_insert_own" ON auth_audit_log
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
