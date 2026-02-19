-- drops: bundle of 3-10 posts from a Canvas
CREATE TABLE IF NOT EXISTS drops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  canvas_id UUID,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'exported')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drops_user_id ON drops (user_id);
CREATE INDEX IF NOT EXISTS idx_drops_canvas_id ON drops (canvas_id);

ALTER TABLE drops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "drops_read_own" ON drops
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "drops_insert_own" ON drops
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "drops_update_own" ON drops
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "drops_delete_own" ON drops
  FOR DELETE USING (auth.uid() = user_id);

-- drop_posts: individual posts in a Drop (Hook, Value, Example, CTA)
CREATE TABLE IF NOT EXISTS drop_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drop_id UUID NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  hook TEXT NOT NULL DEFAULT '',
  value TEXT NOT NULL DEFAULT '',
  example TEXT NOT NULL DEFAULT '',
  cta TEXT NOT NULL DEFAULT '',
  variants JSONB DEFAULT '{}',
  asset_urls TEXT[] DEFAULT '{}',
  seed_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drop_posts_drop_id ON drop_posts (drop_id);

ALTER TABLE drop_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "drop_posts_read_via_drop" ON drop_posts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM drops d WHERE d.id = drop_id AND d.user_id = auth.uid())
  );

CREATE POLICY "drop_posts_insert_via_drop" ON drop_posts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM drops d WHERE d.id = drop_id AND d.user_id = auth.uid())
  );

CREATE POLICY "drop_posts_update_via_drop" ON drop_posts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM drops d WHERE d.id = drop_id AND d.user_id = auth.uid())
  );

CREATE POLICY "drop_posts_delete_via_drop" ON drop_posts
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM drops d WHERE d.id = drop_id AND d.user_id = auth.uid())
  );
