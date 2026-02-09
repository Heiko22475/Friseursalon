// =====================================================
// CARD TEMPLATE EDITOR (SUPERADMIN)
// Editor für Karten-Vorlagen mit vollständigem Config-Editor
// =====================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Settings, Paintbrush, Code, Maximize2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  GenericCardConfig,
  createTemplateCardConfig,
} from '../../types/GenericCard';
import { GenericCard } from '../../components/blocks/GenericCard';
import { CardConfigEditor } from '../../components/admin/CardConfigEditor';
import { CardPreviewModal } from '../../components/admin/CardPreviewModal';
import { loadStockPhotos } from '../../lib/mediaSync';
import { useConfirmDialog } from '../../components/admin/ConfirmDialog';
import { AdminHeader } from '../../components/admin/AdminHeader';

// ===== TYPES =====

interface CardTemplate {
  id?: string;
  name: string;
  description: string;
  config: GenericCardConfig;
  category: string;
  is_active: boolean;
}

const CATEGORIES = [
  { value: 'general', label: 'Allgemein' },
  { value: 'service', label: 'Services' },
  { value: 'product', label: 'Produkte' },
  { value: 'team', label: 'Team' },
  { value: 'business', label: 'Business' },
  { value: 'testimonial', label: 'Bewertungen' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'pricing', label: 'Preise' },
  { value: 'feature', label: 'Features' },
  { value: 'offer', label: 'Angebote' },
];

// ===== MAIN COMPONENT =====

export const CardTemplateEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId: string }>();
  const isNewTemplate = templateId === 'new';
  const { Dialog, success: showSuccess, error: showError, alert: showAlert } = useConfirmDialog();

  const [template, setTemplate] = useState<CardTemplate>({
    name: '',
    description: '',
    config: createTemplateCardConfig(), // Will be updated by useEffect for new templates
    category: 'general',
    is_active: true,
  });
  const [loading, setLoading] = useState(true); // Start with loading true
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'visual' | 'json'>('settings');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Load first stock photo for new templates
  useEffect(() => {
    if (isNewTemplate) {
      loadFirstStockPhoto();
    } else {
      setLoading(false);
    }
  }, [isNewTemplate]);

  const loadFirstStockPhoto = async () => {
    try {
      const stockPhotos = await loadStockPhotos();
      if (stockPhotos && stockPhotos.length > 0) {
        const firstPhotoUrl = stockPhotos[0].url;
        setTemplate(prev => ({
          ...prev,
          config: createTemplateCardConfig(firstPhotoUrl),
        }));
      }
    } catch (error) {
      console.error('Error loading stock photo:', error);
      // Continue without photo if loading fails
    } finally {
      setLoading(false);
    }
  };

  // Load template if editing
  useEffect(() => {
    if (!isNewTemplate && templateId) {
      loadTemplate(templateId);
    }
  }, [templateId, isNewTemplate]);

  const loadTemplate = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('card_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setTemplate({
        id: data.id,
        name: data.name,
        description: data.description || '',
        config: data.config as GenericCardConfig,
        category: data.category,
        is_active: data.is_active,
      });
    } catch (error) {
      console.error('Error loading template:', error);
      await showError('Fehler', 'Fehler beim Laden der Vorlage');
      navigate('/superadmin/card-templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate
    if (!template.name.trim()) {
      await showAlert('Hinweis', 'Bitte geben Sie einen Namen ein');
      return;
    }

    try {
      setSaving(true);

      if (isNewTemplate) {
        // Create new template
        const { error } = await supabase
          .from('card_templates')
          .insert({
            name: template.name,
            description: template.description || null,
            config: template.config,
            category: template.category,
            is_active: template.is_active,
          });

        if (error) throw error;
        
        await showSuccess('Erfolgreich', 'Vorlage erfolgreich erstellt');
      } else {
        // Update existing template
        const { error } = await supabase
          .from('card_templates')
          .update({
            name: template.name,
            description: template.description || null,
            config: template.config,
            category: template.category,
            is_active: template.is_active,
          })
          .eq('id', templateId);

        if (error) throw error;
        
        await showSuccess('Erfolgreich', 'Vorlage erfolgreich gespeichert');
      }

      navigate('/superadmin/card-templates');
    } catch (error) {
      console.error('Error saving template:', error);
      await showError('Fehler', 'Fehler beim Speichern der Vorlage');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--admin-accent)', borderTopColor: 'transparent' }} />
          <p className="mt-4" style={{ color: 'var(--admin-text-muted)' }}>Lade Vorlage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Dialog />
      {/* Header */}
      <div className="sticky top-0 z-10" style={{ borderBottom: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg-surface)' }}>
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <AdminHeader
            title={isNewTemplate ? 'Neue Karten-Vorlage' : 'Vorlage bearbeiten'}
            subtitle={template.name || 'Unbenannte Vorlage'}
            icon={Settings}
            backTo="/superadmin/card-templates"
            actions={
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPreviewModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition"
                  style={{ border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                >
                  <Maximize2 className="w-4 h-4" />
                  Responsive Vorschau
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 text-white rounded-lg transition disabled:opacity-50 font-medium"
                  style={{ backgroundColor: 'var(--admin-accent)' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Speichert...' : 'Speichern'}
                </button>
              </div>
            }
          />

          {/* Tabs */}
          <div className="flex gap-4 mt-4" style={{ borderBottom: '1px solid var(--admin-border)' }}>
            <button
              onClick={() => setActiveTab('settings')}
              className="px-4 py-2 font-medium transition border-b-2"
              style={activeTab === 'settings'
                ? { borderColor: 'var(--admin-accent)', color: 'var(--admin-accent)' }
                : { borderColor: 'transparent', color: 'var(--admin-text-muted)' }
              }
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Grundeinstellungen
              </div>
            </button>
            <button
              onClick={() => setActiveTab('visual')}
              className="px-4 py-2 font-medium transition border-b-2"
              style={activeTab === 'visual'
                ? { borderColor: 'var(--admin-accent)', color: 'var(--admin-accent)' }
                : { borderColor: 'transparent', color: 'var(--admin-text-muted)' }
              }
            >
              <div className="flex items-center gap-2">
                <Paintbrush className="w-4 h-4" />
                Visueller Editor
              </div>
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className="px-4 py-2 font-medium transition border-b-2"
              style={activeTab === 'json'
                ? { borderColor: 'var(--admin-accent)', color: 'var(--admin-accent)' }
                : { borderColor: 'transparent', color: 'var(--admin-text-muted)' }
              }
            >
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                JSON Editor
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        {activeTab === 'settings' ? (
          // Settings Tab
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Settings Panel */}
            <div className="space-y-6">
              <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--admin-bg-card)', border: '1px solid var(--admin-border)' }}>
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--admin-text-heading)' }}>
                  Vorlagen-Einstellungen
                </h2>
                
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>
                      Name *
                    </label>
                    <input
                      type="text"
                      value={template.name}
                      onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                      placeholder="z.B. Service-Karte mit Icon"
                      className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:outline-none"
                      style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>
                      Beschreibung
                    </label>
                    <textarea
                      value={template.description}
                      onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                      placeholder="Kurze Beschreibung der Vorlage..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:outline-none"
                      style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>
                      Kategorie
                    </label>
                    <select
                      value={template.category}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTemplate({ ...template, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:outline-none"
                      style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={template.is_active}
                      onChange={(e) => setTemplate({ ...template, is_active: e.target.checked })}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: 'var(--admin-accent)' }}
                    />
                    <label htmlFor="is_active" className="text-sm font-medium" style={{ color: 'var(--admin-text)' }}>
                      Vorlage für Benutzer aktivieren
                    </label>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--admin-accent-bg)', border: '1px solid var(--admin-accent)' }}>
                <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--admin-accent)' }}>
                  💡 Nächster Schritt
                </h3>
                <p className="text-sm mb-3" style={{ color: 'var(--admin-text)' }}>
                  Wechseln Sie zum Tab "Visueller Editor", um das Design und Layout der Karte anzupassen.
                </p>
                <button
                  onClick={() => setActiveTab('visual')}
                  className="text-sm font-medium underline"
                  style={{ color: 'var(--admin-accent)' }}
                >
                  Zum Visuellen Editor →
                </button>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="lg:sticky lg:top-24">
              <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--admin-bg-card)', border: '1px solid var(--admin-border)' }}>
                <div className="px-4 py-3" style={{ backgroundColor: 'var(--admin-bg-surface)', borderBottom: '1px solid var(--admin-border)' }}>
                  <h3 className="font-semibold" style={{ color: 'var(--admin-text)' }}>Live-Vorschau</h3>
                </div>
                <div className="p-6" style={{ backgroundColor: 'var(--admin-bg-surface)', minHeight: '500px' }}>
                  <div className="transform scale-90 origin-top">
                    <GenericCard config={template.config} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'visual' ? (
          // Visual Editor Tab
          <div className="flex gap-6" style={{ minHeight: 'calc(100vh - 200px)' }}>
            {/* Editor Panel - 55% */}
            <div className="w-[55%] overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              <CardConfigEditor
                config={template.config}
                onChange={(config) => setTemplate({ ...template, config })}
              />
            </div>

            {/* Preview Panel - 45% */}
            <div className="w-[45%]">
              <div className="sticky top-24 rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--admin-bg-card)', border: '1px solid var(--admin-border)' }}>
                <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: 'var(--admin-bg-surface)', borderBottom: '1px solid var(--admin-border)' }}>
                  <h3 className="font-semibold" style={{ color: 'var(--admin-text)' }}>Live-Vorschau</h3>
                  <span className="text-xs px-2 py-1 rounded" style={{ color: 'var(--admin-text-muted)', backgroundColor: 'var(--admin-bg-surface)' }}>
                    Aktualisiert automatisch
                  </span>
                </div>
                <div
                  className="overflow-y-auto"
                  style={{ maxHeight: 'calc(100vh - 260px)', backgroundColor: 'var(--admin-bg-surface)' }}
                >
                  <div className="transform scale-[0.85] origin-top">
                    <GenericCard config={template.config} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // JSON Editor Tab
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* JSON Editor */}
            <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--admin-bg-card)', border: '1px solid var(--admin-border)' }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--admin-text-heading)' }}>
                Karten-Konfiguration (JSON)
              </h2>
              <p className="text-sm mb-4" style={{ color: 'var(--admin-text-muted)' }}>
                Für fortgeschrittene Benutzer: Bearbeiten Sie die Konfiguration direkt als JSON. Achten Sie auf gültige JSON-Syntax.
              </p>
              <textarea
                value={JSON.stringify(template.config, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setTemplate({ ...template, config: parsed });
                  } catch (error) {
                    // Invalid JSON, don't update
                  }
                }}
                className="w-full h-[calc(100vh-320px)] px-4 py-3 rounded-lg focus:ring-2 focus:outline-none font-mono text-sm"
                style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)', resize: 'none' }}
                spellCheck={false}
              />
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setTemplate({ ...template, config: createTemplateCardConfig() });
                  }}
                  className="px-4 py-2 rounded-lg transition text-sm"
                  style={{ border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                >
                  Standard-Konfiguration laden
                </button>
                <button
                  onClick={async () => {
                    const formatted = JSON.stringify(template.config, null, 2);
                    navigator.clipboard.writeText(formatted);
                    await showSuccess('Kopiert', 'Konfiguration in Zwischenablage kopiert!');
                  }}
                  className="px-4 py-2 rounded-lg transition text-sm"
                  style={{ border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                >
                  Kopieren
                </button>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="lg:sticky lg:top-24">
              <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--admin-bg-card)', border: '1px solid var(--admin-border)' }}>
                <div className="px-4 py-3" style={{ backgroundColor: 'var(--admin-bg-surface)', borderBottom: '1px solid var(--admin-border)' }}>
                  <h3 className="font-semibold" style={{ color: 'var(--admin-text)' }}>Live-Vorschau</h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--admin-text-muted)' }}>Aktualisiert beim Speichern von gültigem JSON</p>
                </div>
                <div 
                  className="p-6 overflow-y-auto" 
                  style={{ maxHeight: 'calc(100vh - 280px)', backgroundColor: 'var(--admin-bg-surface)' }}
                >
                  <div className="transform scale-90 origin-top">
                    <GenericCard config={template.config} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <CardPreviewModal
          config={template.config}
          onClose={() => setShowPreviewModal(false)}
        />
      )}
    </div>
  );
};

export default CardTemplateEditorPage;
