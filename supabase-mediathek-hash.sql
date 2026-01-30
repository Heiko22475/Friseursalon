-- Add file_hash column to media_files table for duplicate detection
ALTER TABLE media_files ADD COLUMN IF NOT EXISTS file_hash TEXT;

-- Create index for faster duplicate checks
CREATE INDEX IF NOT EXISTS idx_media_files_hash ON media_files(file_hash);

-- Create unique constraint: same folder, same original_filename, same hash = duplicate
CREATE UNIQUE INDEX IF NOT EXISTS idx_media_files_unique_file 
ON media_files(folder_id, original_filename, file_hash) 
WHERE file_hash IS NOT NULL;
