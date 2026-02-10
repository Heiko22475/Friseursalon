// =====================================================
// VISUAL EDITOR – SAVE CONTEXT
// Provides save functionality to all VE components.
// Handles persisting editor state back to Supabase.
// =====================================================

import React, { createContext, useContext, useCallback, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { VEDataSource } from '../VisualEditorPage';

// ===== TYPES =====

export interface VESaveState {
  /** Which data source is active */
  dataSource: VEDataSource;
  /** Currently selected customer_id (only relevant for 'live') */
  customerId: string;
  /** The original website content JSON (for merging back) */
  originalContent: any;
  /** Whether a save is currently in progress */
  isSaving: boolean;
  /** Last save error message */
  saveError: string | null;
  /** Last successful save timestamp */
  lastSaved: Date | null;
}

export interface VESaveContextValue extends VESaveState {
  /**
   * Save the current VE editor state back to Supabase.
   * Receives the current pages from EditorState to merge
   * back into the original JSON.
   */
  save: (pages: any[], currentPage: any) => Promise<boolean>;
}

// ===== CONTEXT =====

const SaveContext = createContext<VESaveContextValue | null>(null);

// ===== PROVIDER =====

interface VESaveProviderProps {
  dataSource: VEDataSource;
  customerId: string;
  originalContent: any;
  children: React.ReactNode;
}

export const VESaveProvider: React.FC<VESaveProviderProps> = ({
  dataSource,
  customerId,
  originalContent,
  children,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const originalContentRef = useRef<any>(originalContent);
  originalContentRef.current = originalContent;

  const save = useCallback(async (pages: any[], currentPage: any): Promise<boolean> => {
    // Demo mode: no persistence needed
    if (dataSource === 'demo') {
      console.log('[VE Save] Demo mode – kein Speichern in DB');
      setLastSaved(new Date());
      return true;
    }

    // Live mode: need customerId
    if (!customerId) {
      setSaveError('Kein Kunde ausgewählt');
      return false;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      // Safety: ensure the current page's latest state is in the pages array.
      // The reducer should already sync this, but we do it here as a safety net.
      const effectivePages = currentPage
        ? pages.map((p: any) => p.id === currentPage.id ? currentPage : p)
        : pages;

      // Step 1: Fresh fetch of current content from DB to ensure we have the latest
      const { data: freshData, error: fetchError } = await supabase
        .from('websites')
        .select('id, content')
        .eq('customer_id', customerId)
        .single();

      if (fetchError || !freshData) {
        console.error('[VE Save] Fehler beim Laden der aktuellen Daten:', fetchError);
        setSaveError(fetchError?.message || 'Kunde nicht gefunden');
        setIsSaving(false);
        return false;
      }

      const original = freshData.content || {};
      const websiteId = freshData.id;

      console.log('[VE Save] Original content geladen:', {
        customerId,
        websiteId,
        pagesInOriginal: original.pages?.length || 0,
        pagesInVE: effectivePages.length,
        hasServices: !!original.services,
        hasContact: !!original.contact,
        hasHeader: !!original.header,
        hasFooter: !!original.footer,
      });

      // Step 2: Convert VE pages back to Website JSON pages format
      const updatedPages = effectivePages.map((vePage: any) => {
        const originalPage = original.pages?.find(
          (p: any) => p.id === vePage.id
        );

        if (originalPage) {
          return mergeVEPageIntoOriginal(vePage, originalPage);
        }

        return convertVEPageToWebsitePage(vePage);
      });

      // Step 3: Build the complete updated content object
      // We preserve ALL original fields and only replace pages
      const updatedContent = {
        ...original,
        pages: updatedPages,
      };

      console.log('[VE Save] Speichere Content:', {
        customerId,
        websiteId,
        updatedPagesCount: updatedPages.length,
        contentKeys: Object.keys(updatedContent),
        contentSize: JSON.stringify(updatedContent).length,
      });

      // Step 4: Save to Supabase using the UUID id for precise matching
      const { data: updateResult, error: updateError } = await supabase
        .from('websites')
        .update({ content: updatedContent })
        .eq('id', websiteId)
        .select('id, customer_id, updated_at');

      if (updateError) {
        console.error('[VE Save] Supabase update error:', updateError);
        setSaveError(updateError.message);
        setIsSaving(false);
        return false;
      }

      if (!updateResult || updateResult.length === 0) {
        console.error('[VE Save] Update matched 0 rows! websiteId:', websiteId);
        setSaveError('Keine Zeile aktualisiert – bitte Berechtigungen prüfen');
        setIsSaving(false);
        return false;
      }

      // Step 5: Verify the save by re-reading
      const { data: verifyData } = await supabase
        .from('websites')
        .select('content')
        .eq('id', websiteId)
        .single();

      if (verifyData) {
        const savedPagesCount = verifyData.content?.pages?.length || 0;
        const savedContentSize = JSON.stringify(verifyData.content).length;
        console.log('[VE Save] ✅ Verifizierung:', {
          savedPagesCount,
          savedContentSize,
          matchesExpected: savedContentSize === JSON.stringify(updatedContent).length,
        });
      }

      // Update the reference to the new content
      originalContentRef.current = updatedContent;

      console.log(`[VE Save] ✅ Gespeichert für Kunde ${customerId} (${websiteId}) – ${updatedPages.length} Seite(n), ${JSON.stringify(updatedContent).length} Bytes`);
      setLastSaved(new Date());
      setIsSaving(false);
      return true;
    } catch (err: any) {
      console.error('[VE Save] Error:', err);
      setSaveError(err.message || 'Unbekannter Fehler');
      setIsSaving(false);
      return false;
    }
  }, [dataSource, customerId]);

  return (
    <SaveContext.Provider
      value={{
        dataSource,
        customerId,
        originalContent,
        isSaving,
        saveError,
        lastSaved,
        save,
      }}
    >
      {children}
    </SaveContext.Provider>
  );
};

// ===== HOOK =====

export function useVESave(): VESaveContextValue {
  const ctx = useContext(SaveContext);
  if (!ctx) {
    throw new Error('useVESave must be used within a VESaveProvider');
  }
  return ctx;
}

// ===== MERGE HELPERS =====

/**
 * Merge VE page edits back into the original website page.
 * Walks the VE element tree and updates text content in matching blocks.
 * Also preserves block ordering as it appears in the VE.
 */
function mergeVEPageIntoOriginal(vePage: any, originalPage: any): any {
  const result = { ...originalPage };

  // Walk through VE body children (sections = blocks)
  const veChildren = vePage.body?.children || [];
  const originalBlocks = originalPage.blocks || [];
  
  // Build a map of original blocks by ID for quick lookup
  const blockMap = new Map<string, any>();
  originalBlocks.forEach((b: any) => blockMap.set(b.id, { ...b }));

  let changeCount = 0;

  // Process each VE section and update the corresponding original block
  const mergedBlocks = veChildren.map((veSection: any) => {
    const originalBlock = blockMap.get(veSection.id);
    
    if (!originalBlock) {
      // Section exists in VE but not in original → skip (or could add as new block)
      console.log(`[VE Merge] Section ${veSection.id} not found in original blocks`);
      return null;
    }

    const updatedBlock = JSON.parse(JSON.stringify(originalBlock)); // Deep clone

    // ── Hero Block ──
    if (originalBlock.type === 'hero' && updatedBlock.config) {
      // Update hero texts
      if (updatedBlock.config.texts && Array.isArray(updatedBlock.config.texts)) {
        updatedBlock.config.texts = updatedBlock.config.texts.map((text: any) => {
          const veText = findVEElementById(veSection, text.id);
          if (veText && typeof veText.content === 'string' && veText.content !== text.content) {
            changeCount++;
            console.log(`[VE Merge] Hero text "${text.id}": "${text.content?.slice(0, 40)}" → "${veText.content.slice(0, 40)}"`);
            return { ...text, content: veText.content };
          }
          return text;
        });
      }

      // Update hero buttons
      if (updatedBlock.config.buttons && Array.isArray(updatedBlock.config.buttons)) {
        updatedBlock.config.buttons = updatedBlock.config.buttons.map((btn: any) => {
          const veBtn = findVEElementById(veSection, btn.id);
          if (veBtn && veBtn.content?.text && veBtn.content.text !== btn.text) {
            changeCount++;
            console.log(`[VE Merge] Hero button "${btn.id}": "${btn.text}" → "${veBtn.content.text}"`);
            return { ...btn, text: veBtn.content.text };
          }
          return btn;
        });
      }
    }

    // ── Generic Card Block ──
    if (originalBlock.type === 'generic-card' && updatedBlock.config) {
      // Update section title/subtitle
      const titleEl = findVEElementById(veSection, `${originalBlock.id}-title`);
      if (titleEl && typeof titleEl.content === 'string' && updatedBlock.config.sectionStyle) {
        if (titleEl.content !== updatedBlock.config.sectionStyle.title) {
          changeCount++;
          console.log(`[VE Merge] Card section title: "${updatedBlock.config.sectionStyle.title}" → "${titleEl.content}"`);
        }
        updatedBlock.config.sectionStyle = { ...updatedBlock.config.sectionStyle, title: titleEl.content };
      }
      
      const subtitleEl = findVEElementById(veSection, `${originalBlock.id}-subtitle`);
      if (subtitleEl && typeof subtitleEl.content === 'string' && updatedBlock.config.sectionStyle) {
        if (subtitleEl.content !== updatedBlock.config.sectionStyle.subtitle) {
          changeCount++;
          console.log(`[VE Merge] Card section subtitle changed`);
        }
        updatedBlock.config.sectionStyle = { ...updatedBlock.config.sectionStyle, subtitle: subtitleEl.content };
      }

      // Update card item titles and descriptions
      if (updatedBlock.config.items && Array.isArray(updatedBlock.config.items)) {
        updatedBlock.config.items = updatedBlock.config.items.map((item: any) => {
          const itemTitleEl = findVEElementById(veSection, `${item.id}-title`);
          const itemDescEl = findVEElementById(veSection, `${item.id}-desc`);
          const updated = { ...item };
          if (itemTitleEl && typeof itemTitleEl.content === 'string') {
            if (itemTitleEl.content !== item.title) {
              changeCount++;
              console.log(`[VE Merge] Card item title "${item.id}": "${item.title}" → "${itemTitleEl.content}"`);
            }
            updated.title = itemTitleEl.content;
          }
          if (itemDescEl && typeof itemDescEl.content === 'string') {
            changeCount++;
            updated.description = itemDescEl.content.startsWith('<') 
              ? itemDescEl.content 
              : `<p>${itemDescEl.content}</p>`;
          }
          return updated;
        });
      }
    }

    // ── Static Content Block ──
    if (originalBlock.type === 'static_content') {
      const veText = findVEElementById(veSection, `${originalBlock.id}-text`);
      if (veText && typeof veText.content === 'string' && updatedBlock.config) {
        // Note: static content is typically not editable, but log if changed
        console.log(`[VE Merge] Static content block "${originalBlock.id}" – preserving original`);
      }
    }

    return updatedBlock;
  }).filter(Boolean); // Remove nulls

  // Also include any original blocks that weren't in the VE (e.g. blocks the VE doesn't support)
  const mergedIds = new Set(mergedBlocks.map((b: any) => b.id));
  const extraBlocks = originalBlocks.filter((b: any) => !mergedIds.has(b.id));
  if (extraBlocks.length > 0) {
    console.log(`[VE Merge] ${extraBlocks.length} block(s) not in VE, appending to end:`, extraBlocks.map((b: any) => b.id));
  }

  result.blocks = [...mergedBlocks, ...extraBlocks];
  
  // Update page metadata if changed in VE
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

/**
 * Convert a VE page that was created in the editor to Website JSON format.
 * Used for completely new pages.
 */
function convertVEPageToWebsitePage(vePage: any): any {
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

/**
 * Recursively find a VE element by ID within a tree.
 */
function findVEElementById(element: any, id: string): any | null {
  if (element.id === id) return element;
  const children = element.children || [];
  for (const child of children) {
    const found = findVEElementById(child, id);
    if (found) return found;
  }
  return null;
}
