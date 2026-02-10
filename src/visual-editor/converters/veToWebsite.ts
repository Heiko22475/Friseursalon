// =====================================================
// CONVERTER: VE Elements → Website JSON
//
// Konvertiert VE-Elemente zurück in Website-JSON-Blöcke.
// Nutzt _blockMeta (gespeichert beim Import) um die
// Original-Konfiguration zu aktualisieren statt komplett
// neu zu generieren – so bleiben alle Felder erhalten
// die der VE nicht darstellt.
// =====================================================

/**
 * Merge einer VE-Page zurück in die originale Website-Page.
 * Vergleicht Element-Inhalte mit den Original-Blöcken und
 * schreibt geänderte Werte zurück.
 */
export function mergeVEPageIntoOriginal(vePage: any, originalPage: any): any {
  const result = { ...originalPage };
  const veChildren = vePage.body?.children || [];
  const originalBlocks = originalPage.blocks || [];

  // Map original blocks by ID
  const blockMap = new Map<string, any>();
  originalBlocks.forEach((b: any) => blockMap.set(b.id, JSON.parse(JSON.stringify(b))));

  let changeCount = 0;

  const mergedBlocks = veChildren.map((veElement: any) => {
    // ── WebsiteBlock elements (legacy compat) ──
    if (veElement.type === 'WebsiteBlock') {
      const origBlock = blockMap.get(veElement.originalBlockId || veElement.id);
      if (!origBlock) {
        return {
          id: veElement.originalBlockId || veElement.id,
          type: veElement.blockType,
          position: veElement.blockPosition ?? 0,
          config: veElement.blockConfig || {},
          content: veElement.blockContent || {},
        };
      }
      const veStr = JSON.stringify(veElement.blockConfig || {});
      const origStr = JSON.stringify(origBlock.config || {});
      if (veStr !== origStr) {
        changeCount++;
        return { ...origBlock, config: veElement.blockConfig };
      }
      return origBlock;
    }

    // ── Native VE Section elements (new approach) ──
    if (veElement.type === 'Section') {
      const meta = veElement._blockMeta;
      if (!meta) {
        // Section created in VE without block metadata → preserve original if exists
        const origBlock = blockMap.get(veElement.id);
        if (origBlock) return origBlock;
        return null;
      }

      const origBlock = blockMap.get(veElement.id);
      const baseConfig = origBlock
        ? JSON.parse(JSON.stringify(origBlock.config || {}))
        : JSON.parse(JSON.stringify(meta.config || {}));

      let changed = false;

      if (meta.type === 'hero') {
        changed = mergeHeroChanges(veElement, baseConfig);
      } else if (meta.type === 'generic-card') {
        changed = mergeGenericCardChanges(veElement, baseConfig);
      }

      if (changed) changeCount++;

      return {
        id: veElement.id,
        type: meta.type,
        position: meta.position ?? 0,
        config: baseConfig,
        content: meta.content || origBlock?.content || {},
      };
    }

    return null;
  }).filter(Boolean);

  // Append original blocks not present in VE
  const mergedIds = new Set(mergedBlocks.map((b: any) => b.id));
  const extraBlocks = originalBlocks.filter((b: any) => !mergedIds.has(b.id));
  result.blocks = [...mergedBlocks, ...extraBlocks];

  // Update page metadata
  if (vePage.name && vePage.name !== originalPage.title) {
    result.title = vePage.name;
    changeCount++;
  }
  if (vePage.route !== undefined) {
    const newSlug = (vePage.route || '/').replace(/^\//, '') || 'home';
    if (newSlug !== originalPage.slug) {
      result.slug = newSlug;
      changeCount++;
    }
  }

  console.log(`[VE Merge] Page "${result.title || result.id}": ${changeCount} change(s), ${result.blocks.length} blocks`);
  return result;
}

// ===== HERO MERGE =====

function mergeHeroChanges(section: any, config: any): boolean {
  const children = section.children || [];
  let changed = false;

  // Find text elements
  for (const child of children) {
    if (child.type === 'Text' && child.id.includes('__text-')) {
      const match = child.id.match(/__text-(\d+)$/);
      if (match) {
        const idx = parseInt(match[1]);
        if (config.texts && config.texts[idx]) {
          if (config.texts[idx].content !== child.content) {
            config.texts[idx].content = child.content;
            changed = true;
          }
        }
      }
    }

    // Find button elements
    if (child.type === 'Button' && child.id.includes('__btn-')) {
      const match = child.id.match(/__btn-(\d+)$/);
      if (match) {
        const idx = parseInt(match[1]);
        if (config.buttons && config.buttons[idx]) {
          const newText = child.content?.text || '';
          if (config.buttons[idx].text !== newText) {
            config.buttons[idx].text = newText;
            changed = true;
          }
        }
      }
    }
  }

  return changed;
}

// ===== GENERIC CARD MERGE =====

function mergeGenericCardChanges(section: any, config: any): boolean {
  const children = section.children || [];
  let changed = false;

  for (const child of children) {
    // Section title
    if (child.type === 'Text' && child.id.endsWith('__sec-title')) {
      const ss = config.sectionStyle || {};
      if (ss.title !== child.content) {
        ss.title = child.content;
        config.sectionStyle = ss;
        changed = true;
      }
    }

    // Section subtitle
    if (child.type === 'Text' && child.id.endsWith('__sec-sub')) {
      const ss = config.sectionStyle || {};
      if (ss.subtitle !== child.content) {
        ss.subtitle = child.content;
        config.sectionStyle = ss;
        changed = true;
      }
    }

    // Cards grid container
    if (child.type === 'Container' && child.id.endsWith('__cards-grid')) {
      const cardContainers = (child.children || []).filter(
        (c: any) => c.type === 'Container' && c.id.includes('__card-')
      );

      const items = config.items || config.cards || [];

      for (const cardContainer of cardContainers) {
        const match = cardContainer.id.match(/__card-(\d+)$/);
        if (!match) continue;
        const idx = parseInt(match[1]);
        if (idx >= items.length) continue;

        const item = items[idx];
        const cardChildren = cardContainer.children || [];

        for (const cc of cardChildren) {
          if (cc.type === 'Text' && cc.id.endsWith(`-title`)) {
            if (item.title !== cc.content) { item.title = cc.content; changed = true; }
          }
          if (cc.type === 'Text' && cc.id.endsWith(`-sub`)) {
            if (item.subtitle !== cc.content) { item.subtitle = cc.content; changed = true; }
          }
          if (cc.type === 'Text' && cc.id.endsWith(`-desc`)) {
            if (item.description !== cc.content) { item.description = cc.content; changed = true; }
          }
          if (cc.type === 'Button' && cc.id.endsWith(`-btn`)) {
            const newText = cc.content?.text || '';
            if (item.ctaText !== newText) { item.ctaText = newText; changed = true; }
          }
        }
      }

      // Write back
      if (config.items) config.items = items;
      else if (config.cards) config.cards = items;
    }
  }

  return changed;
}

/**
 * Convert a brand-new VE page to Website JSON format.
 */
export function convertVEPageToWebsitePage(vePage: any): any {
  return {
    id: vePage.id,
    title: vePage.name || 'Neue Seite',
    slug: (vePage.route || '/new-page').replace(/^\//, '') || 'home',
    is_home: vePage.route === '/',
    is_published: vePage.isPublished ?? true,
    show_in_menu: true,
    meta_description: '',
    seo_title: vePage.name || '',
    display_order: 0,
    blocks: [],
  };
}
