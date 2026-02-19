-- Seed Capture & Storage: seeds table schema.
-- Run against your Postgres/Supabase database and enable RLS for multi-tenant security.

CREATE TABLE IF NOT EXISTS seeds (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('link', 'note', 'voice', 'screenshot', 'image', 'audio', 'video')),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  extracted_bullets TEXT[] NOT NULL DEFAULT '{}',
  source_url TEXT,
  attachments JSONB NOT NULL DEFAULT '[]',
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seeds_user_id ON seeds(user_id);
CREATE INDEX IF NOT EXISTS idx_seeds_created_at ON seeds(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seeds_type ON seeds(type);

-- Row Level Security (RLS): users see only their own seeds.
ALTER TABLE seeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY seeds_select_own ON seeds
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY seeds_insert_own ON seeds
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY seeds_update_own ON seeds
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY seeds_delete_own ON seeds
  FOR DELETE USING (auth.uid()::text = user_id);

-- Optional: trigger to keep updated_at in sync.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER seeds_updated_at
  BEFORE UPDATE ON seeds
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
