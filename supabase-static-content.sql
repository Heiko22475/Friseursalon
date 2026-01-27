-- Create static_content table for legal pages (Impressum, Datenschutz, etc.)
CREATE TABLE IF NOT EXISTS static_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id INTEGER DEFAULT 1,
  title TEXT NOT NULL DEFAULT 'Untitled',
  content TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_static_content_instance ON static_content(instance_id);

-- Enable RLS
ALTER TABLE static_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Allow public read access on static_content" ON static_content;
DROP POLICY IF EXISTS "Allow authenticated users to manage static_content" ON static_content;

CREATE POLICY "Allow public read access on static_content"
ON static_content FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated users to manage static_content"
ON static_content FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add new building block type for static content
INSERT INTO building_blocks (block_type, block_name, description, can_repeat) VALUES
  ('static-content', 'Statischer Inhalt', 'Für Impressum, Datenschutz, etc.', true)
ON CONFLICT (block_type) DO NOTHING;
