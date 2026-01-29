// =====================================================
// COLOR UTILITIES
// Functions for color manipulation and accessibility
// =====================================================

import { AccentConfig, AccentColors, ContrastResult, ContrastLevel } from '../types/theme';

// ===== HEX NORMALIZATION =====

/**
 * Normalizes a hex color to 6-digit format (#RRGGBB)
 * @param hex - Color in #RGB or #RRGGBB format
 * @returns Normalized #RRGGBB color
 */
export function normalizeHex(hex: string): string {
  hex = hex.trim().toUpperCase();
  
  // Add # if missing
  if (!hex.startsWith('#')) {
    hex = '#' + hex;
  }
  
  // Expand shorthand (#RGB -> #RRGGBB)
  if (hex.length === 4) {
    hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  
  // Validate format
  if (!/^#[0-9A-F]{6}$/.test(hex)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  
  return hex;
}

/**
 * Validates if a string is a valid hex color
 */
export function isValidHex(hex: string): boolean {
  try {
    normalizeHex(hex);
    return true;
  } catch {
    return false;
  }
}

// ===== RGB CONVERSION =====

/**
 * Converts hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = normalizeHex(hex);
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  return { r, g, b };
}

/**
 * Converts RGB values to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0').toUpperCase();
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// ===== HSL CONVERSION =====

/**
 * Converts hex color to HSL values
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r, g, b } = hexToRgb(hex);
  const r1 = r / 255;
  const g1 = g / 255;
  const b1 = b / 255;

  const max = Math.max(r1, g1, b1);
  const min = Math.min(r1, g1, b1);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case r1:
        h = ((g1 - b1) / delta + (g1 < b1 ? 6 : 0)) / 6;
        break;
      case g1:
        h = ((b1 - r1) / delta + 2) / 6;
        break;
      case b1:
        h = ((r1 - g1) / delta + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Converts HSL values to hex color
 */
export function hslToHex(h: number, s: number, l: number): string {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return rgbToHex(r * 255, g * 255, b * 255);
}

// ===== HSL MANIPULATION =====

/**
 * Adjusts HSL values of a hex color
 * @param hex - Base color in hex format
 * @param hueShift - Hue shift in degrees (-360 to 360)
 * @param satShift - Saturation shift in percent (-100 to 100)
 * @param lightShift - Lightness shift in percent (-100 to 100)
 */
export function adjustHSL(
  hex: string,
  hueShift: number = 0,
  satShift: number = 0,
  lightShift: number = 0
): string {
  const hsl = hexToHsl(hex);
  
  // Apply shifts
  let h = (hsl.h + hueShift) % 360;
  if (h < 0) h += 360;
  
  const s = Math.max(0, Math.min(100, hsl.s + satShift));
  const l = Math.max(0, Math.min(100, hsl.l + lightShift));
  
  return hslToHex(h, s, l);
}

// ===== LUMINANCE & CONTRAST =====

/**
 * Calculates relative luminance according to WCAG 2.0
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
export function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  
  const toLinear = (val: number) => {
    const v = val / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  
  const rLin = toLinear(r);
  const gLin = toLinear(g);
  const bLin = toLinear(b);
  
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/**
 * Calculates contrast ratio between two colors according to WCAG 2.0
 * https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Evaluates contrast ratio and returns accessibility level
 */
export function evaluateContrast(
  foreground: string,
  background: string,
  largeText: boolean = false
): ContrastResult {
  const ratio = getContrastRatio(foreground, background);
  
  let level: ContrastLevel;
  let passes: boolean;
  
  if (largeText) {
    // Large text: >= 18pt or >= 14pt bold
    if (ratio >= 4.5) {
      level = 'AAA';
      passes = true;
    } else if (ratio >= 3) {
      level = 'AA';
      passes = true;
    } else {
      level = 'FAIL';
      passes = false;
    }
  } else {
    // Normal text
    if (ratio >= 7) {
      level = 'AAA';
      passes = true;
    } else if (ratio >= 4.5) {
      level = 'AA';
      passes = true;
    } else {
      level = 'FAIL';
      passes = false;
    }
  }
  
  return { ratio, level, passes };
}

// ===== AUTO TEXT COLOR =====

/**
 * Returns black or white text color based on background luminance
 * Ensures at least AA contrast (4.5:1)
 */
export function autoTextColor(bgHex: string): string {
  const luminance = getLuminance(bgHex);
  
  // Threshold for switching between black and white
  // 0.5 is a common choice (50% luminance)
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Returns the best text color (black or white) with contrast level
 */
export function autoTextColorWithLevel(bgHex: string): {
  color: string;
  contrast: ContrastResult;
} {
  const color = autoTextColor(bgHex);
  const contrast = evaluateContrast(color, bgHex);
  
  return { color, contrast };
}

/**
 * Returns a set of readable text colors for a given background
 * Optimized for hierarchy: heading (high), body (medium), muted (low/disabled)
 * Automatically determines if light or dark text is needed based on contrast.
 */
export function getReadableTextColors(bgHex: string): {
  heading: string;
  body: string;
  muted: string;
} {
  // Calculate contrast for both White and Black text
  const whiteContrast = getContrastRatio('#FFFFFF', bgHex);
  const blackContrast = getContrastRatio('#000000', bgHex);

  // If Black provides better contrast, use Dark Text (light background)
  const useLightText = blackContrast > whiteContrast;

  if (useLightText) {
    // Dark background -> Light text
    return {
      heading: '#FFFFFF',      // Pure white for headings
      body: '#E5E7EB',         // Gray-200 for body
      muted: '#9CA3AF',        // Gray-400 for muted
    };
  } else {
    // Light background -> Dark text
    return {
      heading: '#111827',      // Gray-900 (Black-ish)
      body: '#374151',         // Gray-700
      muted: '#6B7280',        // Gray-500
    };
  }
}

// ===== ACCENT GENERATION =====

/**
 * Generates accent colors from a base color using HSL shifts
 */
export function generateAccent(
  baseHex: string,
  config: Pick<AccentConfig, 'hue_shift' | 'saturation_shift' | 'lightness_shift'>
): string {
  return adjustHSL(
    baseHex,
    config.hue_shift,
    config.saturation_shift,
    config.lightness_shift
  );
}

/**
 * Generates all three accent colors for a primary color
 */
export function generateAccents(
  baseHex: string,
  configs: Pick<AccentConfig, 'accent_number' | 'hue_shift' | 'saturation_shift' | 'lightness_shift'>[]
): AccentColors {
  const accents: Partial<AccentColors> = {};
  
  for (const config of configs) {
    const accentKey = `accent${config.accent_number}` as keyof AccentColors;
    accents[accentKey] = generateAccent(baseHex, config);
  }
  
  // Ensure all three accents exist (fallback to base color if missing)
  return {
    accent1: accents.accent1 || baseHex,
    accent2: accents.accent2 || baseHex,
    accent3: accents.accent3 || baseHex,
  };
}

// ===== COLOR VALIDATION =====

/**
 * Validates if a color meets minimum contrast requirements
 */
export function meetsMinimumContrast(
  foreground: string,
  background: string,
  minLevel: 'AA' | 'AAA' = 'AA'
): boolean {
  const result = evaluateContrast(foreground, background);
  
  if (minLevel === 'AAA') {
    return result.level === 'AAA';
  }
  
  return result.level === 'AA' || result.level === 'AAA';
}

// ===== COLOR DISTANCE =====

/**
 * Calculates Euclidean distance between two colors in RGB space
 * Useful for finding similar colors
 */
export function colorDistance(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  
  const dr = rgb1.r - rgb2.r;
  const dg = rgb1.g - rgb2.g;
  const db = rgb1.b - rgb2.b;
  
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

// ===== BACKGROUND COLOR DETECTION =====

/**
 * Determines if a background color is light or dark
 * @param hex - Background color in hex format
 * @returns 'light' or 'dark'
 */
export function isLightBackground(hex: string): boolean {
  const luminance = getLuminance(hex);
  // Using 0.5 as threshold (50% lightness)
  return luminance > 0.5;
}

/**
 * Gets adaptive text colors based on background
 * Returns CSS custom properties that can be used throughout the component tree
 */
export function getAdaptiveTextColors(backgroundColor: string): {
  '--text-primary': string;
  '--text-secondary': string;
  '--text-muted': string;
} {
  const isLight = isLightBackground(backgroundColor);
  
  if (isLight) {
    return {
      '--text-primary': '#111827',   // gray-900
      '--text-secondary': '#374151',  // gray-700
      '--text-muted': '#6B7280',     // gray-500
    };
  } else {
    return {
      '--text-primary': '#F9FAFB',   // gray-50
      '--text-secondary': '#E5E7EB',  // gray-200
      '--text-muted': '#9CA3AF',     // gray-400
    };
  }
}

// ===== UTILITY EXPORTS =====

export const COLOR_UTILS = {
  normalize: normalizeHex,
  isValid: isValidHex,
  toRgb: hexToRgb,
  toHsl: hexToHsl,
  fromRgb: rgbToHex,
  fromHsl: hslToHex,
  adjust: adjustHSL,
  luminance: getLuminance,
  contrast: getContrastRatio,
  evaluate: evaluateContrast,
  autoText: autoTextColor,
  autoTextWithLevel: autoTextColorWithLevel,
  generateAccent,
  generateAccents,
  meetsContrast: meetsMinimumContrast,
  distance: colorDistance,
  isLight: isLightBackground,
  adaptiveColors: getAdaptiveTextColors,
} as const;
