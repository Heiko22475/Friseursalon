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

// ===== GENERIC CARD CONFIG =====

export interface GenericCardConfig {
  // Items
  items: GenericCardItem[];
  
  // Layout
  layout: 'grid' | 'carousel' | 'list' | 'masonry';
  cardLayoutVariant: CardLayoutVariant;
  grid: CardGridConfig;
  
  // Card Base Style
  cardStyle: CardBaseStyle;
  
  // Image Style
  imageStyle: CardImageStyle;
  showImage: boolean;
  
  // Icon Style (alternative to image)
  iconStyle: IconStyle;
  
  // Text Style
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
  cardStyle: createDefaultCardBaseStyle(),
  imageStyle: createDefaultCardImageStyle(),
  showImage: true,
  iconStyle: createDefaultIconStyle(),
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
