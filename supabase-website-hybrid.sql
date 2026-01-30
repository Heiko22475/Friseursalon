-- =====================================================
-- HYBRID ARCHITECTURE: websites table with JSONB
-- Media Files bleiben in separaten Tabellen
-- =====================================================

-- 1. Neue websites Tabelle erstellen
CREATE TABLE IF NOT EXISTS websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id VARCHAR(6) UNIQUE NOT NULL CHECK (customer_id ~ '^[0-9]{6}$'),
  
  -- Häufig abgefragte Felder als Spalten
  site_name TEXT NOT NULL DEFAULT 'Meine Website',
  is_published BOOLEAN DEFAULT false,
  
  -- Alle Content-Daten als JSONB
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_websites_customer_id ON websites(customer_id);
CREATE INDEX IF NOT EXISTS idx_websites_content ON websites USING GIN (content);

-- RLS Policies
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on websites" ON websites;
DROP POLICY IF EXISTS "Allow authenticated users to manage websites" ON websites;

CREATE POLICY "Allow public read access on websites"
  ON websites FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to manage websites"
  ON websites FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Update Trigger
DROP TRIGGER IF EXISTS update_websites_updated_at ON websites;

CREATE TRIGGER update_websites_updated_at 
  BEFORE UPDATE ON websites 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STOCK PHOTOS (shared across all customers)
-- =====================================================
CREATE TABLE IF NOT EXISTS stock_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  category TEXT NOT NULL, -- 'gallery', 'hero', 'team', 'service', etc.
  tags TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stock_photos_category ON stock_photos(category);
CREATE INDEX IF NOT EXISTS idx_stock_photos_tags ON stock_photos USING GIN (tags);

-- RLS Policies (public read access for all)
ALTER TABLE stock_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on stock_photos" ON stock_photos;
DROP POLICY IF EXISTS "Allow authenticated users to manage stock_photos" ON stock_photos;

CREATE POLICY "Allow public read access on stock_photos"
  ON stock_photos FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to manage stock_photos"
  ON stock_photos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- USER MEDIA (customer-specific backup + synced to JSON)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id VARCHAR(6) NOT NULL REFERENCES websites(customer_id) ON DELETE CASCADE,
  
  -- Media Type: 'gallery_image', 'team_photo', 'hero_image', 'service_image'
  media_type TEXT NOT NULL,
  
  -- Storage
  url TEXT NOT NULL,
  storage_path TEXT, -- Path in Supabase Storage
  
  -- Metadata
  caption TEXT,
  alt_text TEXT,
  title TEXT,
  
  -- Ordering & Status
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Additional metadata (for flexible extensions)
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_media_customer_id ON user_media(customer_id);
CREATE INDEX IF NOT EXISTS idx_user_media_type ON user_media(media_type);
CREATE INDEX IF NOT EXISTS idx_user_media_order ON user_media(customer_id, media_type, display_order);

-- RLS Policies
ALTER TABLE user_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on user_media" ON user_media;
DROP POLICY IF EXISTS "Allow authenticated users to manage user_media" ON user_media;

CREATE POLICY "Allow public read access on user_media"
  ON user_media FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to manage user_media"
  ON user_media FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Update Trigger
DROP TRIGGER IF EXISTS update_user_media_updated_at ON user_media;

CREATE TRIGGER update_user_media_updated_at 
  BEFORE UPDATE ON user_media 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DATEN MIGRATION
-- =====================================================

-- Migriere Daten von site_settings und anderen Tabellen ins JSONB
DO $$
DECLARE
  v_customer_id VARCHAR(6);
  v_site_name TEXT;
  v_header_type TEXT;
  v_content JSONB;
BEGIN
  -- Hole customer_id und site_name aus site_settings (oder OLDsite_settings falls bereits migriert)
  BEGIN
    SELECT customer_id, site_name, header_type 
    INTO v_customer_id, v_site_name, v_header_type
    FROM site_settings 
    LIMIT 1;
  EXCEPTION WHEN undefined_table THEN
    SELECT customer_id, site_name, header_type 
    INTO v_customer_id, v_site_name, v_header_type
    FROM OLDsite_settings 
    LIMIT 1;
  END;

  -- Falls kein customer_id, setze Default
  IF v_customer_id IS NULL THEN
    v_customer_id := '000000';
  END IF;
  
  IF v_site_name IS NULL THEN
    v_site_name := 'Meine Website';
  END IF;

  -- Baue JSONB Content (mit pages oder OLDpages)
  BEGIN
    v_content := jsonb_build_object(
      'site_settings', jsonb_build_object(
        'header_type', COALESCE(v_header_type, 'simple'),
        'theme', jsonb_build_object(
          'primary_color', '#e11d48',
          'font_family', 'Inter'
        )
      ),
      
      'pages', COALESCE(
        (SELECT jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'title', p.title,
            'slug', p.slug,
            'is_home', p.is_home,
            'is_published', COALESCE(p.is_enabled, true),
            'show_in_menu', true,
            'meta_description', p.meta_description,
            'seo_title', NULL,
            'display_order', p.display_order,
            'created_at', p.created_at,
            'updated_at', p.updated_at,
            'blocks', COALESCE(
              (SELECT jsonb_agg(
                jsonb_build_object(
                  'id', pb.id,
                  'type', pb.block_type,
                  'position', pb.display_order,
                  'config', COALESCE(pb.config, '{}'::jsonb),
                  'content', '{}'::jsonb,
                  'created_at', pb.created_at
                ) ORDER BY pb.display_order
              ) FROM page_blocks pb WHERE pb.page_id = p.id),
              '[]'::jsonb
            )
          ) ORDER BY p.display_order
        ) FROM pages p),
        '[]'::jsonb
      ),
    
    'services', COALESCE(
        (SELECT jsonb_agg(
          jsonb_build_object(
            'id', s.id,
            'name', s.title,
            'description', COALESCE(s.description, ''),
            'price', '',
            'duration', 0,
            'category', COALESCE(s.icon, ''),
            'is_featured', false,
            'display_order', s.display_order
          ) ORDER BY s.display_order
        ) FROM services s),
        '[]'::jsonb
      ),
      
      'contact', COALESCE(
        (SELECT jsonb_build_object(
          'phone', phone,
          'email', email,
          'street', street,
          'postal_code', '',
          'city', city,
          'country', '',
          'instagram', instagram,
          'facebook_url', NULL,
          'instagram_url', instagram_url,
          'google_maps_url', NULL
        ) FROM contact LIMIT 1),
        '{}'::jsonb
      ),
      
      'hours', COALESCE(
        (SELECT jsonb_build_object(
          'tuesday', tuesday,
          'wednesday', wednesday,
          'thursday', thursday,
          'friday', friday,
          'saturday', saturday
        ) FROM hours LIMIT 1),
        '{}'::jsonb
      ),
      
      'business_hours', '[]'::jsonb,
      
      'reviews', COALESCE(
        (SELECT jsonb_agg(
          jsonb_build_object(
            'id', r.id,
            'author_name', r.name,
            'rating', r.rating,
            'review_text', COALESCE(r.text, ''),
            'review_date', COALESCE(r.date, ''),
            'is_featured', false
          ) ORDER BY r.display_order
        ) FROM reviews r),
        '[]'::jsonb
      ),
      
      'about', COALESCE(
        (SELECT jsonb_build_object(
          'title', COALESCE(title, ''),
          'content', COALESCE(description, ''),
          'team_title', '',
          'team', '[]'::jsonb
        ) FROM about LIMIT 1),
        '{}'::jsonb
      ),
      
      'gallery', COALESCE(
        (SELECT jsonb_build_object(
          'images', COALESCE(
            (SELECT jsonb_agg(
              jsonb_build_object(
                'id', g.id,
                'url', g.image_url,
                'alt_text', '',
                'caption', '',
                'display_order', g.display_order
              ) ORDER BY g.display_order
            ) FROM gallery g),
            '[]'::jsonb
          )
        )),
        '{"images": []}'::jsonb
      ),
      
      'static_content', jsonb_build_object(
        'imprint', '',
        'privacy', '',
        'terms', ''
      )
    );
  EXCEPTION WHEN undefined_table THEN
    -- Falls Tabellen bereits umbenannt wurden, nutze OLD* Tabellen
    v_content := jsonb_build_object(
      'site_settings', jsonb_build_object(
        'header_type', COALESCE(v_header_type, 'simple'),
        'theme', jsonb_build_object(
          'primary_color', '#e11d48',
          'font_family', 'Inter'
        )
      ),
      
      'pages', COALESCE(
        (SELECT jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'title', p.title,
            'slug', p.slug,
            'is_home', p.is_home,
            'is_published', COALESCE(p.is_enabled, true),
            'show_in_menu', true,
            'meta_description', p.meta_description,
            'seo_title', NULL,
            'display_order', p.display_order,
            'created_at', p.created_at,
            'updated_at', p.updated_at,
            'blocks', COALESCE(
              (SELECT jsonb_agg(
                jsonb_build_object(
                  'id', pb.id,
                  'type', pb.block_type,
                  'position', pb.display_order,
                  'config', COALESCE(pb.config, '{}'::jsonb),
                  'content', '{}'::jsonb,
                  'created_at', pb.created_at
                ) ORDER BY pb.display_order
              ) FROM OLDpage_blocks pb WHERE pb.page_id = p.id),
              '[]'::jsonb
            )
          ) ORDER BY p.display_order
        ) FROM OLDpages p),
        '[]'::jsonb
      ),
      
      'services', COALESCE(
        (SELECT jsonb_agg(
          jsonb_build_object(
            'id', s.id,
            'name', s.title,
            'description', COALESCE(s.description, ''),
            'price', '',
            'duration', 0,
            'category', COALESCE(s.icon, ''),
            'is_featured', false,
            'display_order', s.display_order
          ) ORDER BY s.display_order
        ) FROM OLDservices s),
        '[]'::jsonb
      ),
      
      'contact', COALESCE(
        (SELECT jsonb_build_object(
          'phone', phone,
          'email', email,
          'street', street,
          'postal_code', '',
          'city', city,
          'country', '',
          'instagram', instagram,
          'facebook_url', NULL,
          'instagram_url', instagram_url,
          'google_maps_url', NULL
        ) FROM OLDcontact LIMIT 1),
        '{}'::jsonb
      ),
      
      'hours', COALESCE(
        (SELECT jsonb_build_object(
          'tuesday', tuesday,
          'wednesday', wednesday,
          'thursday', thursday,
          'friday', friday,
          'saturday', saturday
        ) FROM OLDhours LIMIT 1),
        '{}'::jsonb
      ),
      
      'business_hours', '[]'::jsonb,
      
      'reviews', COALESCE(
        (SELECT jsonb_agg(
          jsonb_build_object(
            'id', r.id,
            'author_name', r.name,
            'rating', r.rating,
            'review_text', COALESCE(r.text, ''),
            'review_date', COALESCE(r.date, ''),
            'is_featured', false
          ) ORDER BY r.display_order
        ) FROM OLDreviews r),
        '[]'::jsonb
      ),
      
      'about', COALESCE(
        (SELECT jsonb_build_object(
          'title', COALESCE(title, ''),
          'content', COALESCE(description, ''),
          'team_title', '',
          'team', '[]'::jsonb
        ) FROM OLDabout LIMIT 1),
        '{}'::jsonb
      ),
      
      'gallery', COALESCE(
        (SELECT jsonb_build_object(
          'images', COALESCE(
            (SELECT jsonb_agg(
              jsonb_build_object(
                'id', g.id,
                'url', g.image_url,
                'alt_text', '',
                'caption', '',
                'display_order', g.display_order
              ) ORDER BY g.display_order
            ) FROM OLDgallery g),
            '[]'::jsonb
          )
        )),
        '{"images": []}'::jsonb
      ),
      
      'static_content', jsonb_build_object(
        'imprint', '',
        'privacy', '',
        'terms', ''
      )
    );
  END;
  -- Insert oder Update
  INSERT INTO websites (customer_id, site_name, is_published, content)
  VALUES (v_customer_id, v_site_name, true, v_content)
  ON CONFLICT (customer_id) 
  DO UPDATE SET 
    site_name = EXCLUDED.site_name,
    content = EXCLUDED.content,
    updated_at = NOW();

  -- Migriere Gallery Daten in user_media als Backup
  BEGIN
    INSERT INTO user_media (customer_id, media_type, url, caption, alt_text, display_order)
    SELECT 
      v_customer_id,
      'gallery_image',
      g.image_url,
      '',
      '',
      g.display_order
    FROM gallery g
    ON CONFLICT DO NOTHING;
  EXCEPTION WHEN undefined_table THEN
    INSERT INTO user_media (customer_id, media_type, url, caption, alt_text, display_order)
    SELECT 
      v_customer_id,
      'gallery_image',
      g.image_url,
      '',
      '',
      g.display_order
    FROM OLDgallery g
    ON CONFLICT DO NOTHING;
  END;

  RAISE NOTICE 'Migration completed for customer_id: %', v_customer_id;
  RAISE NOTICE 'User media backup created from gallery table';
END $$;

-- =====================================================
-- RENAME OLD TABLES
-- =====================================================

-- Benenne alte Tabellen um (werden nicht mehr verwendet)
ALTER TABLE IF EXISTS pages RENAME TO OLDpages;
ALTER TABLE IF EXISTS page_blocks RENAME TO OLDpage_blocks;
ALTER TABLE IF EXISTS services RENAME TO OLDservices;
ALTER TABLE IF EXISTS contact RENAME TO OLDcontact;
ALTER TABLE IF EXISTS hours RENAME TO OLDhours;
ALTER TABLE IF EXISTS reviews RENAME TO OLDreviews;
ALTER TABLE IF EXISTS about RENAME TO OLDabout;
ALTER TABLE IF EXISTS gallery RENAME TO OLDgallery;
ALTER TABLE IF EXISTS site_settings RENAME TO OLDsite_settings;

-- =====================================================
-- NOTIZEN
-- =====================================================
COMMENT ON TABLE websites IS 'Hybrid-Architektur: customer_id + site_name als Spalten, Content als JSONB';
COMMENT ON COLUMN websites.content IS 'JSONB mit allen Website-Daten: pages, blocks, services, contact, hours, reviews, about, gallery, static_content';
COMMENT ON COLUMN websites.site_name IS 'Häufig abgefragt - daher als Spalte';
COMMENT ON COLUMN websites.is_published IS 'Status für Veröffentlichung';

COMMENT ON TABLE stock_photos IS 'Vordefinierte Stock-Fotos für Templates - geteilt zwischen allen Kunden';
COMMENT ON TABLE user_media IS 'Backup-Tabelle für kundespezifische Medien - wird mit JSONB synchronisiert';
COMMENT ON COLUMN user_media.media_type IS 'gallery_image, team_photo, hero_image, service_image, etc.';

-- Media Files bleiben in eigenen Tabellen:
-- - media_categories
-- - media_folders  
-- - media_files (Mediathek)
