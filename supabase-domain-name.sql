-- Migration: Add domain_name column to websites table
-- Run this in Supabase SQL Editor

-- Add domain_name column (the display-friendly domain name, e.g., "www.salon-sarah.de")
ALTER TABLE websites 
ADD COLUMN IF NOT EXISTS domain_name TEXT;

-- Comment
COMMENT ON COLUMN websites.domain_name IS 'Display-friendly domain name for the website (e.g., www.salon-sarah.de)';

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'websites' 
AND column_name IN ('site_name', 'domain', 'domain_name');
