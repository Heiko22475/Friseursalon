// =====================================================
// CONVERTER: Website JSON → VE Pages
//
// Lädt VE-Seiten aus dem Website JSON.
// Seiten werden im nativen VE-Format gespeichert (veBody).
// Keine Legacy-Block-Konvertierung mehr.
// =====================================================

import type { VEPage, VEBody } from '../types/elements';

// ===== PUBLIC API =====

/**
 * Lädt VE-Seiten aus dem Website-Content JSON.
 * Jede Seite muss ein veBody Feld haben (VE-Format).
 * Seiten ohne veBody werden als leere Seite erstellt.
 */
export function convertWebsiteToVEPages(content: any): VEPage[] {
  if (!content?.pages || !Array.isArray(content.pages)) return [];

  const pages: VEPage[] = [];

  for (const page of content.pages) {
    if (page.veBody) {
      // VE-Format: veBody enthält den kompletten Element-Baum
      pages.push({
        id: page.id,
        name: page.title || 'Seite',
        route: page.slug === 'home' ? '/' : `/${page.slug}`,
        body: page.veBody as VEBody,
        isVisualEditor: true,
        isPublished: page.is_published ?? true,
      });
    } else {
      // Fallback: Seite ohne VE-Body -> leere Seite erstellen
      console.warn(`[VE Load] Seite "${page.title || page.id}" hat kein veBody - erstelle leere Seite`);
      pages.push({
        id: page.id,
        name: page.title || 'Seite',
        route: page.slug === 'home' ? '/' : `/${page.slug}`,
        body: {
          id: `body-${page.id}`,
          type: 'Body',
          label: 'Body',
          styles: {
            desktop: {
              backgroundColor: { kind: 'custom', hex: '#ffffff' },
            },
          },
          children: [],
        },
        isVisualEditor: true,
        isPublished: page.is_published ?? true,
      });
    }
  }

  return pages;
}
