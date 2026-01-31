-- Add domain column to websites table
ALTER TABLE websites ADD COLUMN IF NOT EXISTS domain TEXT UNIQUE;

-- Create an index for faster lookups based on domain
CREATE INDEX IF NOT EXISTS idx_websites_domain ON websites(domain);

-- Example: Set a domain for a specific customer (Replace with real data)
-- UPDATE websites SET domain = 'haarfein.de' WHERE customer_id = '123456';
-- UPDATE websites SET domain = 'localhost' WHERE customer_id = '000000'; -- For development
