// =====================================================
// HEADER TYPES
// Typdefinitionen für alle Header-Varianten
// =====================================================

import { ColorValue } from './theme';
import { Spacing, BorderRadius } from './Cards';

// =====================================================
// ENUMS & CONSTANTS
// =====================================================

export type HeaderVariant = 'classic' | 'centered' | 'hamburger';
export type LogoType = 'image' | 'text' | 'logo-designer';
export type NavItemType = 'link' | 'scroll' | 'dropdown' | 'page';
export type MobileMenuStyle = 'fullscreen' | 'slide-right' | 'slide-left' | 'dropdown';
export type StickyStyle = 'solid' | 'blur';
export type ShadowSize = 'none' | 'small' | 'medium' | 'large';
export type HamburgerIconStyle = 'lines' | 'dots' | 'x-rotate';
export type HamburgerAnimation = 'fade' | 'slide' | 'scale';
export type DividerStyle = 'line' | 'dots' | 'gradient' | 'none';

// Konstanten für Werte
export const HEADER_HEIGHT_VALUES = {
  sm: 56,
  md: 64,
  lg: 72,
  xl: 80
} as const;

export const LOGO_HEIGHT_VALUES = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 56
} as const;

export const SHADOW_VALUES_HEADER = {
  none: 'none',
  small: '0 1px 2px rgba(0,0,0,0.05)',
  medium: '0 4px 6px -1px rgba(0,0,0,0.1)',
  large: '0 10px 15px -3px rgba(0,0,0,0.1)'
} as const;

// =====================================================
// NAVIGATION
// =====================================================

export interface NavigationItem {
  id: string;
  label: string;
  type: NavItemType;
  target?: string; // URL, Section-ID oder Page-Slug
  children?: NavigationItem[]; // Für Dropdown
  visible: boolean;
  icon?: string; // Lucide icon name
  openInNewTab?: boolean;
}

export interface ButtonAction {
  type: 'link' | 'scroll' | 'phone' | 'email' | 'modal';
  target: string;
}

export interface ButtonStyle {
  backgroundColor: ColorValue;
  textColor: ColorValue;
  borderRadius: BorderRadius;
  size: 'sm' | 'md' | 'lg';
}

// =====================================================
// LOGO CONFIGURATION
// =====================================================

export interface LogoConfig {
  type: LogoType;
  imageUrl?: string;
  text?: string;
  logoId?: string; // Referenz auf Logo-Designer
  maxHeight: number; // in px
  // Text-Logo Styling
  fontFamily?: string;
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  textColor?: ColorValue;
}

// =====================================================
// CTA BUTTON
// =====================================================

export interface CTAConfig {
  enabled: boolean;
  text: string;
  action: ButtonAction;
  style: ButtonStyle;
}

// =====================================================
// STICKY & TRANSPARENT
// =====================================================

export interface StickyConfig {
  enabled: boolean;
  showAfter: number; // px gescrollt (0 = sofort)
  style: StickyStyle;
  hideOnScrollDown?: boolean; // Header verstecken beim Runterscrollen
}

export interface TransparentConfig {
  enabled: boolean;
  textColorLight: boolean; // Helle Schrift für dunklen Hintergrund
}

// =====================================================
// MOBILE CONFIGURATION
// =====================================================

export interface MobileConfig {
  breakpoint: 768 | 1024;
  menuStyle: MobileMenuStyle;
  showLogo: boolean;
  showCTA: boolean;
  animationDuration: number; // ms
}

// =====================================================
// SOCIAL MEDIA
// =====================================================

export interface HeaderSocialConfig {
  enabled: boolean;
  position: 'left' | 'right' | 'hidden';
  size: 'sm' | 'md' | 'lg';
}

// =====================================================
// BASE HEADER STYLE
// =====================================================

export interface HeaderStyle {
  backgroundColor: ColorValue;
  textColor: ColorValue;
  activeColor: ColorValue; // Farbe für aktiven Menüpunkt
  hoverColor: ColorValue;
  height: keyof typeof HEADER_HEIGHT_VALUES;
  padding: Spacing;
  shadow: ShadowSize;
  borderBottom?: {
    enabled: boolean;
    color: ColorValue;
    width: number;
  };
}

// =====================================================
// BASE HEADER CONFIG
// =====================================================

export interface HeaderConfigBase {
  variant: HeaderVariant;
  logo: LogoConfig;
  navigation: NavigationItem[];
  cta?: CTAConfig;
  socialMedia: HeaderSocialConfig;
  sticky: StickyConfig;
  transparent: TransparentConfig;
  mobile: MobileConfig;
  style: HeaderStyle;
}

// =====================================================
// CLASSIC HEADER
// =====================================================

export interface HeaderClassicConfig extends HeaderConfigBase {
  variant: 'classic';
  logoPosition: 'left' | 'center-left';
  navPosition: 'center' | 'right';
  ctaPosition: 'right' | 'nav-end';
}

// =====================================================
// CENTERED HEADER
// =====================================================

export interface HeaderCenteredConfig extends HeaderConfigBase {
  variant: 'centered';
  divider: {
    enabled: boolean;
    style: DividerStyle;
    color: ColorValue;
    width: number; // in px
  };
  spacing: {
    logoMarginBottom: number;
    navItemSpacing: Spacing;
  };
  compactOnScroll: boolean; // Bei Scroll zu einzeiliger Variante wechseln
}

// =====================================================
// HAMBURGER HEADER
// =====================================================

export interface HeaderHamburgerConfig extends HeaderConfigBase {
  variant: 'hamburger';
  menu: {
    style: MobileMenuStyle;
    backgroundColor: ColorValue;
    textColor: ColorValue;
    textSize: 'md' | 'lg' | 'xl' | '2xl';
    textAlign: 'left' | 'center' | 'right';
    animation: HamburgerAnimation;
    showSocialMedia: boolean;
    showCTA: boolean;
    overlayColor?: ColorValue;
    overlayOpacity?: number; // 0-100
  };
  hamburgerIcon: {
    style: HamburgerIconStyle;
    color: ColorValue;
    activeColor: ColorValue;
    size: number; // in px
  };
}

// =====================================================
// UNION TYPE
// =====================================================

export type HeaderConfig = 
  | HeaderClassicConfig 
  | HeaderCenteredConfig 
  | HeaderHamburgerConfig;

// =====================================================
// DEFAULT CREATORS
// =====================================================

export const createDefaultLogoConfig = (): LogoConfig => ({
  type: 'text',
  text: 'Salon Name',
  maxHeight: 40,
  fontWeight: 'bold'
});

export const createDefaultNavigation = (): NavigationItem[] => [
  { id: '1', label: 'Start', type: 'scroll', target: 'hero', visible: true },
  { id: '2', label: 'Leistungen', type: 'scroll', target: 'services', visible: true },
  { id: '3', label: 'Über uns', type: 'scroll', target: 'about', visible: true },
  { id: '4', label: 'Galerie', type: 'scroll', target: 'gallery', visible: true },
  { id: '5', label: 'Kontakt', type: 'scroll', target: 'contact', visible: true }
];

export const createDefaultCTA = (): CTAConfig => ({
  enabled: true,
  text: 'Termin buchen',
  action: { type: 'scroll', target: 'contact' },
  style: {
    backgroundColor: { kind: 'tokenRef', ref: 'semantic.buttonPrimaryBg' },
    textColor: { kind: 'tokenRef', ref: 'semantic.buttonPrimaryText' },
    borderRadius: 'lg',
    size: 'md'
  }
});

export const createDefaultStickyConfig = (): StickyConfig => ({
  enabled: true,
  showAfter: 0,
  style: 'solid',
  hideOnScrollDown: false
});

export const createDefaultTransparentConfig = (): TransparentConfig => ({
  enabled: false,
  textColorLight: false
});

export const createDefaultMobileConfig = (): MobileConfig => ({
  breakpoint: 768,
  menuStyle: 'slide-right',
  showLogo: true,
  showCTA: false,
  animationDuration: 300
});

export const createDefaultHeaderStyle = (): HeaderStyle => ({
  backgroundColor: { kind: 'tokenRef', ref: 'semantic.headerBg' },
  textColor: { kind: 'tokenRef', ref: 'semantic.headerText' },
  activeColor: { kind: 'tokenRef', ref: 'brand.primary' },
  hoverColor: { kind: 'tokenRef', ref: 'brand.primary' },
  height: 'md',
  padding: 'md',
  shadow: 'small'
});

// =====================================================
// VARIANT-SPECIFIC DEFAULTS
// =====================================================

export const createDefaultHeaderClassicConfig = (): HeaderClassicConfig => ({
  variant: 'classic',
  logo: createDefaultLogoConfig(),
  navigation: createDefaultNavigation(),
  cta: createDefaultCTA(),
  socialMedia: { enabled: false, position: 'hidden', size: 'sm' },
  sticky: createDefaultStickyConfig(),
  transparent: createDefaultTransparentConfig(),
  mobile: createDefaultMobileConfig(),
  style: createDefaultHeaderStyle(),
  logoPosition: 'left',
  navPosition: 'right',
  ctaPosition: 'right'
});

export const createDefaultHeaderCenteredConfig = (): HeaderCenteredConfig => ({
  variant: 'centered',
  logo: createDefaultLogoConfig(),
  navigation: createDefaultNavigation(),
  cta: createDefaultCTA(),
  socialMedia: { enabled: false, position: 'hidden', size: 'sm' },
  sticky: createDefaultStickyConfig(),
  transparent: createDefaultTransparentConfig(),
  mobile: createDefaultMobileConfig(),
  style: createDefaultHeaderStyle(),
  divider: {
    enabled: true,
    style: 'line',
    color: { kind: 'custom', hex: '#E5E7EB' },
    width: 60
  },
  spacing: {
    logoMarginBottom: 16,
    navItemSpacing: 'lg'
  },
  compactOnScroll: true
});

export const createDefaultHeaderHamburgerConfig = (): HeaderHamburgerConfig => ({
  variant: 'hamburger',
  logo: createDefaultLogoConfig(),
  navigation: createDefaultNavigation(),
  cta: createDefaultCTA(),
  socialMedia: { enabled: true, position: 'right', size: 'md' },
  sticky: createDefaultStickyConfig(),
  transparent: createDefaultTransparentConfig(),
  mobile: { ...createDefaultMobileConfig(), menuStyle: 'fullscreen' },
  style: createDefaultHeaderStyle(),
  menu: {
    style: 'fullscreen',
    backgroundColor: { kind: 'custom', hex: '#111827' },
    textColor: { kind: 'custom', hex: '#FFFFFF' },
    textSize: 'xl',
    textAlign: 'center',
    animation: 'fade',
    showSocialMedia: true,
    showCTA: true,
    overlayOpacity: 95
  },
  hamburgerIcon: {
    style: 'lines',
    color: { kind: 'tokenRef', ref: 'semantic.headerText' },
    activeColor: { kind: 'custom', hex: '#FFFFFF' },
    size: 24
  }
});

// =====================================================
// HELPER TYPES
// =====================================================

export interface HeaderProps {
  config?: HeaderConfig;
  isPreview?: boolean;
}
