-- =====================================================
-- GRID BUILDING BLOCK SCHEMA
-- Enables grid layouts with child blocks
-- =====================================================

-- 1. Add grid building block type
INSERT INTO building_blocks (block_type, block_name, description, can_repeat) VALUES
  ('grid', 'Grid Layout', 'Spalten-Layout mit mehreren Bausteinen', true)
ON CONFLICT (block_type) DO NOTHING;

-- 2. Create grid_config table for grid settings
CREATE TABLE IF NOT EXISTS grid_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grid_instance_id INTEGER NOT NULL UNIQUE,
  layout_type TEXT NOT NULL DEFAULT '50-50',
  gap INTEGER DEFAULT 16,
  padding_top INTEGER DEFAULT 0,
  padding_bottom INTEGER DEFAULT 0,
  margin_left INTEGER DEFAULT 0,
  margin_right INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_layout CHECK (layout_type IN ('50-50', '25-75', '75-25', '66-33', '33-66', '33-33-33', '25-25-25-25'))
);

-- 3. Create grid_blocks table to link child blocks to grid
CREATE TABLE IF NOT EXISTS grid_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grid_instance_id INTEGER NOT NULL,
  child_block_type TEXT NOT NULL,
  child_block_instance_id INTEGER NOT NULL,
  grid_position INTEGER NOT NULL DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(grid_instance_id, child_block_type, child_block_instance_id)
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_grid_config_instance ON grid_config(grid_instance_id);
CREATE INDEX IF NOT EXISTS idx_grid_blocks_grid ON grid_blocks(grid_instance_id);
CREATE INDEX IF NOT EXISTS idx_grid_blocks_child ON grid_blocks(child_block_type, child_block_instance_id);
CREATE INDEX IF NOT EXISTS idx_grid_blocks_order ON grid_blocks(grid_instance_id, display_order);

-- 5. Enable RLS
ALTER TABLE grid_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE grid_blocks ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies
DROP POLICY IF EXISTS "Allow public read access on grid_config" ON grid_config;
DROP POLICY IF EXISTS "Allow authenticated users to manage grid_config" ON grid_config;
DROP POLICY IF EXISTS "Allow public read access on grid_blocks" ON grid_blocks;
DROP POLICY IF EXISTS "Allow authenticated users to manage grid_blocks" ON grid_blocks;

CREATE POLICY "Allow public read access on grid_config"
ON grid_config FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to manage grid_config"
ON grid_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on grid_blocks"
ON grid_blocks FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to manage grid_blocks"
ON grid_blocks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. Add update trigger for grid_config
CREATE TRIGGER update_grid_config_updated_at BEFORE UPDATE ON grid_config 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grid_blocks_updated_at BEFORE UPDATE ON grid_blocks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- GRID SCHEMA SETUP COMPLETE
-- =====================================================
