// =====================================================
// TYPOGRAPHY TOKEN SYSTEM – TYPE DEFINITIONS
// 4-level hierarchy: FontToken → TypographyToken → Class (_typo) → Element inline
// =====================================================

import type { ColorValue } from '../../types/theme';

// ===== FONT TOKENS (Level 1) =====

export interface FontToken {
  /** Display name in the editor */
  label: string;
  /** Font-ID from the global font catalog (e.g. 'inter', 'playfair-display') */
  fontFamily: string;
  /** Optional description for the editor */
  description?: string;
  /** Exactly one FontToken must have standard=true (fallback on deletion) */
  standard?: boolean;
}

/** Map: font-token-key → FontToken */
export type FontTokenMap = Record<string, FontToken>;

// ===== TYPOGRAPHY TOKENS (Level 2) =====

/** Responsive CSS string value (e.g. fontSize, lineHeight) */
export interface ResponsiveStringValue {
  desktop: string;
  tablet?: string;
  mobile?: string;
}

/** Allowed properties in the token hover overlay */
export interface TypographyTokenHover {
  color?: ColorValue;
  textDecoration?: 'none' | 'underline' | 'line-through';
  letterSpacing?: string;
  fontWeight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
}

export interface TypographyToken {
  /** Display name */
  label: string;
  /** Reference to a FontToken key */
  fontToken: string;
  /** Responsive CSS-string fontSize (e.g. '1.5rem', '24px') */
  fontSize: ResponsiveStringValue;
  /** CSS fontWeight */
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  /** Responsive CSS-string lineHeight (e.g. '1.5', '24px') */
  lineHeight: ResponsiveStringValue;
  /** CSS letterSpacing (e.g. '-0.02em', '0') */
  letterSpacing: string;
  /** CSS textTransform */
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  /** Default color (null = inherit from parent) */
  color: ColorValue | null;
  /** Hover overlay (null = no hover effect at token level) */
  hover: TypographyTokenHover | null;
  /** Exactly one TypographyToken must have standard=true (fallback on deletion) */
  standard?: boolean;
}

/** Map: token-key → TypographyToken */
export type TypographyTokenMap = Record<string, TypographyToken>;

// ===== DEFAULTS =====

export const DEFAULT_FONT_TOKEN: FontToken = {
  label: 'Neue Schriftart',
  fontFamily: 'inter',
  description: '',
};

export const DEFAULT_TYPOGRAPHY_TOKEN: TypographyToken = {
  label: 'Neuer Stil',
  fontToken: '',          // must be set by the editor
  fontSize: { desktop: '1rem', tablet: '1rem', mobile: '1rem' },
  fontWeight: 400,
  lineHeight: { desktop: '1.5', tablet: '1.5', mobile: '1.5' },
  letterSpacing: '0',
  textTransform: 'none',
  color: null,
  hover: null,
};

// ===== REFERENCE CHECKS (Delete Protection) =====

/** Returns all TypographyToken keys that reference the given FontToken key */
export function getTypoTokensUsingFontToken(
  typoTokens: TypographyTokenMap,
  fontTokenKey: string,
): string[] {
  return Object.entries(typoTokens)
    .filter(([, t]) => t.fontToken === fontTokenKey)
    .map(([k]) => k);
}

/** Returns all class (style) keys that reference the given TypographyToken key via _typo */
export function getStylesUsingTypoToken(
  styles: Record<string, { _typo?: string }>,
  typoKey: string,
): string[] {
  return Object.entries(styles)
    .filter(([, s]) => s._typo === typoKey)
    .map(([k]) => k);
}

/** Find the key of the standard FontToken (there should be exactly one) */
export function getStandardFontTokenKey(fontTokens: FontTokenMap): string | undefined {
  return Object.entries(fontTokens).find(([, t]) => t.standard)?.[0];
}

/** Find the key of the standard TypographyToken (there should be exactly one) */
export function getStandardTypoTokenKey(typoTokens: TypographyTokenMap): string | undefined {
  return Object.entries(typoTokens).find(([, t]) => t.standard)?.[0];
}
