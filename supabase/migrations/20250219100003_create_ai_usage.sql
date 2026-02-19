-- ai_usage: track AI credits and usage per user for quota/rate-limiting
CREATE TABLE IF NOT EXISTS ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  credits_used INT NOT NULL DEFAULT 1,
  provenance JSONB DEFAULT '[]',
  confidence DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON ai_usage (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created_at ON ai_usage (user_id, created_at);

ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_usage_read_own" ON ai_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ai_usage_insert_own" ON ai_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ai_credits: user quota/allowance (optional, for plan-based limits)
CREATE TABLE IF NOT EXISTS ai_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_remaining INT NOT NULL DEFAULT 100,
  credits_reset_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE ai_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_credits_read_own" ON ai_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ai_credits_update_own" ON ai_credits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "ai_credits_insert_own" ON ai_credits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
