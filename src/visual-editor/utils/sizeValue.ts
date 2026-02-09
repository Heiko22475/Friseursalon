// =====================================================
// VISUAL EDITOR – SIZE VALUE HELPERS
// Konvertierung SizeValue ↔ CSS
// =====================================================

import type { SizeValue, SizeValueOrAuto } from '../types/styles';

/**
 * Erstellt ein SizeValue-Objekt
 */
export function sv(value: number, unit: SizeValue['unit'] = 'px'): SizeValue {
  return { value, unit };
}

/**
 * Konvertiert SizeValue zu CSS-String
 */
export function sizeValueToCSS(sv: SizeValueOrAuto | undefined | null): string | undefined {
  if (sv === undefined || sv === null) return undefined;
  if (sv === 'auto') return 'auto';
  if (typeof sv === 'object' && 'value' in sv) {
    return `${sv.value}${sv.unit}`;
  }
  return undefined;
}

/**
 * Parsed einen CSS-String zu SizeValue
 */
export function parseSizeValue(css: string): SizeValueOrAuto {
  if (css === 'auto') return 'auto';

  const match = css.match(/^(-?\d+(?:\.\d+)?)(px|%|em|rem|vw|vh)$/);
  if (match) {
    return {
      value: parseFloat(match[1]),
      unit: match[2] as SizeValue['unit'],
    };
  }

  return { value: 0, unit: 'px' };
}

/**
 * Prüft ob ein SizeValue gesetzt ist (nicht 0px)
 */
export function isSizeValueSet(sv: SizeValueOrAuto | undefined | null): boolean {
  if (sv === undefined || sv === null) return false;
  if (sv === 'auto') return true;
  return sv.value !== 0;
}

/**
 * Standardwert für SizeValue
 */
export function defaultSizeValue(unit: SizeValue['unit'] = 'px'): SizeValue {
  return { value: 0, unit };
}
