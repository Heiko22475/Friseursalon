import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save, Plus, Trash2, Edit2, ChevronUp, ChevronDown, Palette, Eye } from 'lucide-react';
import { IconEditor, IconConfig } from './IconEditor';
import { Modal } from './Modal';
import { RichTextInput } from './RichTextInput';
import * as LucideIcons from 'lucide-react';
import { Scissors } from 'lucide-react';
import { BackgroundColorPicker } from './BackgroundColorPicker';
import { useBlockBackgroundColor } from '../../hooks/useBlockBackgroundColor';
import { getAdaptiveTextColors } from '../../utils/color-utils';

interface Service {
  id?: string;
  title: string;
  description: string;
  icon: string;
  icon_color: string;
  icon_enabled: boolean;
  icon_size: number;
  icon_bg_enabled: boolean;
  icon_bg_color: string;
  icon_bg_shape: 'rounded' | 'circle';
  icon_bg_padding: number;
  text_align: 'left' | 'center' | 'right';
  display_order: number;
}

export const ServicesEditor: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const instanceId = parseInt(searchParams.get('instance') || '1');
  const { backgroundColor, setBackgroundColor } = useBlockBackgroundColor({ blockType: 'services', instanceId });
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGlobalStyleModalOpen, setIsGlobalStyleModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [sectionContent, setSectionContent] = useState({ id: null as string | null, title: '', subtitle: '' });
  const [originalSectionContent, setOriginalSectionContent] = useState({ id: null as string | null, title: '', subtitle: '' });
  const [sectionMessage, setSectionMessage] = useState('');
  const [editForm, setEditForm] = useState<Service>({
    title: '',
    description: '',
    icon: 'Scissors',
    icon_color: '#ffffff',
    icon_enabled: true,
    icon_size: 24,
    icon_bg_enabled: true,
    icon_bg_color: '#1e293b',
    icon_bg_shape: 'rounded',
    icon_bg_padding: 10,
    text_align: 'left',
    display_order: 0,
  });
  const [globalStyle, setGlobalStyle] = useState<IconConfig & { text_align: 'left' | 'center' | 'right' }>({
    icon_enabled: true,
    icon: 'Scissors',
    icon_color: '#ffffff',
    icon_size: 24,
    icon_bg_enabled: true,
    icon_bg_color: '#1e293b',
    icon_bg_shape: 'rounded',
    icon_bg_padding: 10,
    text_align: 'left',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadServices();
    loadSectionContent();
  }, [instanceId]);

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('instance_id', instanceId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      const services = data || [];
      
      // Check for duplicate display_order values and normalize if needed
      const displayOrders = services.map(s => s.display_order);
      const hasDuplicates = displayOrders.length !== new Set(displayOrders).size;
      
      if (hasDuplicates) {
        console.log('Duplicate display_order detected, normalizing...');
        // Normalize display_order to 0, 1, 2, ... n-1
        await Promise.all(
          services.map((service, index) =>
            supabase
              .from('services')
              .update({ display_order: index })
              .eq('id', service.id)
          )
        );
        
        // Reload to get normalized data
        const { data: normalizedData, error: reloadError } = await supabase
          .from('services')
          .select('*')
          .eq('instance_id', instanceId)
          .order('display_order', { ascending: true });
          
        if (reloadError) throw reloadError;
        setServices(normalizedData || []);
      } else {
        setServices(services);
      }
    } catch (error) {
      console.error('Fehler beim Laden:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSectionContent = async () => {
    try {
      const { data, error } = await supabase
        .from('services_section')
        .select('*')
        .eq('instance_id', instanceId)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setSectionContent(data);
        setOriginalSectionContent(data);
      } else {
        // Kein Eintrag gefunden, erstelle einen neuen
        const { data: newData, error: insertError } = await supabase
          .from('services_section')
          .insert([{ 
            instance_id: instanceId, 
            title: 'Our Services', 
            subtitle: 'Premium hair care services delivered by experienced professionals' 
          }])
          .select()
          .single();

        if (insertError) throw insertError;
        
        if (newData) {
          setSectionContent(newData);
          setOriginalSectionContent(newData);
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden des Section Content:', error);
    }
  };

  const saveSectionContent = async () => {
    try {
      if (!sectionContent.id) {
        setSectionMessage('Fehler: Keine Section ID gefunden!');
        return;
      }

      const { error } = await supabase
        .from('services_section')
        .update({ 
          title: sectionContent.title,
          subtitle: sectionContent.subtitle,
          updated_at: new Date().toISOString()
        })
        .eq('id', sectionContent.id);

      if (error) throw error;

      setOriginalSectionContent(sectionContent);
      setSectionMessage('Section Header erfolgreich gespeichert!');
      setTimeout(() => setSectionMessage(''), 3000);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      setSectionMessage('Fehler beim Speichern!');
    }
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        // Update
        const { error } = await supabase
          .from('services')
          .update(editForm)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase.from('services').insert([{ ...editForm, instance_id: instanceId }]);
        if (error) throw error;
      }

      setMessage('Erfolgreich gespeichert!');
      setTimeout(() => setMessage(''), 3000);
      setEditingId(null);
      setIsModalOpen(false);
      setEditForm({
        title: '',
        description: '',
        icon: 'Scissors',
        icon_color: '#ffffff',
        icon_enabled: true,
        icon_size: 24,
        icon_bg_enabled: true,
        icon_bg_color: '#1e293b',
        icon_bg_shape: 'rounded',
        icon_bg_padding: 10,
        text_align: 'left',
        display_order: 0,
      });
      loadServices();
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      setMessage('Fehler beim Speichern!');
    }
  };

  const handleEdit = (service: Service) => {
    setEditingId(service.id || null);
    setEditForm(service);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie diesen Eintrag wirklich löschen?')) return;

    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;

      setMessage('Erfolgreich gelöscht!');
      setTimeout(() => setMessage(''), 3000);
      loadServices();
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      setMessage('Fehler beim Löschen!');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsModalOpen(false);
    setEditForm({
      title: '',
      description: '',
      icon: 'Scissors',
      icon_color: '#ffffff',
      icon_enabled: true,
      icon_size: 24,
      icon_bg_enabled: true,
      icon_bg_color: '#1e293b',
      icon_bg_shape: 'rounded',
      icon_bg_padding: 10,
      text_align: 'left',
      display_order: 0,
    });
  };

  const openNewServiceModal = () => {
    setEditingId(null);
    setEditForm({
      title: '',
      description: '',
      icon: 'Scissors',
      icon_color: '#ffffff',
      icon_enabled: true,
      icon_size: 24,
      icon_bg_enabled: true,
      icon_bg_color: '#1e293b',
      icon_bg_shape: 'rounded',
      icon_bg_padding: 10,
      text_align: 'left',
      display_order: 0,
    });
    setIsModalOpen(true);
  };

  const openGlobalStyleModal = () => {
    setIsGlobalStyleModalOpen(true);
  };

  const handleGlobalStyleSave = async () => {
    try {
      // Apply the global style to all services
      const { icon, ...styleWithoutIcon } = globalStyle;
      
      const { error } = await supabase
        .from('services')
        .update(styleWithoutIcon)
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all records

      if (error) throw error;

      setMessage('Styling erfolgreich auf alle Dienstleistungen angewendet!');
      setTimeout(() => setMessage(''), 3000);
      setIsGlobalStyleModalOpen(false);
      loadServices();
    } catch (error) {
      console.error('Fehler beim Anwenden des Stylings:', error);
      setMessage('Fehler beim Anwenden des Stylings!');
    }
  };

  const getIconBackgroundStyle = (service: Service) => {
    if (!service.icon_bg_enabled) return {};

    return {
      backgroundColor: service.icon_bg_color,
      padding: `${service.icon_bg_padding}px`,
      borderRadius: service.icon_bg_shape === 'circle' ? '50%' : '8px',
    };
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;
    
    const newServices = [...services];
    [newServices[index - 1], newServices[index]] = [newServices[index], newServices[index - 1]];
    
    // Update display_order for both items
    try {
      await Promise.all([
        supabase
          .from('services')
          .update({ display_order: index - 1 })
          .eq('id', newServices[index - 1].id),
        supabase
          .from('services')
          .update({ display_order: index })
          .eq('id', newServices[index].id),
      ]);
      
      loadServices();
    } catch (error) {
      console.error('Fehler beim Verschieben:', error);
      setMessage('Fehler beim Verschieben!');
    }
  };

  const moveDown = async (index: number) => {
    if (index === services.length - 1) return;
    
    const newServices = [...services];
    [newServices[index], newServices[index + 1]] = [newServices[index + 1], newServices[index]];
    
    // Update display_order for both items
    try {
      await Promise.all([
        supabase
          .from('services')
          .update({ display_order: index })
          .eq('id', newServices[index].id),
        supabase
          .from('services')
          .update({ display_order: index + 1 })
          .eq('id', newServices[index + 1].id),
      ]);
      
      loadServices();
    } catch (error) {
      console.error('Fehler beim Verschieben:', error);
      setMessage('Fehler beim Verschieben!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--admin-bg-surface)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--admin-accent)' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--admin-bg-surface)' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 transition" style={{ color: 'var(--admin-text-secondary)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zum Dashboard
          </button>
          <div className="flex items-center gap-3">
            <BackgroundColorPicker
              value={backgroundColor}
              onChange={setBackgroundColor}
            />
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-2 bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition"
            >
              <Eye className="w-5 h-5" />
              Vorschau
            </button>
          </div>
        </div>

        <div className="rounded-xl p-8 mb-6" style={{ backgroundColor: 'var(--admin-bg-card)', boxShadow: 'var(--admin-shadow)' }}>
          <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--admin-text-heading)' }}>
            Dienstleistungen{instanceId > 1 && ` (Instanz #${instanceId})`}
          </h1>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.includes('Fehler')
                  ? 'bg-red-50 text-red-700'
                  : 'bg-green-50 text-green-700'
              }`}
            >
              {message}
            </div>
          )}

          {/* Section Header Editor */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--admin-text-heading)' }}>Section Überschrift</h2>
            
            {sectionMessage && (
              <div
                className={`mb-4 p-3 rounded-lg text-sm ${
                  sectionMessage.includes('Fehler')
                    ? 'bg-red-50 text-red-700'
                    : 'bg-green-50 text-green-700'
                }`}
              >
                {sectionMessage}
              </div>
            )}

            <div className="space-y-4">
              <RichTextInput
                label="Hauptüberschrift"
                value={sectionContent.title}
                onChange={(value) => setSectionContent({ ...sectionContent, title: value })}
                placeholder="Our Services"
              />
              <RichTextInput
                label="Untertitel"
                value={sectionContent.subtitle}
                onChange={(value) => setSectionContent({ ...sectionContent, subtitle: value })}
                placeholder="Premium hair care services delivered by experienced professionals"
              />
              <button
                onClick={saveSectionContent}
                disabled={sectionContent.title === originalSectionContent.title && sectionContent.subtitle === originalSectionContent.subtitle}
                className="flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition"
                style={sectionContent.title === originalSectionContent.title && sectionContent.subtitle === originalSectionContent.subtitle
                  ? { backgroundColor: 'var(--admin-border-strong)', color: 'var(--admin-text-muted)', cursor: 'not-allowed' }
                  : { backgroundColor: '#3b82f6', color: 'white' }}
              >
                <Save className="w-4 h-4" />
                Section Header speichern
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={openNewServiceModal}
              className="flex items-center gap-2 text-white px-6 py-3 rounded-lg font-semibold transition" style={{ backgroundColor: 'var(--admin-accent)' }}
            >
              <Plus className="w-5 h-5" />
              Neue Dienstleistung
            </button>
            <button
              onClick={openGlobalStyleModal}
              className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              <Palette className="w-5 h-5" />
              Alle stylen
            </button>
          </div>

          {/* Modal for Add/Edit */}
          <Modal
            isOpen={isModalOpen}
            onClose={handleCancel}
            title={editingId ? 'Dienstleistung bearbeiten' : 'Neue Dienstleistung'}
          >
            <div className="space-y-4">
              <RichTextInput
                label="Titel"
                value={editForm.title}
                onChange={(value) => setEditForm({ ...editForm, title: value })}
                placeholder="z.B. Haarschnitt"
              />
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text-secondary)' }}>Beschreibung</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:border-transparent" style={{ border: '1px solid var(--admin-border-strong)' }}
                />
              </div>

              {/* Text Alignment */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text-secondary)' }}>Text-Ausrichtung</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, text_align: 'left' })}
                    className="px-4 py-2 border-2 rounded-lg transition"
                    style={editForm.text_align === 'left'
                      ? { borderColor: 'var(--admin-accent)', backgroundColor: 'var(--admin-accent-bg)', color: 'var(--admin-accent-text)' }
                      : { borderColor: 'var(--admin-border-strong)' }}
                  >
                    Linksbündig
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, text_align: 'center' })}
                    className="px-4 py-2 border-2 rounded-lg transition"
                    style={editForm.text_align === 'center'
                      ? { borderColor: 'var(--admin-accent)', backgroundColor: 'var(--admin-accent-bg)', color: 'var(--admin-accent-text)' }
                      : { borderColor: 'var(--admin-border-strong)' }}
                  >
                    Zentriert
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, text_align: 'right' })}
                    className="px-4 py-2 border-2 rounded-lg transition"
                    style={editForm.text_align === 'right'
                      ? { borderColor: 'var(--admin-accent)', backgroundColor: 'var(--admin-accent-bg)', color: 'var(--admin-accent-text)' }
                      : { borderColor: 'var(--admin-border-strong)' }}
                  >
                    Rechtsbündig
                  </button>
                </div>
              </div>

              {/* Icon Editor Component */}
              <IconEditor
                config={{
                  icon_enabled: editForm.icon_enabled,
                  icon: editForm.icon,
                  icon_color: editForm.icon_color,
                  icon_size: editForm.icon_size,
                  icon_bg_enabled: editForm.icon_bg_enabled,
                  icon_bg_color: editForm.icon_bg_color,
                  icon_bg_shape: editForm.icon_bg_shape,
                  icon_bg_padding: editForm.icon_bg_padding,
                }}
                onChange={(iconConfig: IconConfig) =>
                  setEditForm({ ...editForm, ...iconConfig })
                }
              />
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSave}
                  disabled={!editForm.title.trim() && !editForm.description.trim()}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition"
                  style={!editForm.title.trim() && !editForm.description.trim()
                    ? { backgroundColor: 'var(--admin-border-strong)', color: 'var(--admin-text-muted)', cursor: 'not-allowed' }
                    : { backgroundColor: 'var(--admin-accent)', color: 'white' }}
                >
                  <Save className="w-4 h-4" />
                  Speichern
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 rounded-lg font-semibold transition" style={{ backgroundColor: 'var(--admin-border-strong)', color: 'var(--admin-text-secondary)' }}
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </Modal>

          {/* Global Styling Modal */}
          <Modal
            isOpen={isGlobalStyleModalOpen}
            onClose={() => setIsGlobalStyleModalOpen(false)}
            title="Alle Dienstleistungen stylen"
          >
            <div className="space-y-4">
              <p className="text-sm mb-4" style={{ color: 'var(--admin-text-secondary)' }}>
                Diese Einstellungen werden auf alle Dienstleistungen angewendet. Die individuellen Icons bleiben dabei erhalten.
              </p>

              {/* Text Alignment */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text-secondary)' }}>Text-Ausrichtung</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setGlobalStyle({ ...globalStyle, text_align: 'left' })}
                    className="px-4 py-2 border-2 rounded-lg transition"
                    style={globalStyle.text_align === 'left'
                      ? { borderColor: '#3b82f6', backgroundColor: '#eff6ff', color: '#1d4ed8' }
                      : { borderColor: 'var(--admin-border-strong)' }}
                  >
                    Linksbündig
                  </button>
                  <button
                    type="button"
                    onClick={() => setGlobalStyle({ ...globalStyle, text_align: 'center' })}
                    className="px-4 py-2 border-2 rounded-lg transition"
                    style={globalStyle.text_align === 'center'
                      ? { borderColor: '#3b82f6', backgroundColor: '#eff6ff', color: '#1d4ed8' }
                      : { borderColor: 'var(--admin-border-strong)' }}
                  >
                    Zentriert
                  </button>
                  <button
                    type="button"
                    onClick={() => setGlobalStyle({ ...globalStyle, text_align: 'right' })}
                    className="px-4 py-2 border-2 rounded-lg transition"
                    style={globalStyle.text_align === 'right'
                      ? { borderColor: '#3b82f6', backgroundColor: '#eff6ff', color: '#1d4ed8' }
                      : { borderColor: 'var(--admin-border-strong)' }}
                  >
                    Rechtsbündig
                  </button>
                </div>
              </div>

              {/* Icon Editor Component ohne Icon-Auswahl */}
              <IconEditor
                config={globalStyle}
                onChange={(iconConfig: IconConfig) => setGlobalStyle({ ...iconConfig, text_align: globalStyle.text_align })}
                showIconPicker={false}
              />

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleGlobalStyleSave}
                  className="flex items-center gap-2 bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
                >
                  <Save className="w-4 h-4" />
                  Auf alle anwenden
                </button>
                <button
                  onClick={() => setIsGlobalStyleModalOpen(false)}
                  className="px-6 py-2 rounded-lg font-semibold transition" style={{ backgroundColor: 'var(--admin-border-strong)', color: 'var(--admin-text-secondary)' }}
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </Modal>

          {/* Services List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Vorhandene Dienstleistungen</h2>
            {services.length === 0 ? (
              <p style={{ color: 'var(--admin-text-muted)' }}>Noch keine Dienstleistungen vorhanden.</p>
            ) : (
              <div className="grid gap-4">
                {services.map((service, index) => (
                  <div
                    key={service.id}
                    className="flex items-start justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--admin-bg-surface)' }}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold" style={{ color: 'var(--admin-text-heading)' }}>{service.title}</h3>
                      <p className="text-sm mt-1" style={{ color: 'var(--admin-text-secondary)' }}>{service.description}</p>
                      <div className="flex items-center gap-3 text-xs mt-2" style={{ color: 'var(--admin-text-muted)' }}>
                        <span>Icon: {service.icon}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          Farbe: 
                          <span 
                            className="inline-block w-4 h-4 rounded"
                            style={{ backgroundColor: service.icon_color, border: '1px solid var(--admin-border-strong)' }}
                          />
                          {service.icon_color}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="p-2 rounded-lg transition"
                        style={index === 0
                          ? { color: 'var(--admin-border-strong)', cursor: 'not-allowed' }
                          : { color: 'var(--admin-text-secondary)' }}
                        title="Nach oben"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === services.length - 1}
                        className="p-2 rounded-lg transition"
                        style={index === services.length - 1
                          ? { color: 'var(--admin-border-strong)', cursor: 'not-allowed' }
                          : { color: 'var(--admin-text-secondary)' }}
                        title="Nach unten"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(service)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Bearbeiten"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id!)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview Modal */}
        <Modal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title="Vorschau: Services Sektion"
          maxWidth="w-[1024px]"
        >
          {(() => {
            const customProps = backgroundColor ? getAdaptiveTextColors(backgroundColor) : {};
            return (
              <div className="bg-white">
                <section 
                  className="py-20 bg-white"
                  style={{ 
                    backgroundColor: backgroundColor || undefined,
                    ...customProps as React.CSSProperties
                  }}
                >
                  <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                      <h2 
                        className="text-4xl md:text-5xl font-bold mb-4"
                        style={{ color: 'var(--text-primary, #1e293b)' }}
                      >
                        {sectionContent.title || 'Our Services'}
                      </h2>
                      <p 
                        className="text-xl max-w-2xl mx-auto"
                        style={{ color: 'var(--text-secondary, #475569)' }}
                      >
                        {sectionContent.subtitle || 'Premium hair care services delivered by experienced professionals'}
                      </p>
                    </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {services.map((service, index) => {
                    const IconComponent = (LucideIcons[service.icon as keyof typeof LucideIcons] || Scissors) as React.FC<{ 
                      size?: number; 
                      color?: string;
                      className?: string;
                    }>;
                    
                    return (
                      <div
                        key={index}
                        className="bg-slate-50 p-8 rounded-xl hover:shadow-lg transition group"
                        style={{ textAlign: service.text_align }}
                      >
                        {service.icon_enabled && (
                          <div className="mb-6 group-hover:scale-110 transition">
                            <div 
                              style={getIconBackgroundStyle(service)}
                              className={`inline-flex items-center justify-center ${
                                service.text_align === 'center' ? 'mx-auto' : ''
                              }`}
                            >
                              <IconComponent 
                                size={service.icon_size}
                                color={service.icon_color}
                              />
                            </div>
                          </div>
                        )}
                        <h3 className="text-2xl font-bold text-slate-800 mb-3">{service.title}</h3>
                        <p className="text-slate-600 mb-4">{service.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
            );
          })()}
        </Modal>
      </div>
    </div>
  );
};
