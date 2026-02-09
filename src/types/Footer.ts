// =====================================================
// FOOTER TYPES
// Typdefinitionen für alle Footer-Varianten
// =====================================================

import { ColorValue } from './theme';

// =====================================================
// ENUMS & CONSTANTS
// =====================================================

export type FooterVariant = 'minimal' | 'four-column';

export type FooterColumnType = 'links' | 'text' | 'contact' | 'hours' | 'custom';

export type FooterLayout = 'single-line' | 'stacked';
export type FooterAlignment = 'left' | 'center' | 'space-between';

export type SocialIconVariant = 'icons-only' | 'with-background' | 'with-border';
export type SocialIconSize = 'small' | 'medium' | 'large';

// =====================================================
// SHARED INTERFACES
// =====================================================

export interface FooterLegalLink {
  id: string;
  label: string;
  url: string;
}

export interface FooterLogoConfig {
  enabled: boolean;
  type: 'image' | 'text' | 'logo-designer';
  imageUrl?: string;
  text?: string;
  logoId?: string;
  maxHeight?: number;
}

export interface FooterCopyrightConfig {
  text: string;           // z.B. "© {year} Salon Name"
  showYear: boolean;      // Jahr automatisch aktualisieren
}

export interface FooterSocialConfig {
  enabled: boolean;
  title?: string;
  size: SocialIconSize;
  variant: SocialIconVariant;
}

export interface FooterStyle {
  backgroundColor: ColorValue;
  textColor: ColorValue;
  linkColor: ColorValue;
  headingColor: ColorValue;
  dividerColor: ColorValue;
  padding: 'sm' | 'md' | 'lg' | 'xl';
}

// =====================================================
// FOOTER COLUMNS
// =====================================================

export interface FooterColumnBase {
  id: string;
  title: string;
  type: FooterColumnType;
}

export interface FooterLinksColumn extends FooterColumnBase {
  type: 'links';
  links: { id: string; label: string; url: string }[];
}

export interface FooterTextColumn extends FooterColumnBase {
  type: 'text';
  content: string;       // HTML content
  showLogo?: boolean;
  showSocialMedia?: boolean;
}

export interface FooterContactColumn extends FooterColumnBase {
  type: 'contact';
  showAddress: boolean;
  showPhone: boolean;
  showEmail: boolean;
}

export interface FooterHoursColumn extends FooterColumnBase {
  type: 'hours';
  // Uses business hours from Website context
}

export interface FooterCustomColumn extends FooterColumnBase {
  type: 'custom';
  html: string;
}

export type FooterColumn =
  | FooterLinksColumn
  | FooterTextColumn
  | FooterContactColumn
  | FooterHoursColumn
  | FooterCustomColumn;

// =====================================================
// BASE FOOTER CONFIG
// =====================================================

export interface FooterConfigBase {
  variant: FooterVariant;
  logo: FooterLogoConfig;
  socialMedia: FooterSocialConfig;
  copyright: FooterCopyrightConfig;
  legal: {
    links: FooterLegalLink[];
  };
  style: FooterStyle;
}

// =====================================================
// MINIMAL FOOTER
// =====================================================

export interface FooterMinimalConfig extends FooterConfigBase {
  variant: 'minimal';
  layout: FooterLayout;
  alignment: FooterAlignment;
}

// =====================================================
// FOUR-COLUMN FOOTER
// =====================================================

export interface FooterFourColumnConfig extends FooterConfigBase {
  variant: 'four-column';
  columns: FooterColumn[];
  columnLayout: {
    desktop: number;  // 2, 3, or 4 columns
    tablet: number;
    mobile: number;
  };
}

// =====================================================
// UNION TYPE
// =====================================================

export type FooterConfig =
  | FooterMinimalConfig
  | FooterFourColumnConfig;

// =====================================================
// TYPE GUARDS
// =====================================================

export function isMinimalFooter(config: FooterConfig): config is FooterMinimalConfig {
  return config.variant === 'minimal';
}

export function isFourColumnFooter(config: FooterConfig): config is FooterFourColumnConfig {
  return config.variant === 'four-column';
}

export function isLinksColumn(col: FooterColumn): col is FooterLinksColumn {
  return col.type === 'links';
}

export function isTextColumn(col: FooterColumn): col is FooterTextColumn {
  return col.type === 'text';
}

export function isContactColumn(col: FooterColumn): col is FooterContactColumn {
  return col.type === 'contact';
}

export function isHoursColumn(col: FooterColumn): col is FooterHoursColumn {
  return col.type === 'hours';
}

// =====================================================
// DEFAULT CREATORS
// =====================================================

export const createDefaultFooterStyle = (): FooterStyle => ({
  backgroundColor: { kind: 'custom', hex: '#111827' },
  textColor: { kind: 'custom', hex: '#D1D5DB' },
  linkColor: { kind: 'custom', hex: '#FFFFFF' },
  headingColor: { kind: 'custom', hex: '#FFFFFF' },
  dividerColor: { kind: 'custom', hex: '#374151' },
  padding: 'lg',
});

export const createDefaultFooterLogo = (): FooterLogoConfig => ({
  enabled: false,
  type: 'text',
  text: 'Salon Name',
  maxHeight: 40,
});

export const createDefaultFooterSocial = (): FooterSocialConfig => ({
  enabled: true,
  size: 'medium',
  variant: 'icons-only',
});

export const createDefaultFooterCopyright = (): FooterCopyrightConfig => ({
  text: '© {year} Salon Name. Alle Rechte vorbehalten.',
  showYear: true,
});

export const createDefaultFooterLegal = (): { links: FooterLegalLink[] } => ({
  links: [
    { id: '1', label: 'Impressum', url: '/impressum' },
    { id: '2', label: 'Datenschutz', url: '/datenschutz' },
  ],
});

// =====================================================
// VARIANT DEFAULTS
// =====================================================

export const createDefaultFooterMinimalConfig = (): FooterMinimalConfig => ({
  variant: 'minimal',
  logo: createDefaultFooterLogo(),
  socialMedia: createDefaultFooterSocial(),
  copyright: createDefaultFooterCopyright(),
  legal: createDefaultFooterLegal(),
  style: createDefaultFooterStyle(),
  layout: 'single-line',
  alignment: 'space-between',
});

export const createDefaultFooterFourColumnConfig = (): FooterFourColumnConfig => ({
  variant: 'four-column',
  logo: { ...createDefaultFooterLogo(), enabled: true },
  socialMedia: createDefaultFooterSocial(),
  copyright: createDefaultFooterCopyright(),
  legal: createDefaultFooterLegal(),
  style: createDefaultFooterStyle(),
  columnLayout: {
    desktop: 4,
    tablet: 2,
    mobile: 1,
  },
  columns: [
    {
      id: 'col-1',
      title: '',
      type: 'text',
      content: '<p>Ihr Partner für schönes Haar seit vielen Jahren.</p>',
      showLogo: true,
      showSocialMedia: true,
    } as FooterTextColumn,
    {
      id: 'col-2',
      title: 'Schnelllinks',
      type: 'links',
      links: [
        { id: 'l1', label: 'Leistungen', url: '/leistungen' },
        { id: 'l2', label: 'Preise', url: '/preise' },
        { id: 'l3', label: 'Team', url: '/team' },
        { id: 'l4', label: 'Galerie', url: '/galerie' },
      ],
    } as FooterLinksColumn,
    {
      id: 'col-3',
      title: 'Kontakt',
      type: 'contact',
      showAddress: true,
      showPhone: true,
      showEmail: true,
    } as FooterContactColumn,
    {
      id: 'col-4',
      title: 'Öffnungszeiten',
      type: 'hours',
    } as FooterHoursColumn,
  ],
});

// =====================================================
// HELPER
// =====================================================

export const FOOTER_PADDING_VALUES = {
  sm: 'py-6',
  md: 'py-8',
  lg: 'py-12',
  xl: 'py-16',
} as const;
