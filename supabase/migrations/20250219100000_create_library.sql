-- library table (archive of published content and repurpose)
CREATE TABLE IF NOT EXISTS library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "library_read_own" ON library
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "library_insert_own" ON library
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "library_update_own" ON library
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "library_delete_own" ON library
  FOR DELETE USING (auth.uid() = user_id);

-- library_published_items: thumbnails, platform, date, performance metrics
CREATE TABLE IF NOT EXISTS library_published_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id UUID REFERENCES library(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  platform TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  thumbnail_url TEXT,
  asset_type TEXT NOT NULL DEFAULT 'text' CHECK (asset_type IN ('image', 'video', 'text', 'carousel')),
  performance_metrics JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  source_drop_id UUID,
  runway_slot_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE library_published_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "library_published_items_read_own" ON library_published_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "library_published_items_insert_own" ON library_published_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "library_published_items_update_own" ON library_published_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "library_published_items_delete_own" ON library_published_items
  FOR DELETE USING (auth.uid() = user_id);

-- library_assets: images, videos, files with usage provenance
CREATE TABLE IF NOT EXISTS library_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id UUID REFERENCES library(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'file')),
  url TEXT NOT NULL,
  usage_provenance TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE library_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "library_assets_read_own" ON library_assets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "library_assets_insert_own" ON library_assets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "library_assets_update_own" ON library_assets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "library_assets_delete_own" ON library_assets
  FOR DELETE USING (auth.uid() = user_id);
