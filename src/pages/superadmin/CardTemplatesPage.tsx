// =====================================================
// CARD TEMPLATES MANAGEMENT (SUPERADMIN)
// Verwaltung vordefinierter Karten-Entwürfe
// =====================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Edit, Trash2, Copy, Search,
  LayoutGrid, ArrowLeft
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { GenericCardConfig } from '../../types/GenericCard';
import { GenericCard } from '../../components/blocks/GenericCard';

// ===== TYPES =====

interface CardTemplate {
  id: string;
  name: string;
  description: string | null;
  config: GenericCardConfig;
  preview_image: string | null;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ===== CATEGORY BADGES =====

const CATEGORIES = [
  { value: 'all', label: 'Alle', color: 'gray' },
  { value: 'service', label: 'Services', color: 'blue' },
  { value: 'product', label: 'Produkte', color: 'green' },
  { value: 'team', label: 'Team', color: 'purple' },
  { value: 'business', label: 'Business', color: 'orange' },
  { value: 'general', label: 'Allgemein', color: 'gray' },
];

const getCategoryColor = (category: string) => {
  const cat = CATEGORIES.find(c => c.value === category);
  return cat?.color || 'gray';
};

// ===== MAIN COMPONENT =====

export const CardTemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<CardTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);

  // Load templates
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('card_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      alert('Fehler beim Laden der Vorlagen');
    } finally {
      setLoading(false);
    }
  };

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Delete template
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('card_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTemplates(prev => prev.filter(t => t.id !== id));
      setShowDeleteDialog(null);
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Fehler beim Löschen der Vorlage');
    }
  };

  // Duplicate template
  const handleDuplicate = async (template: CardTemplate) => {
    try {
      const { data, error } = await supabase
        .from('card_templates')
        .insert({
          name: `${template.name} (Kopie)`,
          description: template.description,
          config: template.config,
          category: template.category,
          is_active: false,
        })
        .select()
        .single();

      if (error) throw error;
      
      setTemplates(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error duplicating template:', error);
      alert('Fehler beim Duplizieren der Vorlage');
    }
  };

  // Toggle active status
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('card_templates')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      setTemplates(prev => prev.map(t => 
        t.id === id ? { ...t, is_active: !currentStatus } : t
      ));
    } catch (error) {
      console.error('Error toggling active status:', error);
      alert('Fehler beim Aktualisieren des Status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/superadmin')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Karten-Vorlagen</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Vordefinierte Karten für alle Benutzer verwalten
                </p>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/superadmin/card-templates/new')}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition"
            >
              <Plus className="w-4 h-4" />
              Neue Vorlage
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Vorlagen durchsuchen..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                    selectedCategory === cat.value
                      ? 'bg-rose-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-500">Lade Vorlagen...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <LayoutGrid className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Keine Vorlagen gefunden
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || selectedCategory !== 'all'
                ? 'Versuchen Sie eine andere Suche oder Kategorie'
                : 'Erstellen Sie Ihre erste Karten-Vorlage'}
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <button
                onClick={() => navigate('/superadmin/card-templates/new')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition"
              >
                <Plus className="w-4 h-4" />
                Erste Vorlage erstellen
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-xl shadow-sm border hover:shadow-md transition flex"
              >
                {/* Vertical Action Bar (Left Side) */}
                <div className="flex flex-col gap-2 p-3 bg-gray-50 border-r">
                  <button
                    onClick={() => navigate(`/superadmin/card-templates/${template.id}`)}
                    className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition"
                    title="Bearbeiten"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => handleDuplicate(template)}
                    className="p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                    title="Duplizieren"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => setShowDeleteDialog(template.id)}
                    className="p-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
                    title="Löschen"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                  {/* Preview */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-tr-xl overflow-hidden" style={{ height: '272px' }}>
                    {template.preview_image ? (
                      <img
                        src={template.preview_image}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white overflow-hidden p-3">
                        {/* Render single card preview */}
                        <div className="w-full" style={{ maxHeight: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <div style={{ width: '100%', maxWidth: '220px', transform: 'scale(0.9)' }}>
                            <GenericCard 
                              config={{
                                ...template.config,
                                items: template.config.items.slice(0, 1), // Only first card
                                layout: 'list', // Force single column layout
                                grid: {
                                  ...template.config.grid,
                                  columns: { desktop: 1, tablet: 1, mobile: 1 }, // Single column
                                  gap: 'none',
                                },
                                sectionStyle: {
                                  ...template.config.sectionStyle,
                                  showHeader: false, // Hide section header
                                  paddingY: 'none',
                                  paddingX: 'none',
                                }
                              }} 
                              instanceId={0} 
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info Section */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 flex-1">
                        {template.name}
                      </h3>
                      
                      {/* Badges (Right Side) */}
                      <div className="flex gap-2 ml-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium bg-${getCategoryColor(template.category)}-100 text-${getCategoryColor(template.category)}-700`}>
                          {CATEGORIES.find(c => c.value === template.category)?.label || template.category}
                        </span>
                        
                        <button
                          onClick={() => handleToggleActive(template.id, template.is_active)}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            template.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {template.is_active ? 'Aktiv' : 'Inaktiv'}
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    {template.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {template.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Vorlage löschen?
            </h3>
            <p className="text-gray-600 mb-6">
              Möchten Sie diese Karten-Vorlage wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteDialog(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Abbrechen
              </button>
              <button
                onClick={() => handleDelete(showDeleteDialog)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardTemplatesPage;
