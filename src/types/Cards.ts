// =====================================================
// CARD SYSTEM TYPES
// Konfigurierbare Karten mit Theming-Unterstützung
// =====================================================

import { ResponsiveNumber } from './Hero';
import { ColorValue } from './theme';

// ===== GEMEINSAME STYLE-OPTIONEN =====

// Border Radius Optionen
export type BorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

export const BORDER_RADIUS_VALUES: Record<BorderRadius, string> = {
  none: '0',
  sm: '0.125rem',   // 2px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px'
};

// Schatten Optionen
export type Shadow = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export const SHADOW_VALUES: Record<Shadow, string> = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)'
};

// Abstände
export type Spacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export const SPACING_VALUES: Record<Spacing, string> = {
  none: '0',
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem'    // 48px
};

// Schriftgrößen
export type FontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';

export const FONT_SIZE_VALUES: Record<FontSize, string> = {
  xs: '0.75rem',   // 12px
  sm: '0.875rem',  // 14px
  base: '1rem',    // 16px
  lg: '1.125rem',  // 18px
  xl: '1.25rem',   // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '1.875rem' // 30px
};

// Schriftgewichte
export type FontWeight = 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';

export const FONT_WEIGHT_VALUES: Record<FontWeight, number> = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900
};

// ===== CARD BASE STYLE =====

export interface CardBaseStyle {
  // Hintergrund
  backgroundColor: ColorValue;
  backgroundHover?: ColorValue;
  
  // Rahmen
  borderRadius: BorderRadius;
  borderWidth: 0 | 1 | 2 | 3 | 4;
  borderColor: ColorValue;
  
  // Schatten
  shadow: Shadow;
  shadowHover?: Shadow;
  
  // Innenabstand
  padding: Spacing;
  
  // Übergang-Animation
  transitionDuration: 150 | 200 | 300 | 500;
  
  // Hover-Effekt
  hoverEffect: 'none' | 'lift' | 'glow' | 'scale' | 'border';
}

// ===== BILD-STIL =====

export type ImageAspectRatio = '1:1' | '4:3' | '3:2' | '16:9' | '2:1' | 'auto';
export type ImageFit = 'cover' | 'contain' | 'fill';
export type ImagePosition = 'top' | 'left' | 'right' | 'bottom' | 'background';

export interface CardImageStyle {
  aspectRatio: ImageAspectRatio;
  fit: ImageFit;
  borderRadius: BorderRadius;
  position?: 'top' | 'left' | 'background' | 'none';
  width?: 'full' | 'fixed';
  height?: number;
  overlay?: {
    enabled: boolean;
    color: ColorValue;
    opacity: number; // 0-100
  };
}

// ===== TEXT-STIL =====

export interface CardTextStyle {
  // Titel
  titleSize: FontSize;
  titleWeight: FontWeight;
  titleColor: ColorValue;
  titleAlign: 'left' | 'center' | 'right';
  
  // Untertitel
  subtitleSize: FontSize;
  subtitleWeight: FontWeight;
  subtitleColor: ColorValue;
  
  // Beschreibung
  descriptionSize: FontSize;
  descriptionColor: ColorValue;
  descriptionLineClamp?: number; // Max Zeilen (1-5, undefined = unbegrenzt)
}

// ===== BUTTON-STIL =====

export interface CardButtonStyle {
  variant: 'filled' | 'outline' | 'ghost' | 'link';
  size: 'sm' | 'md' | 'lg';
  borderRadius: BorderRadius;
  backgroundColor: ColorValue;
  textColor: ColorValue;
  borderColor: ColorValue;
  padding?: Spacing;
  borderWidth?: 0 | 1 | 2 | 3 | 4;
  fullWidth: boolean;
}

// ===== GRID LAYOUT =====

export interface CardGridConfig {
  columns: ResponsiveNumber; // 1-6
  gap: Spacing;
  alignItems: 'start' | 'center' | 'end' | 'stretch';
}

// ===== SECTION-STIL (Container für Karten) =====

export interface CardSectionStyle {
  // Hintergrund
  backgroundColor: ColorValue;
  backgroundImage?: string;
  backgroundOverlay?: {
    color: ColorValue;
    opacity: number;
  };
  
  // Abstände
  paddingY: Spacing;
  paddingX: Spacing;
  maxWidth: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  
  // Header
  showHeader: boolean;
  headerAlign: 'left' | 'center' | 'right';
  title?: string;
  titleColor: ColorValue;
  subtitle?: string;
  subtitleColor: ColorValue;
}

// =====================================================
// TEAM CARD TYPES
// =====================================================

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  description?: string;
  image?: string;
  socialLinks?: {
    type: 'instagram' | 'facebook' | 'linkedin' | 'twitter' | 'email' | 'phone';
    url: string;
  }[];
  order: number;
}

export interface CardTeamConfig {
  // Mitglieder
  members: TeamMember[];
  
  // Layout
  layout: 'grid' | 'carousel' | 'list';
  grid: CardGridConfig;
  
  // Karten-Stil
  cardStyle: CardBaseStyle;
  imageStyle: CardImageStyle;
  imagePosition: 'top' | 'left' | 'background';
  
  // Text-Stil
  textStyle: CardTextStyle;
  
  // Social Icons
  showSocialIcons: boolean;
  socialIconStyle: 'filled' | 'outline' | 'ghost';
  socialIconSize: 'sm' | 'md' | 'lg';
  socialIconColor: ColorValue;
  
  // Section
  sectionStyle: CardSectionStyle;
}

// =====================================================
// SERVICE CARD TYPES
// =====================================================

export interface ServiceItem {
  id: string;
  title: string;
  description?: string;
  image?: string;
  icon?: string; // Lucide icon name
  price?: number; // Price in euros
  priceUnit?: string; // "pro Stunde", "ab", etc.
  duration?: string; // "30 Min", "1-2 Std"
  features?: string[];
  ctaText?: string;
  ctaUrl?: string;
  ctaLink?: string; // Alternative link field
  highlighted?: boolean; // Featured/highlighted service
  order: number;
}

export interface CardServiceConfig {
  // Services
  services: ServiceItem[];
  
  // Layout
  layout: 'grid' | 'list' | 'masonry';
  grid: CardGridConfig;
  
  // Karten-Stil
  cardStyle: CardBaseStyle;
  imageStyle: CardImageStyle;
  imagePosition: 'top' | 'left' | 'background' | 'none';
  
  // Icon-Stil (wenn kein Bild)
  showIcon: boolean;
  iconSize: 'sm' | 'md' | 'lg' | 'xl';
  iconColor: ColorValue;
  iconBackgroundColor?: ColorValue;
  iconBorderRadius: BorderRadius;
  
  // Text-Stil
  textStyle: CardTextStyle;
  
  // Preis-Stil
  showPrice: boolean;
  showDuration: boolean;
  priceStyle: {
    position: 'top' | 'title' | 'bottom';
    size: FontSize;
    weight: FontWeight;
    color: ColorValue;
    showBadge: boolean;
    badgeBackground: ColorValue;
  };
  
  // Features
  showFeatures: boolean;
  featureIcon: string; // Lucide icon name
  featureIconColor: ColorValue;
  
  // Button
  showCTA: boolean;
  buttonStyle: CardButtonStyle;
  
  // Section
  sectionStyle: CardSectionStyle;
}

// =====================================================
// TESTIMONIAL CARD TYPES
// =====================================================

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role?: string;
  company?: string;
  image?: string;
  rating?: number; // 1-5 Sterne
  date?: string;
  source?: 'google' | 'facebook' | 'yelp' | 'custom';
  order: number;
}

export interface CardTestimonialConfig {
  // Testimonials
  testimonials: TestimonialItem[];
  
  // Layout
  layout: 'grid' | 'carousel' | 'masonry' | 'single';
  grid: CardGridConfig;
  autoplay?: boolean;
  autoplayInterval?: number; // ms
  
  // Karten-Stil
  cardStyle: CardBaseStyle;
  
  // Zitat-Stil
  quoteStyle: 'simple' | 'with-icon' | 'highlighted';
  quoteIconColor: ColorValue;
  quoteSize: FontSize;
  quoteColor: ColorValue;
  quoteItalic: boolean;
  
  // Autor-Stil
  showAuthorImage: boolean;
  authorImageSize: 'sm' | 'md' | 'lg';
  authorImageBorderRadius: BorderRadius;
  authorNameSize: FontSize;
  authorNameColor: ColorValue;
  authorRoleSize: FontSize;
  authorRoleColor: ColorValue;
  authorLayout: 'inline' | 'stacked' | 'left-aligned';
  
  // Rating
  showRating: boolean;
  ratingStyle: 'stars' | 'numbers' | 'both';
  ratingColor: ColorValue;
  ratingEmptyColor: ColorValue;
  
  // Source Badge
  showSource: boolean;
  
  // Section
  sectionStyle: CardSectionStyle;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export const createDefaultCardBaseStyle = (): CardBaseStyle => ({
  backgroundColor: { kind: 'tokenRef', ref: 'semantic.cardBg' },
  borderRadius: 'lg',
  borderWidth: 0,
  borderColor: { kind: 'tokenRef', ref: 'semantic.border' },
  shadow: 'md',
  shadowHover: 'lg',
  padding: 'md',
  transitionDuration: 200,
  hoverEffect: 'lift'
});

export const createDefaultCardImageStyle = (): CardImageStyle => ({
  aspectRatio: '4:3',
  fit: 'cover',
  borderRadius: 'lg'
});

export const createDefaultCardTextStyle = (): CardTextStyle => ({
  titleSize: 'xl',
  titleWeight: 'semibold',
  titleColor: { kind: 'tokenRef', ref: 'semantic.headingText' },
  titleAlign: 'left',
  subtitleSize: 'sm',
  subtitleWeight: 'medium',
  subtitleColor: { kind: 'tokenRef', ref: 'semantic.mutedText' },
  descriptionSize: 'base',
  descriptionColor: { kind: 'tokenRef', ref: 'semantic.bodyText' },
  descriptionLineClamp: 3
});

export const createDefaultCardGridConfig = (): CardGridConfig => ({
  columns: { desktop: 3, tablet: 2, mobile: 1 },
  gap: 'lg',
  alignItems: 'stretch'
});

export const createDefaultSectionStyle = (): CardSectionStyle => ({
  backgroundColor: { kind: 'tokenRef', ref: 'semantic.pageBg' },
  paddingY: 'xl',
  paddingX: 'lg',
  maxWidth: 'xl',
  showHeader: true,
  headerAlign: 'center',
  titleColor: { kind: 'tokenRef', ref: 'semantic.headingText' },
  subtitleColor: { kind: 'tokenRef', ref: 'semantic.mutedText' }
});

export const createDefaultCardButtonStyle = (): CardButtonStyle => ({
  variant: 'filled',
  size: 'md',
  borderRadius: 'md',
  backgroundColor: { kind: 'tokenRef', ref: 'semantic.buttonPrimaryBg' },
  textColor: { kind: 'tokenRef', ref: 'semantic.buttonPrimaryText' },
  borderColor: { kind: 'tokenRef', ref: 'semantic.buttonPrimaryBg' },
  fullWidth: false
});

// Default Team Config
export const createDefaultCardTeamConfig = (): CardTeamConfig => ({
  members: [],
  layout: 'grid',
  grid: createDefaultCardGridConfig(),
  cardStyle: createDefaultCardBaseStyle(),
  imageStyle: {
    ...createDefaultCardImageStyle(),
    aspectRatio: '1:1',
    borderRadius: 'full'
  },
  imagePosition: 'top',
  textStyle: {
    ...createDefaultCardTextStyle(),
    titleAlign: 'center'
  },
  showSocialIcons: true,
  socialIconStyle: 'ghost',
  socialIconSize: 'md',
  socialIconColor: { kind: 'tokenRef', ref: 'semantic.mutedText' },
  sectionStyle: {
    ...createDefaultSectionStyle(),
    title: 'Unser Team',
    subtitle: 'Lernen Sie die Menschen kennen, die für Sie da sind'
  }
});

// Default Service Config
export const createDefaultCardServiceConfig = (): CardServiceConfig => ({
  services: [],
  layout: 'grid',
  grid: createDefaultCardGridConfig(),
  cardStyle: createDefaultCardBaseStyle(),
  imageStyle: createDefaultCardImageStyle(),
  imagePosition: 'top',
  showIcon: false,
  iconSize: 'lg',
  iconColor: { kind: 'tokenRef', ref: 'semantic.buttonPrimaryBg' },
  iconBorderRadius: 'lg',
  textStyle: createDefaultCardTextStyle(),
  showPrice: true,
  showDuration: true,
  priceStyle: {
    position: 'bottom',
    size: 'xl',
    weight: 'bold',
    color: { kind: 'tokenRef', ref: 'semantic.buttonPrimaryBg' },
    showBadge: false,
    badgeBackground: { kind: 'tokenRef', ref: 'semantic.pageBg' }
  },
  showFeatures: true,
  featureIcon: 'Check',
  featureIconColor: { kind: 'tokenRef', ref: 'semantic.success' },
  showCTA: true,
  buttonStyle: createDefaultCardButtonStyle(),
  sectionStyle: {
    ...createDefaultSectionStyle(),
    title: 'Unsere Leistungen',
    subtitle: 'Was wir für Sie tun können'
  }
});

// Default Testimonial Config
export const createDefaultCardTestimonialConfig = (): CardTestimonialConfig => ({
  testimonials: [],
  layout: 'grid',
  grid: { ...createDefaultCardGridConfig(), columns: { desktop: 2, tablet: 1, mobile: 1 } },
  cardStyle: {
    ...createDefaultCardBaseStyle(),
    padding: 'lg'
  },
  quoteStyle: 'with-icon',
  quoteIconColor: { kind: 'tokenRef', ref: 'semantic.mutedText' },
  quoteSize: 'lg',
  quoteColor: { kind: 'tokenRef', ref: 'semantic.bodyText' },
  quoteItalic: true,
  showAuthorImage: true,
  authorImageSize: 'md',
  authorImageBorderRadius: 'full',
  authorNameSize: 'base',
  authorNameColor: { kind: 'tokenRef', ref: 'semantic.headingText' },
  authorRoleSize: 'sm',
  authorRoleColor: { kind: 'tokenRef', ref: 'semantic.mutedText' },
  authorLayout: 'inline',
  showRating: true,
  ratingStyle: 'stars',
  ratingColor: { kind: 'custom', hex: '#FBBF24' }, // Gelb für Sterne
  ratingEmptyColor: { kind: 'tokenRef', ref: 'semantic.border' },
  showSource: true,
  sectionStyle: {
    ...createDefaultSectionStyle(),
    title: 'Das sagen unsere Kunden',
    subtitle: 'Echte Bewertungen von zufriedenen Kunden'
  }
});

// ===== RESPONSIVE HELPER =====

export { getResponsiveValue } from './Hero';
