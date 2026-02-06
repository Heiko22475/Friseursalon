// =====================================================
// CARD TEMPLATE EDITOR (SUPERADMIN)
// Editor für Karten-Vorlagen mit vollständigem Config-Editor
// =====================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Settings, Paintbrush, Code, Maximize2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  GenericCardConfig,
  createTemplateCardConfig,
} from '../../types/GenericCard';
import { GenericCard } from '../../components/blocks/GenericCard';
import { CardConfigEditor } from '../../components/admin/CardConfigEditor';
import { CardPreviewModal } from '../../components/admin/CardPreviewModal';
import { loadStockPhotos } from '../../lib/mediaSync';

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
      alert('Fehler beim Laden der Vorlage');
      navigate('/superadmin/card-templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate
    if (!template.name.trim()) {
      alert('Bitte geben Sie einen Namen ein');
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
        
        alert('Vorlage erfolgreich erstellt');
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
        
        alert('Vorlage erfolgreich gespeichert');
      }

      navigate('/superadmin/card-templates');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Fehler beim Speichern der Vorlage');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-500">Lade Vorlage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/superadmin/card-templates')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isNewTemplate ? 'Neue Karten-Vorlage' : 'Vorlage bearbeiten'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {template.name || 'Unbenannte Vorlage'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreviewModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <Maximize2 className="w-4 h-4" />
                Responsive Vorschau
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition disabled:opacity-50 font-medium"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Speichert...' : 'Speichern'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-4 border-b">
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 font-medium transition border-b-2 ${
                activeTab === 'settings'
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Grundeinstellungen
              </div>
            </button>
            <button
              onClick={() => setActiveTab('visual')}
              className={`px-4 py-2 font-medium transition border-b-2 ${
                activeTab === 'visual'
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Paintbrush className="w-4 h-4" />
                Visueller Editor
              </div>
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`px-4 py-2 font-medium transition border-b-2 ${
                activeTab === 'json'
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
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
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Vorlagen-Einstellungen
                </h2>
                
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={template.name}
                      onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                      placeholder="z.B. Service-Karte mit Icon"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Beschreibung
                    </label>
                    <textarea
                      value={template.description}
                      onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                      placeholder="Kurze Beschreibung der Vorlage..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategorie
                    </label>
                    <select
                      value={template.category}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTemplate({ ...template, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
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
                      className="w-4 h-4 text-rose-500 border-gray-300 rounded focus:ring-rose-500"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                      Vorlage für Benutzer aktivieren
                    </label>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  💡 Nächster Schritt
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  Wechseln Sie zum Tab "Visueller Editor", um das Design und Layout der Karte anzupassen.
                </p>
                <button
                  onClick={() => setActiveTab('visual')}
                  className="text-sm font-medium text-blue-700 hover:text-blue-800 underline"
                >
                  Zum Visuellen Editor →
                </button>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="lg:sticky lg:top-24">
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="bg-gray-50 border-b px-4 py-3">
                  <h3 className="font-semibold text-gray-700">Live-Vorschau</h3>
                </div>
                <div className="p-6 bg-gray-100" style={{ minHeight: '500px' }}>
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
              <div className="sticky top-24 bg-white rounded-xl shadow-lg border overflow-hidden">
                <div className="bg-gray-50 border-b px-4 py-3 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-700">Live-Vorschau</h3>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    Aktualisiert automatisch
                  </span>
                </div>
                <div
                  className="overflow-y-auto bg-gray-100"
                  style={{ maxHeight: 'calc(100vh - 260px)' }}
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
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Karten-Konfiguration (JSON)
              </h2>
              <p className="text-sm text-gray-500 mb-4">
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
                className="w-full h-[calc(100vh-320px)] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-mono text-sm"
                style={{ resize: 'none' }}
                spellCheck={false}
              />
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setTemplate({ ...template, config: createTemplateCardConfig() });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  Standard-Konfiguration laden
                </button>
                <button
                  onClick={() => {
                    const formatted = JSON.stringify(template.config, null, 2);
                    navigator.clipboard.writeText(formatted);
                    alert('Konfiguration in Zwischenablage kopiert!');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  Kopieren
                </button>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="lg:sticky lg:top-24">
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="bg-gray-50 border-b px-4 py-3">
                  <h3 className="font-semibold text-gray-700">Live-Vorschau</h3>
                  <p className="text-xs text-gray-500 mt-1">Aktualisiert beim Speichern von gültigem JSON</p>
                </div>
                <div 
                  className="p-6 bg-gray-100 overflow-y-auto" 
                  style={{ maxHeight: 'calc(100vh - 280px)' }}
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
