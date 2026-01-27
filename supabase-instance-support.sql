-- Add instance_id column to gallery, services, and reviews tables for multi-instance support

-- Update gallery table
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS instance_id INTEGER DEFAULT 1;
CREATE INDEX IF NOT EXISTS idx_gallery_instance ON gallery(instance_id);

-- Update services table  
ALTER TABLE services ADD COLUMN IF NOT EXISTS instance_id INTEGER DEFAULT 1;
CREATE INDEX IF NOT EXISTS idx_services_instance ON services(instance_id);

-- Update services_section table
ALTER TABLE services_section ADD COLUMN IF NOT EXISTS instance_id INTEGER DEFAULT 1;
CREATE INDEX IF NOT EXISTS idx_services_section_instance ON services_section(instance_id);

-- Update reviews table
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS instance_id INTEGER DEFAULT 1;
CREATE INDEX IF NOT EXISTS idx_reviews_instance ON reviews(instance_id);

-- Update pricing table (also repeatable)
ALTER TABLE pricing ADD COLUMN IF NOT EXISTS instance_id INTEGER DEFAULT 1;
CREATE INDEX IF NOT EXISTS idx_pricing_instance ON pricing(instance_id);

-- Note: All existing data will have instance_id = 1 (default instance)
-- New instances created through the building blocks manager will have instance_id = 2, 3, etc.
