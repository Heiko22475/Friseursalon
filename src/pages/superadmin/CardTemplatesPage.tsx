// =====================================================
// CARD TEMPLATES MANAGEMENT (SUPERADMIN)
// Verwaltung vordefinierter Karten-Entwürfe
// =====================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Edit, Trash2, Copy, Search,
  LayoutGrid
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { GenericCardConfig } from '../../types/GenericCard';
import { GenericCard } from '../../components/blocks/GenericCard';
import { useConfirmDialog } from '../../components/admin/ConfirmDialog';
import { AdminHeader } from '../../components/admin/AdminHeader';

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
  { value: 'testimonial', label: 'Bewertungen', color: 'yellow' },
  { value: 'portfolio', label: 'Portfolio', color: 'indigo' },
  { value: 'pricing', label: 'Preise', color: 'rose' },
  { value: 'feature', label: 'Features', color: 'teal' },
  { value: 'offer', label: 'Angebote', color: 'red' },
  { value: 'general', label: 'Allgemein', color: 'gray' },
];

const getCategoryColor = (category: string) => {
  const cat = CATEGORIES.find(c => c.value === category);
  return cat?.color || 'gray';
};

// ===== MAIN COMPONENT =====

export const CardTemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { Dialog, confirm, error: showError } = useConfirmDialog();
  
  const [templates, setTemplates] = useState<CardTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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
      await showError('Fehler', 'Fehler beim Laden der Vorlagen');
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
  const handleDelete = async (template: CardTemplate) => {
    await confirm(
      'Vorlage löschen',
      `Möchten Sie die Vorlage "${template.name}" wirklich löschen? Dies kann nicht rückgängig gemacht werden.`,
      async () => {
        try {
          const { error } = await supabase
            .from('card_templates')
            .delete()
            .eq('id', template.id);

          if (error) throw error;
          
          setTemplates(prev => prev.filter(t => t.id !== template.id));
        } catch (error) {
          console.error('Error deleting template:', error);
          await showError('Fehler', 'Fehler beim Löschen der Vorlage');
        }
      },
      { isDangerous: true, confirmText: 'Löschen' }
    );
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
      await showError('Fehler', 'Fehler beim Duplizieren der Vorlage');
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
      await showError('Fehler', 'Fehler beim Aktualisieren des Status');
    }
  };

  return (
    <div className="min-h-screen">
      <Dialog />
      <AdminHeader
        title="Karten-Vorlagen"
        subtitle="Vordefinierte Karten für alle Benutzer verwalten"
        icon={LayoutGrid}
        backTo="/superadmin"
        actions={
          <button
            onClick={() => navigate('/superadmin/card-templates/new')}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition"
            style={{ backgroundColor: 'var(--admin-accent)' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <Plus className="w-4 h-4" />
            Neue Vorlage
          </button>
        }
      />

      {/* Search and Filter Bar */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--admin-bg-card)', border: '1px solid var(--admin-border)' }}>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--admin-text-muted)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Vorlagen durchsuchen..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:outline-none"
                  style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition"
                  style={selectedCategory === cat.value
                    ? { backgroundColor: 'var(--admin-accent)', color: '#fff' }
                    : { backgroundColor: 'var(--admin-bg-surface)', color: 'var(--admin-text-secondary)' }
                  }
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
            <div className="inline-block w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--admin-accent)', borderTopColor: 'transparent' }} />
            <p className="mt-4" style={{ color: 'var(--admin-text-muted)' }}>Lade Vorlagen...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12 rounded-xl" style={{ backgroundColor: 'var(--admin-bg-card)', border: '1px solid var(--admin-border)' }}>
            <LayoutGrid className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--admin-text-muted)' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--admin-text-heading)' }}>
              Keine Vorlagen gefunden
            </h3>
            <p className="mb-6" style={{ color: 'var(--admin-text-muted)' }}>
              {searchQuery || selectedCategory !== 'all'
                ? 'Versuchen Sie eine andere Suche oder Kategorie'
                : 'Erstellen Sie Ihre erste Karten-Vorlage'}
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <button
                onClick={() => navigate('/superadmin/card-templates/new')}
                className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg transition"
                style={{ backgroundColor: 'var(--admin-accent)' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
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
                className="rounded-xl transition flex"
                style={{ backgroundColor: 'var(--admin-bg-card)', border: '1px solid var(--admin-border)' }}
              >
                {/* Vertical Action Bar (Left Side) */}
                <div className="flex flex-col gap-2 p-3" style={{ backgroundColor: 'var(--admin-bg-surface)', borderRight: '1px solid var(--admin-border)' }}>
                  <button
                    onClick={() => navigate(`/superadmin/card-templates/${template.id}`)}
                    className="p-2 text-white rounded-lg transition"
                    style={{ backgroundColor: 'var(--admin-accent)' }}
                    title="Bearbeiten"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => handleDuplicate(template)}
                    className="p-2 rounded-lg transition"
                    style={{ border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                    title="Duplizieren"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(template)}
                    className="p-2 rounded-lg transition"
                    style={{ border: '1px solid var(--admin-danger)', color: 'var(--admin-danger)' }}
                    title="Löschen"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                  {/* Preview */}
                  <div className="rounded-tr-xl overflow-hidden" style={{ height: '272px', backgroundColor: 'var(--admin-bg-surface)' }}>
                    {template.preview_image ? (
                      <img
                        src={template.preview_image}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center overflow-hidden p-3" style={{ backgroundColor: 'var(--admin-bg-card)' }}>
                        {/* Render single card preview */}
                        <div className="w-full" style={{ maxHeight: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <div style={{ width: '100%', maxWidth: '220px', transform: 'scale(0.9)' }}>
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
                      <h3 className="font-semibold flex-1" style={{ color: 'var(--admin-text-heading)' }}>
                        {template.name}
                      </h3>
                      
                      {/* Badges (Right Side) */}
                      <div className="flex gap-2 ml-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium bg-${getCategoryColor(template.category)}-100 text-${getCategoryColor(template.category)}-700`}>
                          {CATEGORIES.find(c => c.value === template.category)?.label || template.category}
                        </span>
                        
                        <button
                          onClick={() => handleToggleActive(template.id, template.is_active)}
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={template.is_active
                            ? { backgroundColor: 'var(--admin-success-bg)', color: 'var(--admin-success)' }
                            : { backgroundColor: 'var(--admin-bg-surface)', color: 'var(--admin-text-muted)' }
                          }
                        >
                          {template.is_active ? 'Aktiv' : 'Inaktiv'}
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    {template.description && (
                      <p className="text-sm line-clamp-2" style={{ color: 'var(--admin-text-muted)' }}>
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
    </div>
  );
};

export default CardTemplatesPage;
