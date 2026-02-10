// =====================================================
// CONVERTER: Website JSON → VE Elements
//
// Zerlegt Website-Blöcke (Hero, GenericCard, etc.) in native
// VE-Elemente (Section, Container, Text, Image, Button),
// MIT den korrekten Styles aus der Block-Konfiguration.
//
// So können Texte selektiert, verschoben und inline bearbeitet
// werden – über das bestehende VE-System.
// =====================================================

import type { VEPage, VEBody, VEElement, VESection, VEText, VEImage, VEButton, VEContainer, TextStylePreset } from '../types/elements';
import type { ElementStyles, StyleProperties } from '../types/styles';
import type { ColorValue } from '../../types/theme';
import { sv } from '../types/styles';
import type { HeroConfig, HeroText, HeroButton as HeroButtonType } from '../../types/Hero';

// ===== PUBLIC API =====

export function convertWebsiteToVEPages(content: any): VEPage[] {
  if (!content?.pages || !Array.isArray(content.pages)) return [];

  return content.pages.map((page: any) => {
    const children: VEElement[] = (page.blocks || []).map((block: any, idx: number) => {
      return convertBlock(block, idx, page.id);
    });

    const body: VEBody = {
      id: `body-${page.id}`,
      type: 'Body',
      label: 'Body',
      styles: {
        desktop: {
          backgroundColor: { kind: 'custom', hex: '#ffffff' },
        },
      },
      children,
    };

    return {
      id: page.id,
      name: page.title || 'Seite',
      route: page.slug === 'home' ? '/' : `/${page.slug}`,
      body,
      isVisualEditor: true,
      isPublished: page.is_published ?? true,
    } as VEPage;
  });
}

// ===== BLOCK DISPATCHER =====

function convertBlock(block: any, idx: number, pageId: string): VEElement {
  const blockId = block.id || `block-${pageId}-${idx}`;

  switch (block.type) {
    case 'hero':
      return convertHeroBlock(block.config, blockId, idx);
    case 'generic-card':
      return convertGenericCardBlock(block.config, blockId, idx);
    default:
      return convertFallbackBlock(block, blockId, idx);
  }
}

// ===== HERO → VE ELEMENTS =====

function convertHeroBlock(config: HeroConfig | undefined, blockId: string, position: number): VESection {
  const cfg = config || { backgroundImage: '', backgroundPosition: { x: 50, y: 50 }, overlay: { enabled: false, color: '#000', opacity: 50 }, height: { desktop: '600px' }, logos: [], texts: [], buttons: [] };
  
  const children: VEElement[] = [];

  // Background image as a VEImage (if present)
  if (cfg.backgroundImage) {
    children.push({
      id: `${blockId}__bg`,
      type: 'Image',
      label: 'Hintergrundbild',
      content: { src: cfg.backgroundImage, alt: 'Hero Hintergrund' },
      styles: {
        desktop: {
          position: 'absolute',
          top: sv(0),
          left: sv(0),
          width: sv(100, '%'),
          height: sv(100, '%'),
          objectFit: 'cover',
          objectPosition: `${cfg.backgroundPosition?.x ?? 50}% ${cfg.backgroundPosition?.y ?? 50}%`,
          zIndex: 0,
        },
      },
    } as VEImage);
  }

  // Overlay (as a Container div)
  if (cfg.overlay?.enabled) {
    children.push({
      id: `${blockId}__overlay`,
      type: 'Container',
      label: 'Overlay',
      children: [],
      styles: {
        desktop: {
          position: 'absolute',
          top: sv(0),
          left: sv(0),
          width: sv(100, '%'),
          height: sv(100, '%'),
          backgroundColor: colorVal(cfg.overlay.color),
          opacity: (cfg.overlay.opacity || 50) / 100,
          zIndex: 1,
        },
      },
    } as VEContainer);
  }

  // Texts
  const texts = cfg.texts || [];
  for (let i = 0; i < texts.length; i++) {
    const t = texts[i];
    const visible = t.visible?.desktop !== false;
    if (!visible) continue;

    const fontSize = typeof t.fontSize === 'object' ? t.fontSize.desktop : (t.fontSize || 32);
    const preset = guessTextPreset(fontSize);

    children.push({
      id: `${blockId}__text-${i}`,
      type: 'Text',
      label: stripHtml(t.content || '').slice(0, 40) || `Text ${i + 1}`,
      content: t.content || '',
      textStyle: preset,
      styles: heroTextStyles(t),
    } as VEText);
  }

  // Buttons
  const buttons = cfg.buttons || [];
  for (let i = 0; i < buttons.length; i++) {
    const b = buttons[i];
    const visible = b.visible?.desktop !== false;
    if (!visible) continue;

    children.push({
      id: `${blockId}__btn-${i}`,
      type: 'Button',
      label: b.text || `Button ${i + 1}`,
      content: { text: b.text || '', link: b.action?.value || '#' },
      styles: heroButtonStyles(b),
    } as VEButton);
  }

  // Section wrapper with hero-like styling
  const heightVal = typeof cfg.height === 'object' ? cfg.height.desktop : (cfg.height || '600px');
  const heightTablet = typeof cfg.height === 'object' ? cfg.height.tablet : undefined;
  const heightMobile = typeof cfg.height === 'object' ? cfg.height.mobile : undefined;

  const sectionStyles: ElementStyles = {
    desktop: {
      position: 'relative',
      overflow: 'hidden',
      width: sv(100, '%'),
      height: parseSizeValue(heightVal),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: cfg.backgroundImage ? undefined : colorVal('#374151'),
    },
  };
  if (heightTablet) {
    sectionStyles.tablet = { height: parseSizeValue(heightTablet) };
  }
  if (heightMobile) {
    sectionStyles.mobile = { height: parseSizeValue(heightMobile) };
  }

  return {
    id: blockId,
    type: 'Section',
    label: getHeroLabel(cfg),
    children,
    styles: sectionStyles,
    // Store original block metadata for save-merge
    _blockMeta: { type: 'hero', config: cfg, position },
  } as VESection & { _blockMeta: any };
}

// ===== GENERIC CARD → VE ELEMENTS =====

function convertGenericCardBlock(config: any, blockId: string, position: number): VESection {
  const cfg = config || {};
  const children: VEElement[] = [];

  // Section title
  const ss = cfg.sectionStyle || {};
  if (ss.showHeader && ss.title) {
    children.push({
      id: `${blockId}__sec-title`,
      type: 'Text',
      label: stripHtml(ss.title).slice(0, 40) || 'Überschrift',
      content: ss.title,
      textStyle: 'h2' as TextStylePreset,
      styles: {
        desktop: {
          textAlign: ss.headerAlign || 'center',
          color: ss.titleColor || undefined,
          marginBottom: sv(16),
        },
      },
    } as VEText);
  }

  if (ss.showHeader && ss.subtitle) {
    children.push({
      id: `${blockId}__sec-sub`,
      type: 'Text',
      label: stripHtml(ss.subtitle).slice(0, 40) || 'Untertitel',
      content: ss.subtitle,
      textStyle: 'body' as TextStylePreset,
      styles: {
        desktop: {
          textAlign: ss.headerAlign || 'center',
          color: ss.subtitleColor || undefined,
          marginBottom: sv(48),
        },
      },
    } as VEText);
  }

  // Cards as a container grid
  const items = cfg.items || cfg.cards || [];
  if (items.length > 0) {
    const cols = cfg.grid?.columns?.desktop || 3;
    const gap = cfg.grid?.gap || 'md';
    const gapValues: Record<string, number> = { xs: 8, sm: 12, md: 16, lg: 24, xl: 32, '2xl': 48 };
    const gapPx = gapValues[gap] || 16;

    const cardElements: VEElement[] = items.map((item: any, i: number) => {
      return convertCardItem(item, i, blockId, cfg);
    });

    children.push({
      id: `${blockId}__cards-grid`,
      type: 'Container',
      label: 'Karten-Grid',
      children: cardElements,
      styles: {
        desktop: {
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gap: sv(gapPx),
          width: sv(100, '%'),
        },
        tablet: cfg.grid?.columns?.tablet ? {
          gridTemplateColumns: `repeat(${cfg.grid.columns.tablet}, minmax(0, 1fr))`,
        } : undefined,
        mobile: cfg.grid?.columns?.mobile ? {
          gridTemplateColumns: `repeat(${cfg.grid.columns.mobile}, minmax(0, 1fr))`,
        } : { gridTemplateColumns: '1fr' },
      },
    } as VEContainer);
  }

  // Section wrapper
  const paddingValues: Record<string, number> = { none: 0, xs: 8, sm: 16, md: 24, lg: 32, xl: 48, '2xl': 64 };
  const paddingY = paddingValues[ss.paddingY] || 64;
  const paddingX = paddingValues[ss.paddingX] || 16;

  return {
    id: blockId,
    type: 'Section',
    label: ss.title ? stripHtml(ss.title).slice(0, 30) : 'Karten',
    children,
    styles: {
      desktop: {
        backgroundColor: ss.backgroundColor || undefined,
        paddingTop: sv(paddingY),
        paddingBottom: sv(paddingY),
        paddingLeft: sv(paddingX),
        paddingRight: sv(paddingX),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      },
    },
    _blockMeta: { type: 'generic-card', config: cfg, position },
  } as VESection & { _blockMeta: any };
}

function convertCardItem(item: any, index: number, blockId: string, cfg: any): VEContainer {
  const children: VEElement[] = [];
  const cardStyle = cfg.cardStyle || {};
  const textStyle = cfg.textStyle || {};
  const imageStyle = cfg.imageStyle || {};

  // Card image
  if (item.image || item.imageUrl) {
    const imgSrc = item.image || item.imageUrl;
    children.push({
      id: `${blockId}__card-${index}-img`,
      type: 'Image',
      label: 'Bild',
      content: { src: imgSrc, alt: item.title || '' },
      styles: {
        desktop: {
          width: sv(100, '%'),
          height: sv(200),
          objectFit: (imageStyle.fit as any) || 'cover',
          borderRadius: sv(0),
        },
      },
    } as VEImage);
  }

  // Card title
  if (item.title) {
    children.push({
      id: `${blockId}__card-${index}-title`,
      type: 'Text',
      label: item.title.slice(0, 40),
      content: item.title,
      textStyle: 'h3' as TextStylePreset,
      styles: {
        desktop: {
          color: cfg.titleStyle?.color || undefined,
          fontWeight: textStyle.titleWeight ? parseInt(textStyle.titleWeight) as any : 600,
          marginBottom: sv(8),
        },
      },
    } as VEText);
  }

  // Card subtitle
  if (item.subtitle && cfg.showSubtitle !== false) {
    children.push({
      id: `${blockId}__card-${index}-sub`,
      type: 'Text',
      label: item.subtitle.slice(0, 40),
      content: item.subtitle,
      textStyle: 'body' as TextStylePreset,
      styles: {
        desktop: {
          color: cfg.subtitleStyle?.color || undefined,
          marginBottom: sv(12),
        },
      },
    } as VEText);
  }

  // Card description
  if (item.description && cfg.showDescription !== false) {
    children.push({
      id: `${blockId}__card-${index}-desc`,
      type: 'Text',
      label: stripHtml(item.description).slice(0, 40) || 'Beschreibung',
      content: item.description,
      textStyle: 'body' as TextStylePreset,
      styles: {
        desktop: {
          color: cfg.descriptionStyle?.color || undefined,
          marginBottom: sv(12),
        },
      },
    } as VEText);
  }

  // Card price
  if (item.price !== undefined && cfg.priceStyle?.enabled) {
    children.push({
      id: `${blockId}__card-${index}-price`,
      type: 'Text',
      label: `Preis: ${item.price}`,
      content: `${item.priceUnit || ''}${item.price}€`,
      textStyle: 'price' as TextStylePreset,
      styles: {
        desktop: {
          color: cfg.priceStyle?.color || undefined,
        },
      },
    } as VEText);
  }

  // Card CTA button
  if (cfg.showButton && item.ctaText && item.ctaUrl) {
    children.push({
      id: `${blockId}__card-${index}-btn`,
      type: 'Button',
      label: item.ctaText,
      content: { text: item.ctaText, link: item.ctaUrl },
      styles: {
        desktop: {
          backgroundColor: cfg.buttonStyle?.backgroundColor || undefined,
          color: cfg.buttonStyle?.textColor || undefined,
          borderRadius: sv(8),
          paddingTop: sv(8),
          paddingBottom: sv(8),
          paddingLeft: sv(16),
          paddingRight: sv(16),
          marginTop: sv(8),
        },
      },
    } as VEButton);
  }

  // Card container with styling
  const borderRadiusValues: Record<string, number> = { none: 0, sm: 4, md: 8, lg: 12, xl: 16, '2xl': 24, full: 9999 };
  const shadowValues: Record<string, string> = { none: 'none', sm: '0 1px 2px rgba(0,0,0,0.05)', md: '0 4px 6px rgba(0,0,0,0.1)', lg: '0 10px 15px rgba(0,0,0,0.1)', xl: '0 20px 25px rgba(0,0,0,0.1)' };
  const paddingValues: Record<string, number> = { none: 0, xs: 8, sm: 12, md: 16, lg: 24, xl: 32, '2xl': 48 };

  return {
    id: `${blockId}__card-${index}`,
    type: 'Container',
    label: item.title || `Karte ${index + 1}`,
    children,
    styles: {
      desktop: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: cardStyle.backgroundColor || colorVal('#ffffff'),
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
    },
  } as VEContainer;
}

// ===== FALLBACK (unknown block types) =====

function convertFallbackBlock(block: any, blockId: string, position: number): VESection {
  const label = getFallbackLabel(block);

  return {
    id: blockId,
    type: 'Section',
    label,
    children: [{
      id: `${blockId}__placeholder`,
      type: 'Text',
      label: `${block.type || 'Unbekannt'}`,
      content: `<em>Block-Typ „${block.type}" – wird im Visual Editor noch nicht unterstützt</em>`,
      textStyle: 'body' as TextStylePreset,
      styles: {
        desktop: {
          textAlign: 'center',
          color: colorVal('#6b7280'),
          paddingTop: sv(48),
          paddingBottom: sv(48),
        },
      },
    } as VEText],
    styles: {
      desktop: {
        backgroundColor: colorVal('#f9fafb'),
        paddingTop: sv(24),
        paddingBottom: sv(24),
        paddingLeft: sv(24),
        paddingRight: sv(24),
      },
    },
    _blockMeta: { type: block.type, config: block.config, content: block.content, position },
  } as VESection & { _blockMeta: any };
}

// ===== STYLE HELPERS =====

function heroTextStyles(t: HeroText): ElementStyles {
  const pos = t.position?.desktop;
  const fontSize = typeof t.fontSize === 'object' ? t.fontSize.desktop : (t.fontSize || 32);

  const hPcts: Record<string, number> = { left: 10, 'left-center': 25, center: 50, 'right-center': 75, right: 90 };
  const vPcts: Record<string, number> = { top: 10, 'top-center': 30, middle: 50, 'bottom-center': 70, bottom: 90 };

  const leftPct = (hPcts[pos?.horizontal || 'center'] || 50) + (pos?.offsetX || 0);
  const topPct = (vPcts[pos?.vertical || 'middle'] || 50) + (pos?.offsetY || 0);

  const belowImage = t.belowImage?.desktop === true;

  const desktop: Partial<StyleProperties> = {
    position: belowImage ? 'static' as const : 'absolute' as const,
    ...(belowImage ? {} : {
      left: sv(leftPct, '%'),
      top: sv(topPct, '%'),
    }),
    color: colorVal(t.color || '#ffffff'),
    fontSize: sv(fontSize),
    fontWeight: (parseInt(t.fontWeight || '400') || 400) as any,
    textAlign: 'center',
    zIndex: 2,
  };

  if (t.fontFamily) {
    desktop.fontFamily = t.fontFamily;
  }

  const styles: ElementStyles = { desktop };

  // Responsive font sizes
  if (typeof t.fontSize === 'object') {
    if (t.fontSize.tablet) {
      styles.tablet = { fontSize: sv(t.fontSize.tablet) };
    }
    if (t.fontSize.mobile) {
      styles.mobile = { fontSize: sv(t.fontSize.mobile) };
    }
  }

  return styles;
}

function heroButtonStyles(b: HeroButtonType): ElementStyles {
  const pos = b.position?.desktop;
  const hPcts: Record<string, number> = { left: 10, 'left-center': 25, center: 50, 'right-center': 75, right: 90 };
  const vPcts: Record<string, number> = { top: 10, 'top-center': 30, middle: 50, 'bottom-center': 70, bottom: 90 };

  const leftPct = (hPcts[pos?.horizontal || 'center'] || 50) + (pos?.offsetX || 0);
  const topPct = (vPcts[pos?.vertical || 'bottom'] || 90) + (pos?.offsetY || 0);

  const belowImage = b.belowImage?.desktop === true;

  const desktop: Partial<StyleProperties> = {
    position: belowImage ? 'static' as const : 'absolute' as const,
    ...(belowImage ? {} : {
      left: sv(leftPct, '%'),
      top: sv(topPct, '%'),
    }),
    zIndex: 2,
    cursor: 'pointer',
  };

  // Button styling
  const style = b.style || {};
  if (style.variant === 'custom') {
    if (style.backgroundColor) desktop.backgroundColor = colorVal(style.backgroundColor);
    if (style.textColor) desktop.color = colorVal(style.textColor);
    if (style.borderColor) desktop.borderColor = colorVal(style.borderColor);
    desktop.borderWidth = sv(2);
    desktop.borderStyle = 'solid';
  } else if (style.variant === 'primary') {
    desktop.backgroundColor = colorVal('#f43f5e');
    desktop.color = colorVal('#ffffff');
  } else if (style.variant === 'secondary') {
    desktop.backgroundColor = colorVal('#374151');
    desktop.color = colorVal('#ffffff');
  } else if (style.variant === 'outline') {
    desktop.borderWidth = sv(2);
    desktop.borderStyle = 'solid';
    desktop.borderColor = colorVal('#ffffff');
    desktop.color = colorVal('#ffffff');
    desktop.backgroundColor = colorVal('transparent');
  }

  // Size
  const sizes: Record<string, { px: number; py: number; fs: number }> = {
    small: { px: 16, py: 8, fs: 14 },
    medium: { px: 24, py: 12, fs: 16 },
    large: { px: 32, py: 16, fs: 18 },
  };
  const sz = sizes[style.size || 'medium'] || sizes.medium;
  desktop.paddingLeft = sv(sz.px);
  desktop.paddingRight = sv(sz.px);
  desktop.paddingTop = sv(sz.py);
  desktop.paddingBottom = sv(sz.py);
  desktop.fontSize = sv(sz.fs);

  // Border radius
  const radiusMap: Record<string, number> = { none: 0, small: 4, medium: 8, large: 12, pill: 9999 };
  desktop.borderRadius = sv(radiusMap[style.borderRadius || 'medium'] || 8);

  return { desktop };
}

// ===== UTILITY =====

function colorVal(hex: string): ColorValue {
  return { kind: 'custom', hex };
}

function parseSizeValue(val: string | undefined): { value: number; unit: 'px' | 'vh' | '%' } | undefined {
  if (!val) return undefined;
  const match = val.match(/^(\d+(?:\.\d+)?)(px|vh|%)$/);
  if (match) {
    return { value: parseFloat(match[1]), unit: match[2] as any };
  }
  // Default to px
  const num = parseFloat(val);
  if (!isNaN(num)) return { value: num, unit: 'px' };
  return { value: 600, unit: 'px' };
}

function guessTextPreset(fontSize: number): TextStylePreset {
  if (fontSize >= 48) return 'h1';
  if (fontSize >= 36) return 'h2';
  if (fontSize >= 28) return 'h3';
  if (fontSize >= 24) return 'h4';
  if (fontSize >= 20) return 'h5';
  if (fontSize >= 18) return 'h6';
  if (fontSize >= 14) return 'body';
  return 'body-sm';
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

function getHeroLabel(cfg: HeroConfig): string {
  const firstText = cfg.texts?.[0]?.content;
  if (firstText) return `Hero: ${stripHtml(firstText).slice(0, 30)}`;
  return 'Hero';
}

function getFallbackLabel(block: any): string {
  const labels: Record<string, string> = {
    static_content: 'Statischer Inhalt',
    'static-content': 'Statischer Inhalt',
    services: 'Dienstleistungen',
    gallery: 'Galerie',
    reviews: 'Bewertungen',
    contact: 'Kontakt',
  };
  return labels[block.type] || `Block: ${block.type}`;
}
