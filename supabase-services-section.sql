-- Create table for services section content
CREATE TABLE IF NOT EXISTS services_section (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Our Services',
  subtitle TEXT NOT NULL DEFAULT 'Premium hair care services delivered by experienced professionals',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default values
INSERT INTO services_section (title, subtitle)
VALUES ('Our Services', 'Premium hair care services delivered by experienced professionals')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE services_section ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on services_section"
ON services_section FOR SELECT
TO public
USING (true);

-- Allow authenticated users to update
CREATE POLICY "Allow authenticated users to update services_section"
ON services_section FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
