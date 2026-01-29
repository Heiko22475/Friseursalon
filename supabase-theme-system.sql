-- =====================================================
-- THEME SYSTEM SCHEMA
-- Design Token System für Farb-Management
-- =====================================================

-- 1. Color Palettes (wiederverwendbare Paletten)
CREATE TABLE IF NOT EXISTS color_palettes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  primary1 TEXT NOT NULL, -- HEX format: #RRGGBB
  primary2 TEXT NOT NULL,
  primary3 TEXT NOT NULL,
  primary4 TEXT NOT NULL,
  primary5 TEXT NOT NULL,
  is_preset BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Themes (aktives Design-System)
CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  palette_id UUID REFERENCES color_palettes(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Semantic Tokens (pro Theme)
CREATE TABLE IF NOT EXISTS semantic_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID REFERENCES themes(id) ON DELETE CASCADE,
  
  -- Navigation & Interaction (stored as JSONB: ColorValue type)
  link JSONB NOT NULL DEFAULT '{"kind":"tokenRef","ref":"palette.primary1.base"}',
  link_hover JSONB NOT NULL DEFAULT '{"kind":"tokenRef","ref":"palette.primary1.accents.accent2"}',
  focus_ring JSONB NOT NULL DEFAULT '{"kind":"tokenRef","ref":"palette.primary2.base"}',
  
  -- Backgrounds
  page_bg JSONB NOT NULL DEFAULT '{"kind":"custom","hex":"#FFFFFF"}',
  content_bg JSONB NOT NULL DEFAULT '{"kind":"tokenRef","ref":"palette.primary5.base"}',
  card_bg JSONB NOT NULL DEFAULT '{"kind":"custom","hex":"#FAFAFA"}',
  
  -- Text
  heading_text JSONB NOT NULL DEFAULT '{"kind":"custom","hex":"#212121"}',
  body_text JSONB NOT NULL DEFAULT '{"kind":"custom","hex":"#424242"}',
  muted_text JSONB NOT NULL DEFAULT '{"kind":"custom","hex":"#757575"}',
  
  -- Borders
  border JSONB NOT NULL DEFAULT '{"kind":"custom","hex":"#E0E0E0"}',
  border_light JSONB NOT NULL DEFAULT '{"kind":"custom","hex":"#F5F5F5"}',
  
  -- Buttons
  button_primary_bg JSONB NOT NULL DEFAULT '{"kind":"tokenRef","ref":"palette.primary1.base"}',
  button_primary_text JSONB NOT NULL DEFAULT '{"kind":"custom","hex":"#FFFFFF"}',
  button_secondary_bg JSONB NOT NULL DEFAULT '{"kind":"tokenRef","ref":"palette.primary5.base"}',
  button_secondary_text JSONB NOT NULL DEFAULT '{"kind":"tokenRef","ref":"semantic.bodyText"}',
  
  -- States
  success JSONB NOT NULL DEFAULT '{"kind":"tokenRef","ref":"palette.primary3.base"}',
  warning JSONB NOT NULL DEFAULT '{"kind":"tokenRef","ref":"palette.primary4.base"}',
  error JSONB NOT NULL DEFAULT '{"kind":"custom","hex":"#F44336"}',
  info JSONB NOT NULL DEFAULT '{"kind":"tokenRef","ref":"palette.primary2.base"}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(theme_id)
);

-- 4. Text Mappings (Hintergrund → Textfarbe)
CREATE TABLE IF NOT EXISTS text_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID REFERENCES themes(id) ON DELETE CASCADE,
  token TEXT NOT NULL,           -- z.B. "palette.primary1.base"
  mode TEXT NOT NULL CHECK (mode IN ('auto', 'custom')),
  custom_hex TEXT,               -- nur bei mode='custom'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(theme_id, token)
);

-- 5. Accent Configurations (HSL-Shifts für generierte Akzente)
CREATE TABLE IF NOT EXISTS accent_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  palette_id UUID REFERENCES color_palettes(id) ON DELETE CASCADE,
  primary_number INTEGER NOT NULL CHECK (primary_number >= 1 AND primary_number <= 5),
  accent_number INTEGER NOT NULL CHECK (accent_number >= 1 AND accent_number <= 3),
  hue_shift INTEGER DEFAULT 0,        -- HSL Hue shift in degrees (-360 to 360)
  saturation_shift INTEGER DEFAULT 0, -- Saturation shift in percent (-100 to 100)
  lightness_shift INTEGER DEFAULT 0,  -- Lightness shift in percent (-100 to 100)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(palette_id, primary_number, accent_number)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_color_palettes_preset ON color_palettes(is_preset);
CREATE INDEX IF NOT EXISTS idx_themes_active ON themes(is_active);
CREATE INDEX IF NOT EXISTS idx_semantic_tokens_theme ON semantic_tokens(theme_id);
CREATE INDEX IF NOT EXISTS idx_text_mappings_theme ON text_mappings(theme_id);
CREATE INDEX IF NOT EXISTS idx_text_mappings_token ON text_mappings(token);
CREATE INDEX IF NOT EXISTS idx_accent_configs_palette ON accent_configs(palette_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE color_palettes ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE semantic_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE text_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE accent_configs ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Allow public read access on color_palettes" ON color_palettes;
DROP POLICY IF EXISTS "Allow authenticated users to manage color_palettes" ON color_palettes;
DROP POLICY IF EXISTS "Allow public read access on themes" ON themes;
DROP POLICY IF EXISTS "Allow authenticated users to manage themes" ON themes;
DROP POLICY IF EXISTS "Allow public read access on semantic_tokens" ON semantic_tokens;
DROP POLICY IF EXISTS "Allow authenticated users to manage semantic_tokens" ON semantic_tokens;
DROP POLICY IF EXISTS "Allow public read access on text_mappings" ON text_mappings;
DROP POLICY IF EXISTS "Allow authenticated users to manage text_mappings" ON text_mappings;
DROP POLICY IF EXISTS "Allow public read access on accent_configs" ON accent_configs;
DROP POLICY IF EXISTS "Allow authenticated users to manage accent_configs" ON accent_configs;

CREATE POLICY "Allow public read access on color_palettes"
ON color_palettes FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to manage color_palettes"
ON color_palettes FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on themes"
ON themes FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to manage themes"
ON themes FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on semantic_tokens"
ON semantic_tokens FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to manage semantic_tokens"
ON semantic_tokens FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on text_mappings"
ON text_mappings FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to manage text_mappings"
ON text_mappings FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on accent_configs"
ON accent_configs FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to manage accent_configs"
ON accent_configs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_color_palettes_updated_at BEFORE UPDATE ON color_palettes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON themes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_semantic_tokens_updated_at BEFORE UPDATE ON semantic_tokens 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_text_mappings_updated_at BEFORE UPDATE ON text_mappings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accent_configs_updated_at BEFORE UPDATE ON accent_configs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DEFAULT DATA
-- =====================================================

-- Nur ein aktives Theme erlauben (Constraint)
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_active_theme ON themes(is_active) WHERE is_active = true;

-- Standard-Palette (Pastellfarben)
INSERT INTO color_palettes (name, description, primary1, primary2, primary3, primary4, primary5, is_preset) VALUES
  ('Pastell Standard', 'Helle, freundliche Pastellfarben', '#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#F0F0F0', true)
ON CONFLICT DO NOTHING;

-- Standard-Theme
DO $$
DECLARE
  default_palette_id UUID;
  default_theme_id UUID;
BEGIN
  -- Get default palette
  SELECT id INTO default_palette_id FROM color_palettes WHERE name = 'Pastell Standard' LIMIT 1;
  
  IF default_palette_id IS NOT NULL THEN
    -- Create default theme if none exists
    INSERT INTO themes (name, palette_id, is_active)
    SELECT 'Standard Theme', default_palette_id, true
    WHERE NOT EXISTS (SELECT 1 FROM themes WHERE is_active = true)
    RETURNING id INTO default_theme_id;
    
    -- Create semantic tokens for default theme if created
    IF default_theme_id IS NOT NULL THEN
      INSERT INTO semantic_tokens (theme_id) VALUES (default_theme_id);
      
      -- Create default accent configs
      INSERT INTO accent_configs (palette_id, primary_number, accent_number, hue_shift, saturation_shift, lightness_shift) VALUES
        (default_palette_id, 1, 1, 0, -20, 40),  -- Accent1: heller
        (default_palette_id, 1, 2, 0, 0, -25),   -- Accent2: dunkler
        (default_palette_id, 1, 3, 0, -50, 0),   -- Accent3: muted
        (default_palette_id, 2, 1, 0, -20, 40),
        (default_palette_id, 2, 2, 0, 0, -25),
        (default_palette_id, 2, 3, 0, -50, 0),
        (default_palette_id, 3, 1, 0, -20, 40),
        (default_palette_id, 3, 2, 0, 0, -25),
        (default_palette_id, 3, 3, 0, -50, 0),
        (default_palette_id, 4, 1, 0, -20, 40),
        (default_palette_id, 4, 2, 0, 0, -25),
        (default_palette_id, 4, 3, 0, -50, 0),
        (default_palette_id, 5, 1, 0, -20, 40),
        (default_palette_id, 5, 2, 0, 0, -25),
        (default_palette_id, 5, 3, 0, -50, 0)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
END $$;

-- =====================================================
-- THEME SYSTEM SCHEMA COMPLETE
-- =====================================================
