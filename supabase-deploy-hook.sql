-- =====================================================
-- Add last_build_at column to websites table
-- Used by the deploy hook to track when the last
-- prerender build was triggered.
-- =====================================================

ALTER TABLE websites
ADD COLUMN IF NOT EXISTS last_build_at timestamptz DEFAULT NULL;

-- Optional: allow anon/authenticated to read & update this column
-- (the deploy hook needs to update it after triggering a build)
COMMENT ON COLUMN websites.last_build_at IS 'Timestamp of last deploy/prerender build trigger';
