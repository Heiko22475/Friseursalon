-- Add customer_id field to site_settings table
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS customer_id VARCHAR(6);

-- Add constraint to ensure it's exactly 6 digits
ALTER TABLE site_settings 
  ADD CONSTRAINT customer_id_format 
  CHECK (customer_id IS NULL OR (customer_id ~ '^[0-9]{6}$'));

-- Set a default value if needed
UPDATE site_settings SET customer_id = '123456' WHERE customer_id IS NULL;

COMMENT ON COLUMN site_settings.customer_id IS 'Customer ID - 6-digit number for identification';
