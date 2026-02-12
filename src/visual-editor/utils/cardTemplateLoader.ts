// =====================================================
// VISUAL EDITOR – CARD TEMPLATE LOADER
// Lädt Kartenvorlagen aus der Supabase-Datenbank (Superadmin)
// und konvertiert GenericCardConfig → VE CardTemplate Format.
// Fallback: Built-in Templates wenn DB nicht verfügbar.
// =====================================================

import { supabase } from '../../lib/supabase';
import type { CardTemplate, CardTemplateElement } from '../types/cards';
import { BUILT_IN_CARD_TEMPLATES } from '../types/cards';
import type { GenericCardConfig, GenericCardItem } from '../../types/GenericCard';

// ===== DB TEMPLATE TYPE =====

export interface DBCardTemplate {
  id: string;
  name: string;
  description: string | null;
  config: GenericCardConfig;
  category: string;
  is_active: boolean;
  created_at: string;
}

// ===== CACHE =====

let cachedTemplates: CardTemplate[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 60_000; // 1 minute

/**
 * Lädt aktive Kartenvorlagen aus Supabase und konvertiert sie
 * in das VE CardTemplate-Format. Cached für 1 Minute.
 * Fallback auf BUILT_IN_CARD_TEMPLATES bei Fehler.
 */
export async function loadCardTemplates(): Promise<CardTemplate[]> {
  const now = Date.now();
  if (cachedTemplates && (now - lastFetchTime) < CACHE_DURATION_MS) {
    return cachedTemplates;
  }

  try {
    const { data, error } = await supabase
      .from('card_templates')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      // No DB templates → use built-in
      cachedTemplates = BUILT_IN_CARD_TEMPLATES;
      lastFetchTime = now;
      return cachedTemplates;
    }

    const converted = (data as DBCardTemplate[]).map(dbTpl => convertDBTemplateToVE(dbTpl));
    cachedTemplates = converted;
    lastFetchTime = now;
    return cachedTemplates;
  } catch (err) {
    console.warn('[CardTemplateLoader] Fehler beim Laden der Vorlagen aus DB, nutze Built-in:', err);
    cachedTemplates = BUILT_IN_CARD_TEMPLATES;
    lastFetchTime = now;
    return cachedTemplates;
  }
}

/** Cache invalidieren (z.B. nach Speichern einer Vorlage) */
export function invalidateTemplateCache(): void {
  cachedTemplates = null;
  lastFetchTime = 0;
}

// ===== CONVERTER: GenericCardConfig → CardTemplate =====

/**
 * Konvertiert eine DB-Kartenvorlage (GenericCardConfig) in das
 * VE CardTemplate-Format mit CardTemplateElement[].
 *
 * Der Superadmin-Editor arbeitet mit GenericCardConfig, das viel
 * reichhaltiger ist (Icon, Price, Rating, Features, Social etc.).
 * Wir mappen die aktivierten Features auf CardTemplateElements.
 */
function convertDBTemplateToVE(dbTpl: DBCardTemplate): CardTemplate {
  const cfg = dbTpl.config;
  const elements: CardTemplateElement[] = [];

  // Derive template elements from the config's enabled features
  // and the first item's data (as the "prototype" card).
  const protoItem: Partial<GenericCardItem> = cfg.items?.[0] || {};

  // 1. Image (if showImage is enabled and there's an image in the prototype)
  if (cfg.showImage && cfg.imageElementStyle?.enabled !== false) {
    elements.push({
      type: 'CardImage',
      label: 'Bild',
      required: true,
      defaultContent: protoItem.image
        ? { src: protoItem.image, alt: protoItem.title || '' }
        : undefined,
      styles: buildImageStyles(cfg),
    });
  }

  // 2. Icon (if icon style is enabled)
  if (cfg.iconStyle?.enabled && protoItem.icon) {
    elements.push({
      type: 'CardIcon',
      label: 'Icon',
      defaultContent: { icon: protoItem.icon },
      styles: buildIconStyles(cfg),
    });
  }

  // 3. Overline (if enabled)
  if (cfg.overlineStyle?.enabled && protoItem.overline) {
    elements.push({
      type: 'CardText',
      label: 'Overline',
      textStyle: 'label',
      defaultContent: protoItem.overline,
      styles: buildOverlineStyles(cfg),
    });
  }

  // 4. Title (always present)
  elements.push({
    type: 'CardText',
    label: 'Titel',
    textStyle: 'h3',
    required: true,
    defaultContent: protoItem.title || 'Titel',
    styles: buildTitleStyles(cfg),
  });

  // 5. Subtitle (if enabled)
  if (cfg.showSubtitle !== false && cfg.subtitleStyle?.enabled !== false) {
    elements.push({
      type: 'CardText',
      label: 'Untertitel',
      textStyle: 'body',
      defaultContent: protoItem.subtitle || 'Untertitel',
      styles: buildSubtitleStyles(cfg),
    });
  }

  // 6. Description (if enabled)
  if (cfg.showDescription !== false && cfg.descriptionStyle?.enabled !== false) {
    elements.push({
      type: 'CardText',
      label: 'Beschreibung',
      textStyle: 'body',
      defaultContent: protoItem.description || 'Beschreibung',
      styles: buildDescriptionStyles(cfg),
    });
  }

  // 7. Rating (if enabled)
  if (cfg.ratingStyle?.enabled) {
    elements.push({
      type: 'CardRating',
      label: 'Bewertung',
      defaultContent: { value: protoItem.rating || 5, maxStars: 5 },
      styles: buildRatingStyles(cfg),
    });
  }

  // 8. Price (if enabled)
  if (cfg.priceStyle?.enabled && protoItem.price !== undefined) {
    elements.push({
      type: 'CardText',
      label: 'Preis',
      textStyle: 'price',
      defaultContent: `${protoItem.priceUnit || ''}${protoItem.price}€`,
      styles: buildPriceStyles(cfg),
    });
  }

  // 9. Button (if enabled)
  if (cfg.showButton) {
    elements.push({
      type: 'CardButton',
      label: 'Button',
      defaultContent: {
        text: protoItem.ctaText || 'Details',
        link: protoItem.ctaUrl || '#',
      },
      styles: buildButtonStyles(cfg),
    });
  }

  return {
    id: dbTpl.id,
    name: dbTpl.name,
    description: dbTpl.description || undefined,
    category: mapCategory(dbTpl.category),
    elements,
    imageLayout: cfg.cardLayoutVariant === 'horizontal' ? 'left' : 'top-full',
    isBuiltIn: false,
    createdAt: dbTpl.created_at,
    cardStyles: buildCardContainerStyles(cfg),
  };
}

// ===== STYLE BUILDERS =====
// These convert GenericCardConfig styling into VE ElementStyles
// that get applied when creating card children from the template.

import type { ElementStyles, StyleProperties } from '../types/styles';

function sv(value: number, unit: 'px' | '%' = 'px'): { value: number; unit: 'px' | '%' } {
  return { value, unit };
}

function buildImageStyles(cfg: GenericCardConfig): ElementStyles {
  const imgStyle = cfg.imageElementStyle;
  return {
    desktop: {
      width: sv(100, '%'),
      height: sv(200),
      objectFit: (cfg.imageStyle?.fit as any) || 'cover',
      borderRadius: sv(0),
      paddingTop: imgStyle?.padding ? sv(imgStyle.padding) : undefined,
      paddingBottom: imgStyle?.padding ? sv(imgStyle.padding) : undefined,
      paddingLeft: imgStyle?.padding ? sv(imgStyle.padding) : undefined,
      paddingRight: imgStyle?.padding ? sv(imgStyle.padding) : undefined,
      marginBottom: imgStyle?.marginBottom ? sv(imgStyle.marginBottom) : sv(16),
    },
  };
}

function buildIconStyles(cfg: GenericCardConfig): ElementStyles {
  const iconSizeMap: Record<string, number> = { sm: 16, md: 20, lg: 24, xl: 32, '2xl': 48 };
  const size = iconSizeMap[cfg.iconStyle?.size || 'lg'] || 24;
  return {
    desktop: {
      fontSize: sv(size),
      color: cfg.iconStyle?.color || undefined,
      textAlign: (cfg.iconStyle?.horizontalAlign as any) || 'center',
    },
  };
}

function buildOverlineStyles(cfg: GenericCardConfig): ElementStyles {
  return {
    desktop: {
      fontSize: sv(cfg.overlineStyle?.fontSize?.desktop || 12),
      color: cfg.overlineStyle?.color || undefined,
      marginBottom: sv(cfg.overlineStyle?.marginBottom || 8),
    },
  };
}

function buildTitleStyles(cfg: GenericCardConfig): ElementStyles {
  return {
    desktop: {
      fontSize: sv(cfg.titleStyle?.fontSize?.desktop || 20),
      color: cfg.titleStyle?.color || undefined,
      fontWeight: (cfg.typography?.titleWeight || 600) as StyleProperties['fontWeight'],
      marginBottom: sv(cfg.titleStyle?.marginBottom || 8),
    },
  };
}

function buildSubtitleStyles(cfg: GenericCardConfig): ElementStyles {
  return {
    desktop: {
      fontSize: sv(cfg.subtitleStyle?.fontSize?.desktop || 16),
      color: cfg.subtitleStyle?.color || undefined,
      marginBottom: sv(cfg.subtitleStyle?.marginBottom || 12),
    },
  };
}

function buildDescriptionStyles(cfg: GenericCardConfig): ElementStyles {
  return {
    desktop: {
      fontSize: sv(cfg.descriptionStyle?.fontSize?.desktop || 14),
      color: cfg.descriptionStyle?.color || undefined,
      marginBottom: sv(cfg.descriptionStyle?.marginBottom || 16),
    },
  };
}

function buildRatingStyles(cfg: GenericCardConfig): ElementStyles {
  const sizeMap: Record<string, number> = { sm: 14, md: 18, lg: 22 };
  return {
    desktop: {
      fontSize: sv(sizeMap[cfg.ratingStyle?.size || 'md'] || 18),
      color: cfg.ratingStyle?.filledColor || { kind: 'custom', hex: '#f59e0b' },
    },
  };
}

function buildPriceStyles(cfg: GenericCardConfig): ElementStyles {
  const sizeMap: Record<string, number> = { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30 };
  return {
    desktop: {
      fontSize: sv(sizeMap[cfg.priceStyle?.size || 'xl'] || 20),
      fontWeight: cfg.priceStyle?.weight === 'bold' ? 700 : cfg.priceStyle?.weight === 'semibold' ? 600 : 400,
      color: cfg.priceStyle?.color || undefined,
    },
  };
}

function buildButtonStyles(cfg: GenericCardConfig): ElementStyles {
  return {
    desktop: {
      backgroundColor: cfg.buttonStyle?.backgroundColor || undefined,
      color: cfg.buttonStyle?.textColor || undefined,
      borderRadius: sv(8),
      paddingTop: sv(8),
      paddingBottom: sv(8),
      paddingLeft: sv(16),
      paddingRight: sv(16),
      marginTop: sv(8),
      fontSize: sv(13),
      fontWeight: 600,
    },
  };
}

function buildCardContainerStyles(cfg: GenericCardConfig): ElementStyles {
  const borderRadiusValues: Record<string, number> = { none: 0, sm: 4, md: 8, lg: 12, xl: 16, '2xl': 24, full: 9999 };
  const shadowValues: Record<string, string> = {
    none: 'none',
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
    xl: '0 20px 25px rgba(0,0,0,0.1)',
  };
  const paddingValues: Record<string, number> = { none: 0, xs: 8, sm: 12, md: 16, lg: 24, xl: 32, '2xl': 48 };
  const cardStyle = cfg.cardStyle || {} as any;

  return {
    desktop: {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: cardStyle.backgroundColor || { kind: 'custom', hex: '#ffffff' },
      borderRadius: sv(borderRadiusValues[cardStyle.borderRadius] || 8),
      borderWidth: cardStyle.borderWidth ? sv(cardStyle.borderWidth) : undefined,
      borderStyle: cardStyle.borderWidth ? 'solid' : undefined,
      borderColor: cardStyle.borderColor || undefined,
      boxShadow: shadowValues[cardStyle.shadow] || shadowValues.md,
      paddingTop: sv(paddingValues[cardStyle.padding] || 0),
      paddingBottom: sv(paddingValues[cardStyle.padding] || 16),
      paddingLeft: sv(paddingValues[cardStyle.padding] || 0),
      paddingRight: sv(paddingValues[cardStyle.padding] || 0),
      overflow: 'hidden',
    },
  };
}

// ===== CATEGORY MAPPER =====

function mapCategory(dbCategory: string): CardTemplate['category'] {
  const validCategories: CardTemplate['category'][] = ['service', 'team', 'product', 'testimonial', 'general'];
  if (validCategories.includes(dbCategory as any)) return dbCategory as CardTemplate['category'];
  // Map additional DB categories to existing ones
  const mapping: Record<string, CardTemplate['category']> = {
    business: 'general',
    portfolio: 'general',
    pricing: 'service',
    feature: 'general',
    offer: 'product',
  };
  return mapping[dbCategory] || 'general';
}
