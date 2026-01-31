-- =====================================================
-- MEDIA CUSTOMER ISOLATION - Migration
-- Adds customer_id to media_folders for multi-tenant isolation
-- =====================================================

-- 1. Add customer_id column to media_folders
ALTER TABLE media_folders ADD COLUMN IF NOT EXISTS customer_id TEXT;

-- 2. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_media_folders_customer_id ON media_folders(customer_id);

-- 3. For existing data, try to extract customer_id from path
-- Path format is typically: "123456/images" or "stock/images"
UPDATE media_folders 
SET customer_id = split_part(path, '/', 1)
WHERE customer_id IS NULL AND path IS NOT NULL;

-- 4. For stock photos, set customer_id to 'stock' (shared across all users)
UPDATE media_folders 
SET customer_id = 'stock'
WHERE customer_id IS NULL OR customer_id = '';

-- 5. Add NOT NULL constraint after migration (optional - do this after verifying data)
-- ALTER TABLE media_folders ALTER COLUMN customer_id SET NOT NULL;

-- =====================================================
-- VERIFICATION QUERIES (run these to check the migration)
-- =====================================================
-- SELECT customer_id, name, path FROM media_folders ORDER BY customer_id;
-- SELECT DISTINCT customer_id FROM media_folders;
