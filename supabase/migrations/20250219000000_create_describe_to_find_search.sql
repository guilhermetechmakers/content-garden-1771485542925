-- describe_to_find_search table (valid identifier; describe-to-find_search in spec used hyphen)
CREATE TABLE IF NOT EXISTS describe_to_find_search (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE describe_to_find_search ENABLE ROW LEVEL SECURITY;

CREATE POLICY "describe_to_find_search_read_own" ON describe_to_find_search
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "describe_to_find_search_insert_own" ON describe_to_find_search
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "describe_to_find_search_update_own" ON describe_to_find_search
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "describe_to_find_search_delete_own" ON describe_to_find_search
  FOR DELETE USING (auth.uid() = user_id);
