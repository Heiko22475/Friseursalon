// =====================================================
// TEXT CONTRAST GENERATOR
// Generates accessible text colors for backgrounds
// =====================================================

import { getLuminance, getContrastRatio, hexToHsl, hslToHex } from './color-utils';

export interface TextContrastSet {
  high: string;      // AAA: 7:1 - Überschriften, wichtige Texte
  medium: string;    // AA: 4.5:1 - Body-Text
  low: string;       // ~3:1 - Gedämpfte Texte
  contrast_ratios: {
    high: number;
    medium: number;
    low: number;
  };
}

/**
 * Generates three text color variants with different contrast levels
 * for a given background color
 */
export function generateTextContrasts(bgColor: string): TextContrastSet {
  const bgLum = getLuminance(bgColor);
  const isDark = bgLum < 0.5;
  
  let high: string;
  let medium: string;
  let low: string;
  
  if (isDark) {
    // Dunkler BG: Helle Texte
    high = findContrastColor(bgColor, 7.0, true);   // AAA
    medium = findContrastColor(bgColor, 4.5, true); // AA
    low = findContrastColor(bgColor, 3.0, true);    // Muted
  } else {
    // Heller BG: Dunkle Texte
    high = findContrastColor(bgColor, 7.0, false);
    medium = findContrastColor(bgColor, 4.5, false);
    low = findContrastColor(bgColor, 3.0, false);
  }
  
  return {
    high,
    medium,
    low,
    contrast_ratios: {
      high: getContrastRatio(bgColor, high),
      medium: getContrastRatio(bgColor, medium),
      low: getContrastRatio(bgColor, low),
    },
  };
}

/**
 * Finds a text color that meets the target contrast ratio
 */
function findContrastColor(
  bgColor: string,
  targetRatio: number,
  lightText: boolean
): string {
  const hsl = hexToHsl(bgColor);
  
  // Start with maximum contrast
  let lightness = lightText ? 100 : 0;
  let saturation = Math.max(0, Math.min(20, hsl.s)); // Leicht entsättigen für bessere Lesbarkeit
  
  // Iterativ anpassen bis Ziel-Ratio erreicht
  let testColor = hslToHex(hsl.h, saturation, lightness);
  let ratio = getContrastRatio(bgColor, testColor);
  
  // Wenn Ziel-Ratio bereits erreicht ist
  if (ratio >= targetRatio) {
    // Versuche näher an Ziel zu kommen (nicht zu viel Kontrast)
    const step = lightText ? -2 : 2;
    let bestColor = testColor;
    let bestDiff = Math.abs(ratio - targetRatio);
    
    for (let i = 0; i < 20; i++) {
      lightness += step;
      if (lightness < 0 || lightness > 100) break;
      
      testColor = hslToHex(hsl.h, saturation, lightness);
      ratio = getContrastRatio(bgColor, testColor);
      
      const diff = Math.abs(ratio - targetRatio);
      
      if (ratio < targetRatio) break; // Zu wenig Kontrast
      
      if (diff < bestDiff) {
        bestDiff = diff;
        bestColor = testColor;
      }
    }
    
    return bestColor;
  }
  
  // Wenn Ziel nicht erreicht werden kann, maximalen Kontrast verwenden
  return lightText ? '#FFFFFF' : '#000000';
}

/**
 * Generates colored text contrasts that maintain the hue of the background
 * (alternative approach for more cohesive designs)
 */
export function generateColoredTextContrasts(bgColor: string): TextContrastSet {
  const hsl = hexToHsl(bgColor);
  const bgLuminance = getLuminance(bgColor);
  const isDark = bgLuminance < 0.5;
  
  let high: string;
  let medium: string;
  let low: string;
  
  if (isDark) {
    // Dunkler BG: Helle, leicht getönte Texte
    high = hslToHex(hsl.h, 5, 98);      // Fast weiß mit leichtem Farbton
    medium = hslToHex(hsl.h, 10, 90);   // Leicht getönt
    low = hslToHex(hsl.h, 25, 70);      // Deutlicher Farbton, gedämpft
  } else {
    // Heller BG: Dunkle, leicht getönte Texte
    high = hslToHex(hsl.h, 10, 15);     // Fast schwarz mit Farbton
    medium = hslToHex(hsl.h, 15, 25);   // Dunkelgrau getönt
    low = hslToHex(hsl.h, 25, 50);      // Mittlerer Ton
  }
  
  return {
    high,
    medium,
    low,
    contrast_ratios: {
      high: getContrastRatio(bgColor, high),
      medium: getContrastRatio(bgColor, medium),
      low: getContrastRatio(bgColor, low),
    },
  };
}

/**
 * Helper function to get smart text color for a background token
 */
export type TextWeight = 'high' | 'medium' | 'low';

export function getSmartTextColor(
  bgColor: string,
  weight: TextWeight = 'medium'
): string {
  const contrasts = generateTextContrasts(bgColor);
  return contrasts[weight];
}

/**
 * Validates if a text color has sufficient contrast on a background
 */
export function validateTextContrast(
  bgColor: string,
  textColor: string
): {
  ratio: number;
  wcag_aa: boolean;  // 4.5:1
  wcag_aaa: boolean; // 7:1
  recommendation: 'excellent' | 'good' | 'acceptable' | 'poor';
} {
  const ratio = getContrastRatio(bgColor, textColor);
  
  let recommendation: 'excellent' | 'good' | 'acceptable' | 'poor';
  if (ratio >= 7) {
    recommendation = 'excellent';
  } else if (ratio >= 4.5) {
    recommendation = 'good';
  } else if (ratio >= 3) {
    recommendation = 'acceptable';
  } else {
    recommendation = 'poor';
  }
  
  return {
    ratio,
    wcag_aa: ratio >= 4.5,
    wcag_aaa: ratio >= 7,
    recommendation,
  };
}
