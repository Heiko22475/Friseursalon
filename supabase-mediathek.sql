-- =====================================================
-- MEDIATHEK - Database Schema
-- Phase 1: MVP mit 4 Kategorien und Ordnerstruktur
-- =====================================================

-- 1. Medienbereiche (4 Kategorien)
CREATE TABLE IF NOT EXISTS media_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL, -- 'images', 'videos', 'stockphotos', 'documents'
  display_name TEXT NOT NULL, -- 'Bilder', 'Videos', 'Stockfotos', 'Dokumente'
  icon TEXT, -- Lucide icon name
  bucket_name TEXT NOT NULL, -- 'media-customer' or 'media-stock'
  max_file_size INTEGER NOT NULL, -- in bytes (10MB or 50MB)
  allowed_mime_types TEXT[], -- e.g. ['image/jpeg', 'image/png']
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Ordner-Struktur (nur 1 Ebene für Phase 1)
CREATE TABLE IF NOT EXISTS media_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES media_categories(id) ON DELETE CASCADE,
  parent_folder_id UUID REFERENCES media_folders(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  path TEXT NOT NULL, -- Full storage path: e.g. "123456/images" or "stock/images"
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, name, parent_folder_id)
);

-- 3. Medien-Dateien
CREATE TABLE IF NOT EXISTS media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID REFERENCES media_folders(id) ON DELETE CASCADE,
  category_id UUID REFERENCES media_categories(id) ON DELETE CASCADE,
  
  -- File info
  filename TEXT NOT NULL, -- Storage filename: "<customerid>_<title-slug>_<random>.jpg"
  original_filename TEXT NOT NULL,
  file_url TEXT NOT NULL, -- Full Supabase Storage URL
  storage_path TEXT NOT NULL, -- Path in bucket: "123456/images/123456_logo_abc123.jpg"
  
  file_type TEXT NOT NULL, -- 'image', 'video', 'document'
  file_size INTEGER NOT NULL, -- in bytes
  mime_type TEXT NOT NULL,
  
  -- Metadaten
  title TEXT,
  alt_text TEXT,
  description TEXT,
  tags TEXT[], -- Array für spätere Suche
  
  -- Bild/Video-spezifisch
  width INTEGER,
  height INTEGER,
  duration INTEGER, -- Sekunden (für Videos)
  thumbnail_url TEXT, -- Auto-generated thumbnail
  
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES für Performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_media_folders_category ON media_folders(category_id);
CREATE INDEX IF NOT EXISTS idx_media_folders_parent ON media_folders(parent_folder_id);
CREATE INDEX IF NOT EXISTS idx_media_files_folder ON media_files(folder_id);
CREATE INDEX IF NOT EXISTS idx_media_files_category ON media_files(category_id);
CREATE INDEX IF NOT EXISTS idx_media_files_tags ON media_files USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_media_files_created ON media_files(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE media_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access on media_categories" ON media_categories;
DROP POLICY IF EXISTS "Allow public read access on media_folders" ON media_folders;
DROP POLICY IF EXISTS "Allow public read access on media_files" ON media_files;
DROP POLICY IF EXISTS "Allow authenticated users to manage media_categories" ON media_categories;
DROP POLICY IF EXISTS "Allow authenticated users to manage media_folders" ON media_folders;
DROP POLICY IF EXISTS "Allow authenticated users to manage media_files" ON media_files;

-- Public read access
CREATE POLICY "Allow public read access on media_categories"
  ON media_categories FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access on media_folders"
  ON media_folders FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access on media_files"
  ON media_files FOR SELECT TO public USING (true);

-- Authenticated users can manage
CREATE POLICY "Allow authenticated users to manage media_categories"
  ON media_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage media_folders"
  ON media_folders FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage media_files"
  ON media_files FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- UPDATE TRIGGERS
-- =====================================================
DROP TRIGGER IF EXISTS update_media_folders_updated_at ON media_folders;
DROP TRIGGER IF EXISTS update_media_files_updated_at ON media_files;

CREATE TRIGGER update_media_folders_updated_at 
  BEFORE UPDATE ON media_folders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_files_updated_at 
  BEFORE UPDATE ON media_files 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert 4 Kategorien
INSERT INTO media_categories (name, display_name, icon, bucket_name, max_file_size, allowed_mime_types) VALUES
  ('images', 'Bilder', 'Image', 'media-customer', 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']),
  ('videos', 'Videos', 'Video', 'media-customer', 52428800, ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo']),
  ('stockphotos', 'Stockfotos', 'Palette', 'media-stock', 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']),
  ('documents', 'Dokumente', 'FileText', 'media-customer', 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (name) DO NOTHING;

-- Vordefinierte Ordnerstruktur (basierend auf Customer-ID aus site_settings)
DO $$
DECLARE
  customer_id TEXT;
  images_cat_id UUID;
  videos_cat_id UUID;
  stock_cat_id UUID;
  docs_cat_id UUID;
BEGIN
  -- Get customer_id from site_settings
  SELECT COALESCE(site_settings.customer_id, '000000') INTO customer_id FROM site_settings LIMIT 1;
  
  -- Get category IDs
  SELECT id INTO images_cat_id FROM media_categories WHERE name = 'images';
  SELECT id INTO videos_cat_id FROM media_categories WHERE name = 'videos';
  SELECT id INTO stock_cat_id FROM media_categories WHERE name = 'stockphotos';
  SELECT id INTO docs_cat_id FROM media_categories WHERE name = 'documents';
  
  -- Create folders for customer media (in media-customer bucket)
  INSERT INTO media_folders (category_id, parent_folder_id, name, path) VALUES
    -- Bilder
    (images_cat_id, NULL, 'Salon', customer_id || '/images'),
    (images_cat_id, NULL, 'Team', customer_id || '/images'),
    (images_cat_id, NULL, 'Vorher-Nachher', customer_id || '/images'),
    (images_cat_id, NULL, 'Events', customer_id || '/images'),
    
    -- Videos
    (videos_cat_id, NULL, 'Salon', customer_id || '/videos'),
    (videos_cat_id, NULL, 'Tutorials', customer_id || '/videos'),
    
    -- Dokumente
    (docs_cat_id, NULL, 'Preislisten', customer_id || '/docs')
  ON CONFLICT DO NOTHING;
  
  -- Create folders for stock media (in media-stock bucket)
  INSERT INTO media_folders (category_id, parent_folder_id, name, path) VALUES
    (stock_cat_id, NULL, 'Hintergründe', 'stock/images'),
    (stock_cat_id, NULL, 'Salon', 'stock/images'),
    (stock_cat_id, NULL, 'Icons', 'stock/images'),
    (stock_cat_id, NULL, 'Logos', 'stock/images'),
    (stock_cat_id, NULL, 'Frisuren', 'stock/images')
  ON CONFLICT DO NOTHING;
END $$;

-- =====================================================
-- NOTES
-- =====================================================
COMMENT ON TABLE media_categories IS 'Vier Hauptkategorien: Bilder, Videos, Stockfotos, Dokumente';
COMMENT ON TABLE media_folders IS 'Ordnerstruktur - Phase 1: nur eine Ebene';
COMMENT ON TABLE media_files IS 'Alle hochgeladenen Dateien mit Metadaten';
COMMENT ON COLUMN media_files.filename IS 'Storage filename: <customerid>_<title-slug>_<random>.ext für customer, <category>_<random>.ext für stock';
COMMENT ON COLUMN media_files.storage_path IS 'Full path in bucket: 123456/images/file.jpg oder stock/images/file.jpg';
