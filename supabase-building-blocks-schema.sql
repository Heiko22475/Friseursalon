-- Create pages table for multi-page support
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  is_home BOOLEAN DEFAULT false,
  is_enabled BOOLEAN DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create building_blocks table for available block types
CREATE TABLE IF NOT EXISTS building_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_type TEXT UNIQUE NOT NULL, -- 'hero', 'services', 'about', 'gallery', 'reviews', 'pricing', 'hours', 'contact'
  block_name TEXT NOT NULL,
  description TEXT,
  is_available BOOLEAN DEFAULT true,
  can_repeat BOOLEAN DEFAULT true, -- If false, can only be used once per page
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create page_blocks table for block instances on pages
CREATE TABLE IF NOT EXISTS page_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL, -- Reference to building_blocks.block_type
  block_instance_id INTEGER DEFAULT 1, -- To differentiate multiple instances of same block
  is_enabled BOOLEAN DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  config JSONB DEFAULT '{}', -- Block-specific configuration
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create site_settings table for header type and global settings
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  header_type TEXT DEFAULT 'single-page', -- 'single-page' or 'multi-page'
  site_name TEXT DEFAULT 'Friseursalon Sarah Soriano',
  logo_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default building blocks
INSERT INTO building_blocks (block_type, block_name, description, can_repeat) VALUES
  ('hero', 'Hero Section', 'Main banner with call-to-action', false),
  ('services', 'Services', 'Display services grid', true),
  ('about', 'About', 'About section with highlights', false),
  ('gallery', 'Gallery', 'Image gallery', true),
  ('reviews', 'Reviews', 'Customer testimonials', true),
  ('pricing', 'Pricing', 'Price list', true),
  ('hours', 'Opening Hours', 'Business hours', false),
  ('contact', 'Contact', 'Contact information', false)
ON CONFLICT (block_type) DO NOTHING;

-- Insert default home page
INSERT INTO pages (slug, title, is_home, display_order) VALUES
  ('home', 'Home', true, 0)
ON CONFLICT (slug) DO NOTHING;

-- Insert default page blocks for home page
INSERT INTO page_blocks (page_id, block_type, block_instance_id, display_order)
SELECT 
  p.id,
  bb.block_type,
  1 as block_instance_id,
  ROW_NUMBER() OVER (ORDER BY 
    CASE bb.block_type
      WHEN 'hero' THEN 1
      WHEN 'services' THEN 2
      WHEN 'about' THEN 3
      WHEN 'gallery' THEN 4
      WHEN 'reviews' THEN 5
      WHEN 'pricing' THEN 6
      WHEN 'hours' THEN 7
      WHEN 'contact' THEN 8
    END
  ) - 1 as display_order
FROM pages p
CROSS JOIN building_blocks bb
WHERE p.slug = 'home'
  AND NOT EXISTS (
    SELECT 1 FROM page_blocks WHERE page_id = p.id
  );

-- Insert default site settings
INSERT INTO site_settings (header_type, site_name)
VALUES ('single-page', 'Friseursalon Sarah Soriano')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE building_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access on pages" ON pages;
DROP POLICY IF EXISTS "Allow authenticated users to manage pages" ON pages;
DROP POLICY IF EXISTS "Allow public read access on building_blocks" ON building_blocks;
DROP POLICY IF EXISTS "Allow authenticated users to manage building_blocks" ON building_blocks;
DROP POLICY IF EXISTS "Allow public read access on page_blocks" ON page_blocks;
DROP POLICY IF EXISTS "Allow authenticated users to manage page_blocks" ON page_blocks;
DROP POLICY IF EXISTS "Allow public read access on site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow authenticated users to update site_settings" ON site_settings;

-- RLS Policies for pages
CREATE POLICY "Allow public read access on pages"
ON pages FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated users to manage pages"
ON pages FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- RLS Policies for building_blocks
CREATE POLICY "Allow public read access on building_blocks"
ON building_blocks FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated users to manage building_blocks"
ON building_blocks FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- RLS Policies for page_blocks
CREATE POLICY "Allow public read access on page_blocks"
ON page_blocks FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated users to manage page_blocks"
ON page_blocks FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- RLS Policies for site_settings
CREATE POLICY "Allow public read access on site_settings"
ON site_settings FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated users to update site_settings"
ON site_settings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_order ON pages(display_order);
CREATE INDEX IF NOT EXISTS idx_page_blocks_page_id ON page_blocks(page_id);
CREATE INDEX IF NOT EXISTS idx_page_blocks_order ON page_blocks(page_id, display_order);
CREATE INDEX IF NOT EXISTS idx_building_blocks_type ON building_blocks(block_type);
