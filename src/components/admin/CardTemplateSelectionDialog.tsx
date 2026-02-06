// =====================================================
// CARD TEMPLATE SELECTION DIALOG
// Modal to select a card template when adding a Generic Card block
// =====================================================

import React, { useState, useEffect } from 'react';
import { X, Search, LayoutGrid } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { GenericCardConfig } from '../../types/GenericCard';
import { GenericCard } from '../blocks/GenericCard';

// ===== TYPES =====

export interface CardTemplate {
  id: string;
  name: string;
  description: string;
  config: GenericCardConfig;
  category: string;
  is_active: boolean;
}

interface CardTemplateSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: CardTemplate | null) => void;
}

// ===== CATEGORIES =====

const CATEGORIES = [
  { value: 'all', label: 'Alle Kategorien' },
  { value: 'service', label: 'Services' },
  { value: 'product', label: 'Produkte' },
  { value: 'team', label: 'Team' },
  { value: 'business', label: 'Business' },
  { value: 'testimonial', label: 'Bewertungen' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'pricing', label: 'Preise' },
  { value: 'feature', label: 'Features' },
  { value: 'offer', label: 'Angebote' },
  { value: 'general', label: 'Allgemein' },
];

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    service: 'blue',
    product: 'green',
    team: 'purple',
    business: 'orange',
    testimonial: 'yellow',
    portfolio: 'indigo',
    pricing: 'rose',
    feature: 'teal',
    offer: 'red',
    general: 'gray',
  };
  return colors[category] || 'gray';
};

// ===== COMPONENT =====

export const CardTemplateSelectionDialog: React.FC<CardTemplateSelectionDialogProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [templates, setTemplates] = useState<CardTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('card_templates')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      searchQuery === '' ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-7xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Kartenvorlage auswählen</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              title="Schließen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Vorlagen durchsuchen..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
                <p className="mt-4 text-gray-500">Lade Vorlagen...</p>
              </div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <LayoutGrid className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Keine Vorlagen gefunden
                </h3>
                <p className="text-gray-500">
                  {searchQuery || selectedCategory !== 'all'
                    ? 'Versuchen Sie eine andere Suche oder Kategorie'
                    : 'Es sind noch keine Vorlagen verfügbar'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white border rounded-xl hover:shadow-lg transition cursor-pointer group"
                  onClick={() => onSelect(template)}
                >
                  {/* Preview */}
                  <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-xl overflow-hidden p-4">
                    <div className="w-full h-full flex items-center justify-center">
                      <div style={{ maxWidth: '200px', transform: 'scale(0.8)' }}>
                        <GenericCard
                          config={{
                            ...template.config,
                            items: template.config.items.slice(0, 1),
                            layout: 'list',
                            grid: {
                              ...template.config.grid,
                              columns: { desktop: 1, tablet: 1, mobile: 1 },
                              gap: 'none',
                            },
                            sectionStyle: {
                              ...template.config.sectionStyle,
                              showHeader: false,
                              paddingY: 'none',
                              paddingX: 'none',
                            },
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 flex-1 group-hover:text-rose-600 transition">
                        {template.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium bg-${getCategoryColor(
                          template.category
                        )}-100 text-${getCategoryColor(template.category)}-700 ml-2`}
                      >
                        {CATEGORIES.find((c) => c.value === template.category)?.label ||
                          template.category}
                      </span>
                    </div>

                    {template.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {template.description}
                      </p>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(template);
                      }}
                      className="w-full px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition font-medium"
                    >
                      Auswählen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
          <button
            onClick={() => onSelect(null)}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
          >
            Ohne Vorlage starten
          </button>
          <div className="text-sm text-gray-600">
            {filteredTemplates.length} {filteredTemplates.length === 1 ? 'Vorlage' : 'Vorlagen'}{' '}
            verfügbar
          </div>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
};
