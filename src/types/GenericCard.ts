// =====================================================
// GENERIC CARD TYPES
// Flexible Karten-Konfiguration für alle Anwendungsfälle
// =====================================================

import { ColorValue } from './theme';
import {
  Spacing,
  FontSize,
  FontWeight,
  CardBaseStyle,
  CardImageStyle,
  CardTextStyle,
  CardButtonStyle,
  CardGridConfig,
  CardSectionStyle,
  createDefaultCardBaseStyle,
  createDefaultCardImageStyle,
  createDefaultCardTextStyle,
  createDefaultCardButtonStyle,
  createDefaultCardGridConfig,
  createDefaultSectionStyle,
} from './Cards';

// ===== GENERIC CARD ITEM =====

export interface GenericCardItem {
  id: string;
  
  // Content
  overline?: string; // Small text above title
  title: string;
  subtitle?: string;
  description?: string; // HTML content from WYSIWYG
  
  // Media
  image?: string;
  icon?: string; // Lucide icon name
  
  // Pricing (optional)
  price?: number;
  priceUnit?: string; // "€", "ab €", "pro Stunde"
  originalPrice?: number; // For showing discounts
  
  // Rating (optional)
  rating?: number; // 1-5
  ratingCount?: number;
  
  // Features/Tags (optional)
  features?: string[];
  tags?: string[];
  
  // CTA (optional)
  ctaText?: string;
  ctaUrl?: string;
  
  // Social Links (optional)
  socialLinks?: {
    type: 'instagram' | 'facebook' | 'linkedin' | 'twitter' | 'email' | 'phone' | 'website';
    url: string;
  }[];
  
  // Meta
  highlighted?: boolean;
  order: number;
}

// ===== ICON STYLE =====

export interface IconStyle {
  enabled: boolean;
  size: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  color: ColorValue;
  backgroundColor?: ColorValue;
  backgroundEnabled: boolean;
  backgroundShape: 'circle' | 'square' | 'rounded';
  backgroundPadding: Spacing;
}

// ===== PRICE STYLE =====

export interface PriceStyle {
  enabled: boolean;
  position: 'top-right' | 'below-title' | 'bottom';
  size: FontSize;
  weight: FontWeight;
  color: ColorValue;
  showOriginalPrice: boolean;
  originalPriceColor: ColorValue;
  showBadge: boolean;
  badgeText?: string;
  badgeColor: ColorValue;
  badgeBackground: ColorValue;
}

// ===== RATING STYLE =====

export interface RatingStyle {
  enabled: boolean;
  style: 'stars' | 'numbers' | 'hearts';
  size: 'sm' | 'md' | 'lg';
  filledColor: ColorValue;
  emptyColor: ColorValue;
  showCount: boolean;
  countColor: ColorValue;
}

// ===== FEATURES STYLE =====

export interface FeaturesStyle {
  enabled: boolean;
  icon: string; // Lucide icon name
  iconColor: ColorValue;
  textColor: ColorValue;
  textSize: FontSize;
  layout: 'list' | 'inline' | 'grid';
  maxItems?: number;
}

// ===== SOCIAL STYLE =====

export interface SocialStyle {
  enabled: boolean;
  iconStyle: 'filled' | 'outline' | 'ghost';
  iconSize: 'sm' | 'md' | 'lg';
  iconColor: ColorValue;
  iconHoverColor: ColorValue;
  layout: 'row' | 'column';
  gap: Spacing;
}

// ===== CARD LAYOUT VARIANTS =====

export type CardLayoutVariant = 
  | 'vertical'      // Image/Icon top, content below
  | 'horizontal'    // Image/Icon left, content right
  | 'overlay'       // Content overlays image
  | 'minimal';      // Just content, no media

// ===== CARD TYPOGRAPHY CONFIG =====

export interface CardTypographyConfig {
  enabled: boolean;
  titleFont: string;          // Font ID
  titleWeight: number;
  bodyFont: string;           // Font ID
  bodyWeight: number;
}

// ===== FONT SIZE CONFIG =====

export interface FontSizeConfig {
  desktop?: number;
  tablet?: number;
  mobile?: number;
}

// ===== CONTENT ELEMENT STYLES =====

export interface ContentElementStyle {
  color?: ColorValue;
  marginBottom: number; // in px
}

export interface ImageElementStyle extends ContentElementStyle {
  padding: number; // in px
  enabled: boolean;
}

export interface OverlineStyle extends ContentElementStyle {
  enabled: boolean;
  font?: string;
  fontSize?: FontSizeConfig;
}

export interface TitleStyle extends ContentElementStyle {
  font?: string;
  fontSize?: FontSizeConfig;
}

export interface SubtitleStyle extends ContentElementStyle {
  enabled: boolean;
  fontSize?: FontSizeConfig;
}

export interface DescriptionStyle extends ContentElementStyle {
  enabled: boolean;
  font?: string;
  fontSize?: FontSizeConfig;
}

// ===== GENERIC CARD CONFIG =====

export interface GenericCardConfig {
  // Items
  items: GenericCardItem[];
  
  // Layout
  layout: 'grid' | 'carousel' | 'list' | 'masonry';
  cardLayoutVariant: CardLayoutVariant;
  grid: CardGridConfig;
  
  // Typography
  typography: CardTypographyConfig;
  
  // Card Base Style
  cardStyle: CardBaseStyle;
  
  // Image Style
  imageStyle: CardImageStyle;
  showImage: boolean;
  imageElementStyle: ImageElementStyle;
  
  // Icon Style (alternative to image)
  iconStyle: IconStyle;
  
  // Content Element Styles
  overlineStyle: OverlineStyle;
  titleStyle: TitleStyle;
  subtitleStyle: SubtitleStyle;
  descriptionStyle: DescriptionStyle;
  
  // Text Style (legacy)
  textStyle: CardTextStyle;
  showSubtitle: boolean;
  showDescription: boolean;
  descriptionLineClamp?: number;
  
  // Price Style
  priceStyle: PriceStyle;
  
  // Rating Style
  ratingStyle: RatingStyle;
  
  // Features Style
  featuresStyle: FeaturesStyle;
  
  // Social Style
  socialStyle: SocialStyle;
  
  // Button Style
  buttonStyle: CardButtonStyle;
  showButton: boolean;
  
  // Section Style
  sectionStyle: CardSectionStyle;
}

// ===== DEFAULT VALUES =====

export const createDefaultIconStyle = (): IconStyle => ({
  enabled: false,
  size: 'lg',
  color: { kind: 'tokenRef', ref: 'semantic.buttonPrimaryBg' },
  backgroundEnabled: false,
  backgroundShape: 'circle',
  backgroundPadding: 'md',
});

export const createDefaultPriceStyle = (): PriceStyle => ({
  enabled: false,
  position: 'bottom',
  size: 'xl',
  weight: 'bold',
  color: { kind: 'tokenRef', ref: 'semantic.buttonPrimaryBg' },
  showOriginalPrice: false,
  originalPriceColor: { kind: 'tokenRef', ref: 'semantic.mutedText' },
  showBadge: false,
  badgeColor: { kind: 'custom', hex: '#FFFFFF' },
  badgeBackground: { kind: 'tokenRef', ref: 'semantic.buttonPrimaryBg' },
});

export const createDefaultRatingStyle = (): RatingStyle => ({
  enabled: false,
  style: 'stars',
  size: 'md',
  filledColor: { kind: 'custom', hex: '#FBBF24' },
  emptyColor: { kind: 'tokenRef', ref: 'semantic.border' },
  showCount: false,
  countColor: { kind: 'tokenRef', ref: 'semantic.mutedText' },
});

export const createDefaultFeaturesStyle = (): FeaturesStyle => ({
  enabled: false,
  icon: 'Check',
  iconColor: { kind: 'tokenRef', ref: 'semantic.success' },
  textColor: { kind: 'tokenRef', ref: 'semantic.bodyText' },
  textSize: 'sm',
  layout: 'list',
});

export const createDefaultSocialStyle = (): SocialStyle => ({
  enabled: false,
  iconStyle: 'ghost',
  iconSize: 'md',
  iconColor: { kind: 'tokenRef', ref: 'semantic.mutedText' },
  iconHoverColor: { kind: 'tokenRef', ref: 'semantic.buttonPrimaryBg' },
  layout: 'row',
  gap: 'sm',
});

export const createDefaultCardTypography = (): CardTypographyConfig => ({
  enabled: false,
  titleFont: 'inter',
  titleWeight: 600,
  bodyFont: 'inter',
  bodyWeight: 400,
});

export const createDefaultImageElementStyle = (): ImageElementStyle => ({
  enabled: true,
  padding: 0,
  marginBottom: 16,
});

export const createDefaultOverlineStyle = (): OverlineStyle => ({
  enabled: false,
  color: { kind: 'tokenRef', ref: 'semantic.mutedText' },
  marginBottom: 8,
});

export const createDefaultTitleStyle = (): TitleStyle => ({
  color: { kind: 'tokenRef', ref: 'semantic.headingText' },
  marginBottom: 8,
});

export const createDefaultSubtitleStyle = (): SubtitleStyle => ({
  enabled: true,
  color: { kind: 'tokenRef', ref: 'semantic.mutedText' },
  marginBottom: 12,
});

export const createDefaultDescriptionStyle = (): DescriptionStyle => ({
  enabled: true,
  color: { kind: 'tokenRef', ref: 'semantic.bodyText' },
  marginBottom: 16,
});

export const createDefaultGenericCardItem = (): GenericCardItem => ({
  id: crypto.randomUUID(),
  title: 'Neue Karte',
  order: 0,
});

export const createDefaultGenericCardConfig = (): GenericCardConfig => ({
  items: [],
  layout: 'grid',
  cardLayoutVariant: 'vertical',
  grid: createDefaultCardGridConfig(),
  typography: createDefaultCardTypography(),
  cardStyle: createDefaultCardBaseStyle(),
  imageStyle: createDefaultCardImageStyle(),
  showImage: true,
  imageElementStyle: createDefaultImageElementStyle(),
  iconStyle: createDefaultIconStyle(),
  overlineStyle: createDefaultOverlineStyle(),
  titleStyle: createDefaultTitleStyle(),
  subtitleStyle: createDefaultSubtitleStyle(),
  descriptionStyle: createDefaultDescriptionStyle(),
  textStyle: createDefaultCardTextStyle(),
  showSubtitle: true,
  showDescription: true,
  priceStyle: createDefaultPriceStyle(),
  ratingStyle: createDefaultRatingStyle(),
  featuresStyle: createDefaultFeaturesStyle(),
  socialStyle: createDefaultSocialStyle(),
  buttonStyle: createDefaultCardButtonStyle(),
  showButton: false,
  sectionStyle: {
    ...createDefaultSectionStyle(),
    title: 'Unsere Karten',
    subtitle: 'Entdecken Sie unsere Angebote',
  },
});

// Template-Konfiguration mit Beispiel-Karten für Vorschau
export const createTemplateCardConfig = (): GenericCardConfig => ({
  items: [
    {
      id: crypto.randomUUID(),
      title: 'Beispiel-Karte 1',
      subtitle: 'Untertitel',
      description: 'Dies ist eine Beispielbeschreibung für die erste Karte.',
      icon: 'Star',
      order: 0,
    },
    {
      id: crypto.randomUUID(),
      title: 'Beispiel-Karte 2',
      subtitle: 'Untertitel',
      description: 'Dies ist eine Beispielbeschreibung für die zweite Karte.',
      icon: 'Heart',
      order: 1,
    },
    {
      id: crypto.randomUUID(),
      title: 'Beispiel-Karte 3',
      subtitle: 'Untertitel',
      description: 'Dies ist eine Beispielbeschreibung für die dritte Karte.',
      icon: 'Sparkles',
      order: 2,
    },
  ],
  layout: 'grid',
  cardLayoutVariant: 'vertical',
  grid: createDefaultCardGridConfig(),
  typography: createDefaultCardTypography(),
  cardStyle: createDefaultCardBaseStyle(),
  imageStyle: createDefaultCardImageStyle(),
  showImage: false,
  imageElementStyle: createDefaultImageElementStyle(),
  iconStyle: {
    enabled: true,
    size: 'xl',
    color: { kind: 'tokenRef', ref: 'semantic.buttonPrimaryBg' },
    backgroundEnabled: true,
    backgroundColor: { kind: 'custom', hex: '#FEE2E2' },
    backgroundShape: 'circle',
    backgroundPadding: 'md',
  },
  overlineStyle: createDefaultOverlineStyle(),
  titleStyle: createDefaultTitleStyle(),
  subtitleStyle: createDefaultSubtitleStyle(),
  descriptionStyle: createDefaultDescriptionStyle(),
  textStyle: createDefaultCardTextStyle(),
  showSubtitle: true,
  showDescription: true,
  priceStyle: createDefaultPriceStyle(),
  ratingStyle: createDefaultRatingStyle(),
  featuresStyle: createDefaultFeaturesStyle(),
  socialStyle: createDefaultSocialStyle(),
  buttonStyle: createDefaultCardButtonStyle(),
  showButton: false,
  sectionStyle: {
    ...createDefaultSectionStyle(),
    showHeader: false,
  },
});
