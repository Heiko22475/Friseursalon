-- =====================================================
-- COMPLETE SUPABASE SCHEMA
-- Run this file to set up the entire database
-- Generated: 2026-01-27
-- =====================================================

-- =====================================================
-- 1. CORE TABLES - Multi-Page CMS Structure
-- =====================================================

-- Create pages table for multi-page support
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  is_home BOOLEAN DEFAULT false,
  is_enabled BOOLEAN DEFAULT true,
  is_system_page BOOLEAN DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create building_blocks table for available block types
CREATE TABLE IF NOT EXISTS building_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_type TEXT UNIQUE NOT NULL,
  block_name TEXT NOT NULL,
  description TEXT,
  is_available BOOLEAN DEFAULT true,
  can_repeat BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create page_blocks table for block instances on pages
CREATE TABLE IF NOT EXISTS page_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL,
  block_instance_id INTEGER DEFAULT 1,
  is_enabled BOOLEAN DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create site_settings table for header type and global settings
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  header_type TEXT DEFAULT 'single-page',
  site_name TEXT DEFAULT 'Friseursalon Sarah Soriano',
  logo_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create static_content table for legal pages (Impressum, Datenschutz, etc.)
CREATE TABLE IF NOT EXISTS static_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id INTEGER DEFAULT 1,
  title TEXT NOT NULL DEFAULT 'Untitled',
  content TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create existing content tables
CREATE TABLE IF NOT EXISTS general (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  tagline TEXT,
  motto TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  street VARCHAR(255),
  city VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  instagram VARCHAR(100),
  instagram_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tuesday VARCHAR(100),
  wednesday VARCHAR(100),
  thursday VARCHAR(100),
  friday VARCHAR(100),
  saturday VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services_section (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  date VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS about (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255),
  description TEXT,
  highlight TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(255) NOT NULL,
  service VARCHAR(255) NOT NULL,
  price VARCHAR(50),
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255),
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. ADD INSTANCE SUPPORT TO EXISTING TABLES
-- =====================================================

-- Update gallery table
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS instance_id INTEGER DEFAULT 1;

-- Update services table  
ALTER TABLE services ADD COLUMN IF NOT EXISTS instance_id INTEGER DEFAULT 1;

-- Update services_section table
ALTER TABLE services_section ADD COLUMN IF NOT EXISTS instance_id INTEGER DEFAULT 1;

-- Update reviews table
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS instance_id INTEGER DEFAULT 1;

-- Update pricing table
ALTER TABLE pricing ADD COLUMN IF NOT EXISTS instance_id INTEGER DEFAULT 1;

-- =====================================================
-- 3. CREATE INDEXES
-- =====================================================

-- Pages indexes
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_order ON pages(display_order);

-- Page blocks indexes
CREATE INDEX IF NOT EXISTS idx_page_blocks_page_id ON page_blocks(page_id);
CREATE INDEX IF NOT EXISTS idx_page_blocks_order ON page_blocks(page_id, display_order);

-- Building blocks indexes
CREATE INDEX IF NOT EXISTS idx_building_blocks_type ON building_blocks(block_type);

-- Static content indexes
CREATE INDEX IF NOT EXISTS idx_static_content_instance ON static_content(instance_id);

-- Instance ID indexes
CREATE INDEX IF NOT EXISTS idx_gallery_instance ON gallery(instance_id);
CREATE INDEX IF NOT EXISTS idx_services_instance ON services(instance_id);
CREATE INDEX IF NOT EXISTS idx_services_section_instance ON services_section(instance_id);
CREATE INDEX IF NOT EXISTS idx_reviews_instance ON reviews(instance_id);
CREATE INDEX IF NOT EXISTS idx_pricing_instance ON pricing(instance_id);

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE building_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE static_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE general ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact ENABLE ROW LEVEL SECURITY;
ALTER TABLE hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE services_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE about ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CREATE RLS POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access on pages" ON pages;
DROP POLICY IF EXISTS "Allow authenticated users to manage pages" ON pages;
DROP POLICY IF EXISTS "Allow public read access on building_blocks" ON building_blocks;
DROP POLICY IF EXISTS "Allow authenticated users to manage building_blocks" ON building_blocks;
DROP POLICY IF EXISTS "Allow public read access on page_blocks" ON page_blocks;
DROP POLICY IF EXISTS "Allow authenticated users to manage page_blocks" ON page_blocks;
DROP POLICY IF EXISTS "Allow public read access on site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow authenticated users to update site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow public read access on static_content" ON static_content;
DROP POLICY IF EXISTS "Allow authenticated users to manage static_content" ON static_content;
DROP POLICY IF EXISTS "Allow public read access on services_section" ON services_section;
DROP POLICY IF EXISTS "Allow authenticated users to manage services_section" ON services_section;
DROP POLICY IF EXISTS "Jeder kann general lesen" ON general;
DROP POLICY IF EXISTS "Authentifizierte können general schreiben" ON general;
DROP POLICY IF EXISTS "Jeder kann contact lesen" ON contact;
DROP POLICY IF EXISTS "Authentifizierte können contact schreiben" ON contact;
DROP POLICY IF EXISTS "Jeder kann hours lesen" ON hours;
DROP POLICY IF EXISTS "Authentifizierte können hours schreiben" ON hours;
DROP POLICY IF EXISTS "Jeder kann services lesen" ON services;
DROP POLICY IF EXISTS "Authentifizierte können services schreiben" ON services;
DROP POLICY IF EXISTS "Jeder kann reviews lesen" ON reviews;
DROP POLICY IF EXISTS "Authentifizierte können reviews schreiben" ON reviews;
DROP POLICY IF EXISTS "Jeder kann about lesen" ON about;
DROP POLICY IF EXISTS "Authentifizierte können about schreiben" ON about;
DROP POLICY IF EXISTS "Jeder kann pricing lesen" ON pricing;
DROP POLICY IF EXISTS "Authentifizierte können pricing schreiben" ON pricing;
DROP POLICY IF EXISTS "Jeder kann gallery lesen" ON gallery;
DROP POLICY IF EXISTS "Authentifizierte können gallery schreiben" ON gallery;

-- Pages policies
CREATE POLICY "Allow public read access on pages"
ON pages FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to manage pages"
ON pages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Building blocks policies
CREATE POLICY "Allow public read access on building_blocks"
ON building_blocks FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to manage building_blocks"
ON building_blocks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Page blocks policies
CREATE POLICY "Allow public read access on page_blocks"
ON page_blocks FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to manage page_blocks"
ON page_blocks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Site settings policies
CREATE POLICY "Allow public read access on site_settings"
ON site_settings FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to update site_settings"
ON site_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Static content policies
CREATE POLICY "Allow public read access on static_content"
ON static_content FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to manage static_content"
ON static_content FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Services section policies
CREATE POLICY "Allow public read access on services_section"
ON services_section FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to manage services_section"
ON services_section FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- General policies
CREATE POLICY "Jeder kann general lesen" ON general FOR SELECT USING (true);
CREATE POLICY "Authentifizierte können general schreiben" ON general FOR ALL USING (auth.role() = 'authenticated');

-- Contact policies
CREATE POLICY "Jeder kann contact lesen" ON contact FOR SELECT USING (true);
CREATE POLICY "Authentifizierte können contact schreiben" ON contact FOR ALL USING (auth.role() = 'authenticated');

-- Hours policies
CREATE POLICY "Jeder kann hours lesen" ON hours FOR SELECT USING (true);
CREATE POLICY "Authentifizierte können hours schreiben" ON hours FOR ALL USING (auth.role() = 'authenticated');

-- Services policies
CREATE POLICY "Jeder kann services lesen" ON services FOR SELECT USING (true);
CREATE POLICY "Authentifizierte können services schreiben" ON services FOR ALL USING (auth.role() = 'authenticated');

-- Reviews policies
CREATE POLICY "Jeder kann reviews lesen" ON reviews FOR SELECT USING (true);
CREATE POLICY "Authentifizierte können reviews schreiben" ON reviews FOR ALL USING (auth.role() = 'authenticated');

-- About policies
CREATE POLICY "Jeder kann about lesen" ON about FOR SELECT USING (true);
CREATE POLICY "Authentifizierte können about schreiben" ON about FOR ALL USING (auth.role() = 'authenticated');

-- Pricing policies
CREATE POLICY "Jeder kann pricing lesen" ON pricing FOR SELECT USING (true);
CREATE POLICY "Authentifizierte können pricing schreiben" ON pricing FOR ALL USING (auth.role() = 'authenticated');

-- Gallery policies
CREATE POLICY "Jeder kann gallery lesen" ON gallery FOR SELECT USING (true);
CREATE POLICY "Authentifizierte können gallery schreiben" ON gallery FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 6. INSERT DEFAULT DATA
-- =====================================================

-- Insert default building blocks (all repeatable)
INSERT INTO building_blocks (block_type, block_name, description, can_repeat) VALUES
  ('hero', 'Hero Section', 'Main banner with call-to-action', true),
  ('services', 'Services', 'Display services grid', true),
  ('about', 'About', 'About section with highlights', true),
  ('gallery', 'Gallery', 'Image gallery', true),
  ('reviews', 'Reviews', 'Customer testimonials', true),
  ('pricing', 'Pricing', 'Price list', true),
  ('hours', 'Opening Hours', 'Business hours', true),
  ('contact', 'Contact', 'Contact information', true),
  ('static-content', 'Statischer Inhalt', 'Für Impressum, Datenschutz, etc.', true)
ON CONFLICT (block_type) DO UPDATE SET can_repeat = true;

-- Insert default home page
INSERT INTO pages (slug, title, is_home, display_order) VALUES
  ('home', 'Home', true, 0)
ON CONFLICT (slug) DO NOTHING;

-- Insert system pages (Impressum & Datenschutz)
INSERT INTO pages (slug, title, is_home, is_enabled, display_order, is_system_page)
VALUES 
  ('impressum', 'Impressum', false, true, 999, true),
  ('datenschutz', 'Datenschutz', false, true, 999, true)
ON CONFLICT (slug) DO UPDATE SET is_system_page = true;

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
  AND bb.block_type != 'static-content'
  AND NOT EXISTS (
    SELECT 1 FROM page_blocks WHERE page_id = p.id
  );

-- Insert default site settings
INSERT INTO site_settings (header_type, site_name)
VALUES ('single-page', 'Friseursalon Sarah Soriano')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 7. CREATE LEGAL PAGES WITH CONTENT
-- =====================================================

DO $$
DECLARE
    impressum_page_id UUID;
    datenschutz_page_id UUID;
    impressum_instance_id INT;
    datenschutz_instance_id INT;
BEGIN
    -- Get page IDs
    SELECT id INTO impressum_page_id FROM pages WHERE slug = 'impressum';
    SELECT id INTO datenschutz_page_id FROM pages WHERE slug = 'datenschutz';
    
    -- Calculate next instance IDs
    SELECT COALESCE(MAX(block_instance_id::integer), 0) + 1 INTO impressum_instance_id 
    FROM page_blocks WHERE block_type = 'static-content';
    
    SELECT COALESCE(MAX(block_instance_id::integer), 0) + 2 INTO datenschutz_instance_id 
    FROM page_blocks WHERE block_type = 'static-content';
    
    -- Add static-content block to Impressum page
    INSERT INTO page_blocks (page_id, block_type, block_instance_id, display_order)
    SELECT impressum_page_id, 'static-content', impressum_instance_id, 0
    WHERE NOT EXISTS (
        SELECT 1 FROM page_blocks WHERE page_id = impressum_page_id AND block_type = 'static-content'
    );
    
    -- Add static-content block to Datenschutz page
    INSERT INTO page_blocks (page_id, block_type, block_instance_id, display_order)
    SELECT datenschutz_page_id, 'static-content', datenschutz_instance_id, 0
    WHERE NOT EXISTS (
        SELECT 1 FROM page_blocks WHERE page_id = datenschutz_page_id AND block_type = 'static-content'
    );
    
    -- Create default content for Impressum
    INSERT INTO static_content (instance_id, title, content)
    SELECT impressum_instance_id, 'Impressum', '<h2>Angaben gemäß § 5 TMG</h2><p>Hier Ihre Firmendaten eintragen...</p>'
    WHERE NOT EXISTS (
        SELECT 1 FROM static_content WHERE instance_id = impressum_instance_id
    );
    
    -- Create default content for Datenschutz
    INSERT INTO static_content (instance_id, title, content)
    SELECT datenschutz_instance_id, 'Datenschutzerklärung', '<h2>Datenschutz</h2><p>Hier Ihre Datenschutzerklärung eintragen...</p>'
    WHERE NOT EXISTS (
        SELECT 1 FROM static_content WHERE instance_id = datenschutz_instance_id
    );
END $$;

-- =====================================================
-- 8. AUTOMATIC UPDATED_AT TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at
CREATE TRIGGER update_general_updated_at BEFORE UPDATE ON general 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_updated_at BEFORE UPDATE ON contact 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hours_updated_at BEFORE UPDATE ON hours 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_section_updated_at BEFORE UPDATE ON services_section 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_about_updated_at BEFORE UPDATE ON about 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pricing_updated_at BEFORE UPDATE ON pricing 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gallery_updated_at BEFORE UPDATE ON gallery 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_page_blocks_updated_at BEFORE UPDATE ON page_blocks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_static_content_updated_at BEFORE UPDATE ON static_content 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SCHEMA SETUP COMPLETE
-- =====================================================
