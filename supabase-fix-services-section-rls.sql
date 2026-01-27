-- Fix RLS policies for services_section table

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access on services_section" ON services_section;
DROP POLICY IF EXISTS "Allow authenticated users to manage services_section" ON services_section;

-- Create proper policies
CREATE POLICY "Allow public read access on services_section"
ON services_section FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated users to manage services_section"
ON services_section FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
