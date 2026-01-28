-- Add is_system_page flag to pages table
ALTER TABLE pages ADD COLUMN IF NOT EXISTS is_system_page BOOLEAN DEFAULT false;

-- Create or update Impressum page
INSERT INTO pages (slug, title, is_home, is_enabled, display_order, is_system_page)
VALUES ('impressum', 'Impressum', false, true, 999, true)
ON CONFLICT (slug) DO UPDATE 
SET is_system_page = true;

-- Create or update Datenschutz page
INSERT INTO pages (slug, title, is_home, is_enabled, display_order, is_system_page)
VALUES ('datenschutz', 'Datenschutz', false, true, 999, true)
ON CONFLICT (slug) DO UPDATE 
SET is_system_page = true;

-- Get the page IDs (we'll need these for the next steps)
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
    
    -- Calculate next instance IDs (cast to integer)
    SELECT COALESCE(MAX(block_instance_id::integer), 0) + 1 INTO impressum_instance_id 
    FROM page_blocks WHERE block_type = 'static-content';
    
    SELECT COALESCE(MAX(block_instance_id::integer), 0) + 2 INTO datenschutz_instance_id 
    FROM page_blocks WHERE block_type = 'static-content';
    
    -- Add static-content block to Impressum page (if not exists)
    INSERT INTO page_blocks (page_id, block_type, block_instance_id, display_order)
    SELECT impressum_page_id, 'static-content', impressum_instance_id, 0
    WHERE NOT EXISTS (
        SELECT 1 FROM page_blocks WHERE page_id = impressum_page_id AND block_type = 'static-content'
    );
    
    -- Add static-content block to Datenschutz page (if not exists)
    INSERT INTO page_blocks (page_id, block_type, block_instance_id, display_order)
    SELECT datenschutz_page_id, 'static-content', datenschutz_instance_id, 0
    WHERE NOT EXISTS (
        SELECT 1 FROM page_blocks WHERE page_id = datenschutz_page_id AND block_type = 'static-content'
    );
    
    -- Create default content for Impressum (if not exists)
    INSERT INTO static_content (instance_id, title, content)
    SELECT impressum_instance_id, 'Impressum', '<h2>Angaben gemäß § 5 TMG</h2><p>Hier Ihre Firmendaten eintragen...</p>'
    WHERE NOT EXISTS (
        SELECT 1 FROM static_content WHERE instance_id = impressum_instance_id
    );
    
    -- Create default content for Datenschutz (if not exists)
    INSERT INTO static_content (instance_id, title, content)
    SELECT datenschutz_instance_id, 'Datenschutzerklärung', '<h2>Datenschutz</h2><p>Hier Ihre Datenschutzerklärung eintragen...</p>'
    WHERE NOT EXISTS (
        SELECT 1 FROM static_content WHERE instance_id = datenschutz_instance_id
    );
END $$;
