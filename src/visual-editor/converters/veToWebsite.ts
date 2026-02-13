// =====================================================
// CONVERTER: VE Elements → Website JSON
//
// Konvertiert VE-Elemente zurück in Website-JSON-Blöcke.
// Nutzt _blockMeta (gespeichert beim Import) um die
// Original-Konfiguration zu aktualisieren statt komplett
// neu zu generieren – so bleiben alle Felder erhalten
// die der VE nicht darstellt.
//
// Native VE-Elemente (Cards, Text, Container etc.) werden
// in Website-JSON-Blöcke konvertiert, damit sie persistiert werden.
// =====================================================

import {
  createDefaultGenericCardConfig,
  createDefaultGenericCardItem,
} from '../../types/GenericCard';
import type { GenericCardConfig, GenericCardItem } from '../../types/GenericCard';

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
        // Section created in VE without block metadata.
        // Check for new native VE children (Cards, Text, etc.) that need block conversion.
        const veChildBlocks = convertVEChildrenToBlocks(veElement.children || [], veElement.id);
        if (veChildBlocks.length > 0) {
          // Preserve the original block if it exists, plus any new child blocks
          const origBlock = blockMap.get(veElement.id);
          changeCount += veChildBlocks.length;
          if (origBlock) {
            return [origBlock, ...veChildBlocks];
          }
          return veChildBlocks;
        }
        // No convertible children → preserve original if exists
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

      const mergedBlock = {
        id: veElement.id,
        type: meta.type,
        position: meta.position ?? 0,
        config: baseConfig,
        content: meta.content || origBlock?.content || {},
      };

      // Check if new native VE children (Cards, etc.) were added to this section
      // that are not part of the original block structure.
      const newChildBlocks = findNewNativeChildren(veElement.children || []);
      if (newChildBlocks.length > 0) {
        changeCount += newChildBlocks.length;
        console.log(`[VE Merge] Section "${veElement.id}" has ${newChildBlocks.length} new native child block(s)`);
        return [mergedBlock, ...newChildBlocks];
      }

      return mergedBlock;
    }

    // ── Native VE Cards elements → convert to generic-card block ──
    if (veElement.type === 'Cards') {
      changeCount++;
      const block = convertVECardsToBlock(veElement);
      console.log('[VE Merge] Cards element converted to generic-card block:', {
        cardsId: veElement.id,
        childCount: veElement.children?.length || 0,
        blockId: block.id,
        itemCount: block.config?.items?.length || 0,
      });
      return block;
    }

    // ── VE Navbar → convert to navbar block ──
    if (veElement.type === 'Navbar') {
      changeCount++;
      const block = convertVENavbarToBlock(veElement);
      console.log('[VE Merge] Navbar element converted to navbar block:', {
        navbarId: veElement.id,
        childCount: veElement.children?.length || 0,
      });
      return block;
    }

    // ── Other native VE elements (Text, Container, Image etc.) ──
    // These may be top-level elements created natively in the VE.
    // Wrap them as static-text or generic-card blocks where possible.
    if (['Text', 'Container', 'Image', 'Button'].includes(veElement.type)) {
      changeCount++;
      return convertVENativeElementToBlock(veElement);
    }

    return null;
  }).flat().filter(Boolean);

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
 * Also converts native VE elements (Cards etc.) to website blocks.
 */
export function convertVEPageToWebsitePage(vePage: any): any {
  const veChildren = vePage.body?.children || [];
  const blocks: any[] = [];

  for (const child of veChildren) {
    if (child.type === 'WebsiteBlock') {
      blocks.push({
        id: child.originalBlockId || child.id,
        type: child.blockType,
        position: child.blockPosition ?? blocks.length,
        config: child.blockConfig || {},
        content: child.blockContent || {},
      });
    } else if (child.type === 'Section' && child._blockMeta) {
      blocks.push({
        id: child.id,
        type: child._blockMeta.type,
        position: child._blockMeta.position ?? blocks.length,
        config: child._blockMeta.config || {},
        content: child._blockMeta.content || {},
      });
      // Also extract any new native children (Cards) added to this section
      const newChildBlocks = findNewNativeChildren(child.children || []);
      blocks.push(...newChildBlocks);
    } else if (child.type === 'Cards') {
      blocks.push(convertVECardsToBlock(child));
    } else if (child.type === 'Navbar') {
      blocks.push(convertVENavbarToBlock(child));
    } else if (['Text', 'Container', 'Image', 'Button'].includes(child.type)) {
      blocks.push(convertVENativeElementToBlock(child));
    } else if (child.type === 'Section') {
      // Plain section without meta – check for Cards inside
      const childBlocks = convertVEChildrenToBlocks(child.children || [], child.id);
      blocks.push(...childBlocks);
    }
  }

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
    blocks,
  };
}

// =====================================================
// VE CARDS → GENERIC-CARD BLOCK CONVERTER
// =====================================================

/**
 * Konvertiert ein VECards-Element in einen generic-card Website-Block.
 * Liest die VEContainer-Kinder (Karten) und deren VEText/VEImage/VEButton
 * und baut daraus GenericCardConfig + GenericCardItems.
 */
function convertVECardsToBlock(cardsElement: any): any {
  const children = cardsElement.children || [];
  const layout = cardsElement.layout || { desktop: { columns: 3 } };

  // Build GenericCardItems from card containers
  const items: GenericCardItem[] = children.map((cardContainer: any, idx: number) => {
    const cardChildren = cardContainer.children || [];
    const item: GenericCardItem = {
      ...createDefaultGenericCardItem(),
      id: cardContainer.id || crypto.randomUUID(),
      order: idx,
      title: 'Karte',
    };

    for (const child of cardChildren) {
      if (child.type === 'Image') {
        item.image = child.content?.src || '';
      } else if (child.type === 'Text') {
        const textStyle = child.textStyle || 'body';
        const content = child.content || '';

        if (textStyle === 'h1' || textStyle === 'h2' || textStyle === 'h3') {
          item.title = content;
        } else if (textStyle === 'price') {
          // Try to parse price
          const priceMatch = content.match(/(\d+[\.,]?\d*)/);
          if (priceMatch) {
            item.price = parseFloat(priceMatch[1].replace(',', '.'));
            item.priceUnit = content.replace(priceMatch[0], '').trim() || '€';
          }
        } else if (textStyle === 'label') {
          // Could be overline or subtitle
          if (!item.overline) {
            item.overline = content;
          } else {
            item.subtitle = content;
          }
        } else {
          // body text → description or subtitle
          if (!item.subtitle && content.length < 80) {
            item.subtitle = content;
          } else {
            item.description = content;
          }
        }
      } else if (child.type === 'Button') {
        item.ctaText = child.content?.text || 'Button';
        item.ctaUrl = child.content?.link || '#';
      }
    }

    return item;
  });

  // Determine if cards have images
  const hasImages = items.some(i => !!i.image);
  const hasButtons = items.some(i => !!i.ctaText);
  const hasPrices = items.some(i => i.price !== undefined);

  // Build grid config from VECards layout
  const gapValue = layout.desktop?.gap?.value || 24;
  const gapLabel = gapValue <= 8 ? 'xs' : gapValue <= 12 ? 'sm' : gapValue <= 16 ? 'md' : gapValue <= 24 ? 'lg' : 'xl';

  // Build the GenericCardConfig
  const config: GenericCardConfig = {
    ...createDefaultGenericCardConfig(),
    items,
    layout: 'grid',
    cardLayoutVariant: 'vertical',
    grid: {
      ...createDefaultGenericCardConfig().grid,
      columns: {
        desktop: layout.desktop?.columns || 3,
        tablet: layout.tablet?.columns || 2,
        mobile: layout.mobile?.columns || 1,
      },
      gap: gapLabel as any,
    },
    showImage: hasImages,
    showButton: hasButtons,
    sectionStyle: {
      ...createDefaultGenericCardConfig().sectionStyle,
      showHeader: false,
    },
  };

  if (hasPrices) {
    config.priceStyle = { ...config.priceStyle, enabled: true };
  }

  return {
    id: cardsElement.id,
    type: 'generic-card',
    position: 0,
    config,
    content: {},
  };
}

// =====================================================
// VE NAVBAR → NAVBAR BLOCK CONVERTER
// =====================================================

/**
 * Konvertiert ein VENavbar-Element in einen navbar Website-Block.
 * Serialisiert die Kinder (Logo, Nav-Links, CTA, etc.) und
 * Navbar-spezifische Einstellungen (sticky, breakpoint).
 */
function convertVENavbarToBlock(navbarElement: any): any {
  const children = navbarElement.children || [];

  // Serialize children recursively
  const serializeChild = (el: any): any => {
    const base: any = {
      id: el.id,
      type: el.type,
    };

    if (el.style) base.style = el.style;

    if (el.type === 'Text') {
      base.content = el.content || '';
      base.textStyle = el.textStyle || 'body';
    } else if (el.type === 'Button') {
      base.content = el.content || {};
    } else if (el.type === 'Image') {
      base.content = el.content || {};
    }

    if (el.children && Array.isArray(el.children) && el.children.length > 0) {
      base.children = el.children.map(serializeChild);
    }

    return base;
  };

  return {
    id: navbarElement.id,
    type: 'navbar',
    position: 0,
    config: {
      stickyMode: navbarElement.stickyMode || 'none',
      mobileBreakpoint: navbarElement.mobileBreakpoint || 768,
      children: children.map(serializeChild),
    },
    content: {},
  };
}

/**
 * Konvertiert andere native VE-Elemente in einen einfachen Website-Block.
 */
function convertVENativeElementToBlock(veElement: any): any {
  if (veElement.type === 'Text') {
    return {
      id: veElement.id,
      type: 'static-text',
      position: 0,
      config: {
        content: veElement.content || '',
        textStyle: veElement.textStyle || 'body',
      },
      content: {},
    };
  }

  // Container, Image, Button → wrap as static-text for now
  return {
    id: veElement.id,
    type: 'static-text',
    position: 0,
    config: {
      content: veElement.content || veElement.label || '',
    },
    content: {},
  };
}

/**
 * Konvertiert eine Liste von VE-Kindern in Website-Blöcke.
 * Nützlich für Sections ohne _blockMeta, die native VE-Elemente enthalten.
 */
function convertVEChildrenToBlocks(children: any[], _parentId: string): any[] {
  const blocks: any[] = [];
  for (const child of children) {
    if (child.type === 'Cards') {
      blocks.push(convertVECardsToBlock(child));
    } else if (['Text', 'Container', 'Image', 'Button'].includes(child.type)) {
      blocks.push(convertVENativeElementToBlock(child));
    }
  }
  return blocks;
}

/**
 * Findet native VE-Elemente (Cards, etc.) in den Kindern einer Section,
 * die NICHT zur Original-Blockstruktur gehören (d.h. keine IDs mit
 * dem Block-ID-Prefix wie __cards-grid, __text-0 etc.).
 * Diese wurden vom Nutzer neu hinzugefügt und müssen als eigene Blöcke gespeichert werden.
 */
function findNewNativeChildren(children: any[]): any[] {
  const blocks: any[] = [];
  for (const child of children) {
    // VECards are always "new" native elements that need their own block
    if (child.type === 'Cards') {
      blocks.push(convertVECardsToBlock(child));
    }
    // Recurse into containers to find nested Cards
    if (child.children && Array.isArray(child.children)) {
      blocks.push(...findNewNativeChildren(child.children));
    }
  }
  return blocks;
}
