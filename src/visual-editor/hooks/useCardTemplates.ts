// =====================================================
// VISUAL EDITOR – useCardTemplates Hook
// Lädt Kartenvorlagen aus Supabase (oder Built-in-Fallback)
// und stellt sie reaktiv bereit.
// =====================================================

import { useState, useEffect } from 'react';
import type { CardTemplate } from '../types/cards';
import { BUILT_IN_CARD_TEMPLATES } from '../types/cards';
import { loadCardTemplates } from '../utils/cardTemplateLoader';

interface UseCardTemplatesResult {
  templates: CardTemplate[];
  loading: boolean;
  error: string | null;
  /** Reload templates from DB */
  refresh: () => void;
}

/**
 * Hook zum Laden der Kartenvorlagen.
 * Lädt asynchron aus Supabase, zeigt sofort die Built-in-Templates
 * als Fallback bis die DB-Daten geladen sind.
 */
export function useCardTemplates(): UseCardTemplatesResult {
  const [templates, setTemplates] = useState<CardTemplate[]>(BUILT_IN_CARD_TEMPLATES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const loaded = await loadCardTemplates();
      setTemplates(loaded);
    } catch (err) {
      console.warn('[useCardTemplates] Fehler, nutze Built-in-Vorlagen:', err);
      setError('Vorlagen konnten nicht geladen werden');
      setTemplates(BUILT_IN_CARD_TEMPLATES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return {
    templates,
    loading,
    error,
    refresh: load,
  };
}
