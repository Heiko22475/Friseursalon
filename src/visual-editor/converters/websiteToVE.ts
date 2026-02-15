// =====================================================
// CONVERTER: Website JSON → VE Pages + GlobalStyles
//
// Lädt VE-Seiten aus dem Website JSON (v2 Format).
// v2: Jede Seite hat ein `body` Feld mit dem Elementbaum.
// Konvertierung: v2 tags/tuples → VE types/SizeValues.
// =====================================================

import type { VEPage } from '../types/elements';
import { v2ContentToVEPages } from './v2Converter';
import type { V2LoadResult } from './v2Converter';

// ===== PUBLIC API =====

/**
 * Lädt VE-Seiten + globale Styles aus dem Website-Content JSON (v2 Format).
 * Jede Seite hat ein `body` Feld mit dem Elementbaum.
 * Konvertiert v2 JSON-Format → VE interne Typen.
 */
export function convertWebsiteToVE(content: any): V2LoadResult {
  return v2ContentToVEPages(content);
}

/**
 * @deprecated Use convertWebsiteToVE() which also returns globalStyles.
 */
export function convertWebsiteToVEPages(content: any): VEPage[] {
  return v2ContentToVEPages(content).pages;
}
