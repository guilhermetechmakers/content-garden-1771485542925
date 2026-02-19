-- runway_slots: slot model empty -> filled -> posted
CREATE TABLE IF NOT EXISTS runway_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL DEFAULT '09:00',
  status TEXT NOT NULL DEFAULT 'empty' CHECK (status IN ('empty', 'filled', 'posted')),
  post_id UUID,
  drop_post_id UUID,
  checklist JSONB DEFAULT '[]',
  post_notes TEXT,
  posted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_runway_slots_user_date ON runway_slots (user_id, date);

ALTER TABLE runway_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "runway_slots_read_own" ON runway_slots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "runway_slots_insert_own" ON runway_slots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "runway_slots_update_own" ON runway_slots
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "runway_slots_delete_own" ON runway_slots
  FOR DELETE USING (auth.uid() = user_id);
