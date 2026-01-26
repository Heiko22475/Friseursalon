-- Step 1: Add icon_color column if it doesn't exist
ALTER TABLE services ADD COLUMN IF NOT EXISTS icon_color TEXT;

-- Step 2: Set default color for all existing records that don't have one
UPDATE services 
SET icon_color = '#ffffff' 
WHERE icon_color IS NULL;

-- Step 3: Set a default value for future inserts
ALTER TABLE services 
ALTER COLUMN icon_color SET DEFAULT '#ffffff';
