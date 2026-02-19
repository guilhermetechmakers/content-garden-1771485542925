-- seeds: captured inputs (note, link, voice, screenshot, etc.) for Content Garden
-- Model: id, user_id, type, title, content, tags, extracted_bullets, source_url, attachments, created_at
CREATE TABLE IF NOT EXISTS seeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('link', 'note', 'voice', 'screenshot', 'image', 'audio', 'video')),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  extracted_bullets TEXT[] DEFAULT '{}',
  source_url TEXT,
  attachments JSONB DEFAULT '[]',
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  triage_status TEXT CHECK (triage_status IN ('kept', 'ignored')),
  merged_into_id UUID REFERENCES seeds(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seeds_user_id ON seeds (user_id);
CREATE INDEX IF NOT EXISTS idx_seeds_created_at ON seeds (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seeds_type ON seeds (type);
CREATE INDEX IF NOT EXISTS idx_seeds_triage_status ON seeds (triage_status);
CREATE INDEX IF NOT EXISTS idx_seeds_merged_into ON seeds (merged_into_id);
CREATE INDEX IF NOT EXISTS idx_seeds_tags ON seeds USING GIN (tags);

ALTER TABLE seeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seeds_read_own" ON seeds
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "seeds_insert_own" ON seeds
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "seeds_update_own" ON seeds
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "seeds_delete_own" ON seeds
  FOR DELETE USING (auth.uid() = user_id);
