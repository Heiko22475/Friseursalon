// =====================================================
// VISUAL EDITOR – SAVE CONTEXT
// Provides save functionality to all VE components.
// Handles persisting editor state back to Supabase.
// =====================================================

import React, { createContext, useContext, useCallback, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { vePagesTov2Pages } from '../converters/v2Converter';
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
      });

      // Step 2: Convert VE pages to v2 JSON page format
      const originalPages = original.pages || [];
      const updatedPages = vePagesTov2Pages(effectivePages, originalPages);

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
