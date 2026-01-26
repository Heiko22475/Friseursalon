-- Add text alignment option to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS text_align TEXT DEFAULT 'left';

-- Update existing records with default value
UPDATE services 
SET text_align = 'left'
WHERE text_align IS NULL;

-- Valid values are 'left', 'center', 'right'
