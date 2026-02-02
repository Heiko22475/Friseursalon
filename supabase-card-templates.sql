-- =====================================================
-- CARD TEMPLATES FOR SUPERADMIN
-- Vordefinierte Karten-Entwürfe vom Superadmin
-- =====================================================

-- Create card_templates table
CREATE TABLE IF NOT EXISTS public.card_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL, -- GenericCardConfig
  preview_image TEXT, -- Optional preview image URL
  category TEXT DEFAULT 'general', -- e.g. 'business', 'service', 'product', 'team'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.card_templates ENABLE ROW LEVEL SECURITY;

-- Authenticated users can manage templates (create/update/delete)
CREATE POLICY "Authenticated users can manage card_templates"
  ON public.card_templates
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- All users (including public) can read active templates
CREATE POLICY "Anyone can read active card_templates"
  ON public.card_templates
  FOR SELECT
  TO public
  USING (is_active = true);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_card_templates_category ON public.card_templates(category);
CREATE INDEX IF NOT EXISTS idx_card_templates_active ON public.card_templates(is_active);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_card_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER card_templates_updated_at
  BEFORE UPDATE ON public.card_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_card_templates_updated_at();

-- Insert some example templates
INSERT INTO public.card_templates (name, description, config, category) VALUES
(
  'Basis Service-Karte',
  'Einfache Karte mit Icon, Titel und Beschreibung - ideal für Dienstleistungen',
  '{
    "items": [],
    "layout": "grid",
    "cardLayoutVariant": "vertical",
    "grid": {
      "columns": { "desktop": 3, "tablet": 2, "mobile": 1 },
      "gap": "lg",
      "alignment": "start"
    },
    "typography": {
      "enabled": true,
      "titleFont": "inter",
      "titleWeight": 600,
      "bodyFont": "inter",
      "bodyWeight": 400
    },
    "cardStyle": {
      "backgroundColor": { "kind": "custom", "hex": "#FFFFFF" },
      "borderColor": { "kind": "custom", "hex": "#E5E7EB" },
      "borderWidth": 1,
      "borderRadius": "lg",
      "shadow": "md",
      "padding": "lg",
      "hoverEffect": "lift",
      "transitionDuration": 300
    },
    "imageStyle": {
      "aspectRatio": "16:9",
      "fit": "cover",
      "borderRadius": "md"
    },
    "showImage": false,
    "imageElementStyle": {
      "padding": 0,
      "marginBottom": 16,
      "enabled": true,
      "color": null
    },
    "iconStyle": {
      "enabled": true,
      "size": "xl",
      "color": { "kind": "tokenRef", "ref": "semantic.buttonPrimaryBg" },
      "backgroundEnabled": true,
      "backgroundColor": { "kind": "custom", "hex": "#FEE2E2" },
      "backgroundShape": "circle",
      "backgroundPadding": "md"
    },
    "overlineStyle": {
      "enabled": false,
      "marginBottom": 8,
      "color": null
    },
    "titleStyle": {
      "font": "inter",
      "marginBottom": 8,
      "color": null
    },
    "subtitleStyle": {
      "enabled": false,
      "marginBottom": 12,
      "color": null
    },
    "descriptionStyle": {
      "enabled": true,
      "font": "inter",
      "marginBottom": 16,
      "color": null
    },
    "priceStyle": {
      "enabled": false,
      "position": "bottom",
      "size": "xl",
      "weight": "bold",
      "color": { "kind": "tokenRef", "ref": "semantic.buttonPrimaryBg" },
      "showOriginalPrice": false,
      "originalPriceColor": { "kind": "tokenRef", "ref": "semantic.mutedText" },
      "showBadge": false,
      "badgeColor": { "kind": "custom", "hex": "#FFFFFF" },
      "badgeBackground": { "kind": "tokenRef", "ref": "semantic.buttonPrimaryBg" }
    },
    "ratingStyle": {
      "enabled": false,
      "style": "stars",
      "size": "md",
      "filledColor": { "kind": "custom", "hex": "#FBBF24" },
      "emptyColor": { "kind": "custom", "hex": "#D1D5DB" },
      "showCount": false,
      "countColor": { "kind": "tokenRef", "ref": "semantic.mutedText" }
    },
    "featuresStyle": {
      "enabled": false,
      "icon": "Check",
      "iconColor": { "kind": "custom", "hex": "#10B981" },
      "textColor": { "kind": "tokenRef", "ref": "semantic.bodyText" },
      "textSize": "sm",
      "layout": "list",
      "maxItems": null
    },
    "socialStyle": {
      "enabled": false,
      "iconStyle": "outline",
      "iconSize": "md",
      "iconColor": { "kind": "custom", "hex": "#6B7280" },
      "iconHoverColor": { "kind": "tokenRef", "ref": "semantic.buttonPrimaryBg" },
      "layout": "row",
      "gap": "sm"
    },
    "showButton": false,
    "buttonStyle": {
      "variant": "filled",
      "size": "md",
      "backgroundColor": { "kind": "tokenRef", "ref": "semantic.buttonPrimaryBg" },
      "textColor": { "kind": "custom", "hex": "#FFFFFF" },
      "borderColor": { "kind": "tokenRef", "ref": "semantic.buttonPrimaryBg" },
      "borderRadius": "lg",
      "fullWidth": false
    },
    "textStyle": {
      "titleSize": "xl",
      "titleWeight": "bold",
      "titleColor": { "kind": "tokenRef", "ref": "semantic.headingText" },
      "titleAlign": "left",
      "subtitleSize": "sm",
      "subtitleWeight": "normal",
      "subtitleColor": { "kind": "tokenRef", "ref": "semantic.mutedText" },
      "descriptionSize": "sm",
      "descriptionColor": { "kind": "tokenRef", "ref": "semantic.bodyText" }
    },
    "showSubtitle": false,
    "showDescription": true,
    "sectionStyle": {
      "maxWidth": "7xl",
      "backgroundColor": null,
      "paddingTop": "2xl",
      "paddingBottom": "2xl"
    },
    "descriptionLineClamp": 0
  }',
  'service'
),
(
  'Produkt-Karte mit Preis',
  'Karte mit Bild, Titel, Preis und Button - perfekt für Produktpräsentation',
  '{
    "items": [],
    "layout": "grid",
    "cardLayoutVariant": "vertical",
    "grid": {
      "columns": { "desktop": 4, "tablet": 2, "mobile": 1 },
      "gap": "md",
      "alignment": "start"
    },
    "typography": {
      "enabled": true,
      "titleFont": "inter",
      "titleWeight": 600,
      "bodyFont": "inter",
      "bodyWeight": 400
    },
    "cardStyle": {
      "backgroundColor": { "kind": "custom", "hex": "#FFFFFF" },
      "borderColor": { "kind": "custom", "hex": "#E5E7EB" },
      "borderWidth": 1,
      "borderRadius": "xl",
      "shadow": "lg",
      "padding": "md",
      "hoverEffect": "scale",
      "transitionDuration": 200
    },
    "imageStyle": {
      "aspectRatio": "1:1",
      "fit": "cover",
      "borderRadius": "lg"
    },
    "showImage": true,
    "imageElementStyle": {
      "padding": 0,
      "marginBottom": 12,
      "enabled": true,
      "color": null
    },
    "iconStyle": {
      "enabled": false,
      "size": "lg",
      "color": { "kind": "tokenRef", "ref": "semantic.buttonPrimaryBg" },
      "backgroundEnabled": false,
      "backgroundShape": "circle",
      "backgroundPadding": "md"
    },
    "overlineStyle": {
      "enabled": false,
      "marginBottom": 8,
      "color": null
    },
    "titleStyle": {
      "font": "inter",
      "marginBottom": 8,
      "color": null
    },
    "subtitleStyle": {
      "enabled": false,
      "marginBottom": 12,
      "color": null
    },
    "descriptionStyle": {
      "enabled": true,
      "font": "inter",
      "marginBottom": 16,
      "color": null
    },
    "priceStyle": {
      "enabled": true,
      "position": "below-title",
      "size": "2xl",
      "weight": "bold",
      "color": { "kind": "tokenRef", "ref": "semantic.buttonPrimaryBg" },
      "showOriginalPrice": true,
      "originalPriceColor": { "kind": "tokenRef", "ref": "semantic.mutedText" },
      "showBadge": false,
      "badgeColor": { "kind": "custom", "hex": "#FFFFFF" },
      "badgeBackground": { "kind": "tokenRef", "ref": "semantic.buttonPrimaryBg" }
    },
    "ratingStyle": {
      "enabled": true,
      "style": "stars",
      "size": "sm",
      "filledColor": { "kind": "custom", "hex": "#FBBF24" },
      "emptyColor": { "kind": "custom", "hex": "#D1D5DB" },
      "showCount": true,
      "countColor": { "kind": "tokenRef", "ref": "semantic.mutedText" }
    },
    "featuresStyle": {
      "enabled": false,
      "icon": "Check",
      "iconColor": { "kind": "custom", "hex": "#10B981" },
      "textColor": { "kind": "tokenRef", "ref": "semantic.bodyText" },
      "textSize": "sm",
      "layout": "list",
      "maxItems": null
    },
    "socialStyle": {
      "enabled": false,
      "iconStyle": "outline",
      "iconSize": "md",
      "iconColor": { "kind": "custom", "hex": "#6B7280" },
      "iconHoverColor": { "kind": "tokenRef", "ref": "semantic.buttonPrimaryBg" },
      "layout": "row",
      "gap": "sm"
    },
    "showButton": true,
    "buttonStyle": {
      "variant": "filled",
      "size": "md",
      "backgroundColor": { "kind": "tokenRef", "ref": "semantic.buttonPrimaryBg" },
      "textColor": { "kind": "custom", "hex": "#FFFFFF" },
      "borderColor": { "kind": "tokenRef", "ref": "semantic.buttonPrimaryBg" },
      "borderRadius": "lg",
      "fullWidth": true
    },
    "textStyle": {
      "titleSize": "lg",
      "titleWeight": "semibold",
      "titleColor": { "kind": "tokenRef", "ref": "semantic.headingText" },
      "titleAlign": "left",
      "subtitleSize": "sm",
      "subtitleWeight": "normal",
      "subtitleColor": { "kind": "tokenRef", "ref": "semantic.mutedText" },
      "descriptionSize": "xs",
      "descriptionColor": { "kind": "tokenRef", "ref": "semantic.bodyText" }
    },
    "showSubtitle": false,
    "showDescription": true,
    "sectionStyle": {
      "maxWidth": "7xl",
      "backgroundColor": null,
      "paddingTop": "2xl",
      "paddingBottom": "2xl"
    },
    "descriptionLineClamp": 2
  }',
  'product'
),
(
  'Team-Mitglied Karte',
  'Karte mit Bild, Name, Position und Social Links - ideal für Team-Vorstellung',
  '{
    "items": [],
    "layout": "grid",
    "cardLayoutVariant": "vertical",
    "grid": {
      "columns": { "desktop": 4, "tablet": 2, "mobile": 1 },
      "gap": "lg",
      "alignment": "center"
    },
    "typography": {
      "enabled": true,
      "titleFont": "inter",
      "titleWeight": 600,
      "bodyFont": "inter",
      "bodyWeight": 400
    },
    "cardStyle": {
      "backgroundColor": { "kind": "custom", "hex": "#FFFFFF" },
      "borderColor": { "kind": "custom", "hex": "#E5E7EB" },
      "borderWidth": 0,
      "borderRadius": "2xl",
      "shadow": "xl",
      "padding": "xl",
      "hoverEffect": "lift",
      "transitionDuration": 300
    },
    "imageStyle": {
      "aspectRatio": "1:1",
      "fit": "cover",
      "borderRadius": "full"
    },
    "showImage": true,
    "imageElementStyle": {
      "padding": 0,
      "marginBottom": 16,
      "enabled": true,
      "color": null
    },
    "iconStyle": {
      "enabled": false,
      "size": "lg",
      "color": { "kind": "tokenRef", "ref": "semantic.buttonPrimaryBg" },
      "backgroundEnabled": false,
      "backgroundShape": "circle",
      "backgroundPadding": "md"
    },
    "overlineStyle": {
      "enabled": false,
      "marginBottom": 8,
      "color": null
    },
    "titleStyle": {
      "font": "inter",
      "marginBottom": 4,
      "color": null
    },
    "subtitleStyle": {
      "enabled": true,
      "marginBottom": 12,
      "color": { "kind": "tokenRef", "ref": "semantic.mutedText" }
    },
    "descriptionStyle": {
      "enabled": true,
      "font": "inter",
      "marginBottom": 16,
      "color": null
    },
    "priceStyle": {
      "enabled": false,
      "position": "bottom",
      "size": "xl",
      "weight": "bold",
      "color": { "kind": "tokenRef", "ref": "semantic.buttonPrimaryBg" },
      "showOriginalPrice": false,
      "originalPriceColor": { "kind": "tokenRef", "ref": "semantic.mutedText" },
      "showBadge": false,
      "badgeColor": { "kind": "custom", "hex": "#FFFFFF" },
      "badgeBackground": { "kind": "tokenRef", "ref": "semantic.buttonPrimaryBg" }
    },
    "ratingStyle": {
      "enabled": false,
      "style": "stars",
      "size": "md",
      "filledColor": { "kind": "custom", "hex": "#FBBF24" },
      "emptyColor": { "kind": "custom", "hex": "#D1D5DB" },
      "showCount": false,
      "countColor": { "kind": "tokenRef", "ref": "semantic.mutedText" }
    },
    "featuresStyle": {
      "enabled": false,
      "icon": "Check",
      "iconColor": { "kind": "custom", "hex": "#10B981" },
      "textColor": { "kind": "tokenRef", "ref": "semantic.bodyText" },
      "textSize": "sm",
      "layout": "list",
      "maxItems": null
    },
    "socialStyle": {
      "enabled": true,
      "iconStyle": "filled",
      "iconSize": "md",
      "iconColor": { "kind": "custom", "hex": "#6B7280" },
      "iconHoverColor": { "kind": "tokenRef", "ref": "semantic.buttonPrimaryBg" },
      "layout": "row",
      "gap": "sm"
    },
    "showButton": false,
    "buttonStyle": {
      "variant": "filled",
      "size": "md",
      "backgroundColor": { "kind": "tokenRef", "ref": "semantic.buttonPrimaryBg" },
      "textColor": { "kind": "custom", "hex": "#FFFFFF" },
      "borderColor": { "kind": "tokenRef", "ref": "semantic.buttonPrimaryBg" },
      "borderRadius": "lg",
      "fullWidth": false
    },
    "textStyle": {
      "titleSize": "xl",
      "titleWeight": "bold",
      "titleColor": { "kind": "tokenRef", "ref": "semantic.headingText" },
      "titleAlign": "center",
      "subtitleSize": "sm",
      "subtitleWeight": "medium",
      "subtitleColor": { "kind": "tokenRef", "ref": "semantic.mutedText" },
      "descriptionSize": "sm",
      "descriptionColor": { "kind": "tokenRef", "ref": "semantic.bodyText" }
    },
    "showSubtitle": true,
    "showDescription": true,
    "sectionStyle": {
      "maxWidth": "7xl",
      "backgroundColor": null,
      "paddingTop": "2xl",
      "paddingBottom": "2xl"
    },
    "descriptionLineClamp": 3
  }',
  'team'
);

COMMENT ON TABLE public.card_templates IS 'Vordefinierte Karten-Entwürfe vom Superadmin für alle Benutzer';
COMMENT ON COLUMN public.card_templates.config IS 'GenericCardConfig als JSON - verwendet das gleiche Datenmodell wie Kunden-Karten';
