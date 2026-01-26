-- Add icon configuration columns to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS icon_enabled BOOLEAN DEFAULT true;
ALTER TABLE services ADD COLUMN IF NOT EXISTS icon_size INTEGER DEFAULT 24;
ALTER TABLE services ADD COLUMN IF NOT EXISTS icon_bg_enabled BOOLEAN DEFAULT true;
ALTER TABLE services ADD COLUMN IF NOT EXISTS icon_bg_color TEXT DEFAULT '#1e293b';
ALTER TABLE services ADD COLUMN IF NOT EXISTS icon_bg_shape TEXT DEFAULT 'rounded';
ALTER TABLE services ADD COLUMN IF NOT EXISTS icon_bg_padding INTEGER DEFAULT 10;

-- Update existing records with default values
UPDATE services 
SET 
  icon_enabled = true,
  icon_size = 24,
  icon_bg_enabled = true,
  icon_bg_color = COALESCE(icon_bg_color, '#1e293b'),
  icon_bg_shape = 'rounded',
  icon_bg_padding = 10
WHERE icon_enabled IS NULL;

-- Ensure icon_color has a default for existing records
UPDATE services 
SET icon_color = '#ffffff' 
WHERE icon_color IS NULL;
