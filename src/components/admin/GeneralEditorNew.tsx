import React, { useState, useEffect } from 'react';
import { Save, Eye, ArrowRight } from 'lucide-react';
import { AdminHeader } from './AdminHeader';
import { Modal } from './Modal';
import { BackgroundColorPicker } from './BackgroundColorPicker';
import { useBlockBackgroundColor } from '../../hooks/useBlockBackgroundColor';
import { getAdaptiveTextColors } from '../../utils/color-utils';
import { useWebsite, GeneralInfo } from '../../contexts/WebsiteContext';

export const GeneralEditorNew: React.FC = () => {
  const { website, websiteRecord, updateGeneralInfo, loading } = useWebsite();
  
  const [data, setData] = useState<GeneralInfo>({
    name: '',
    full_name: '',
    tagline: '',
    motto: '',
    description: '',
  });
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { backgroundColor, setBackgroundColor } = useBlockBackgroundColor({ blockType: 'hero', instanceId: 1 });

  useEffect(() => {
    if (websiteRecord && website) {
      if (website.general) {
          setData({
            name: websiteRecord.site_name || website.general.name || '',
            full_name: website.general.full_name || '',
            tagline: website.general.tagline || '',
            motto: website.general.motto || '',
            description: website.general.description || '',
          });
      } else {
          // Fallback: Try to migrate from legacy 'general' table
          /* 
          const loadLegacy = async () => {
              try {
                  const { data: legacy } = await supabase.from('general').select('*').limit(1).single();
                  if (legacy) {
                      setData({
                          name: legacy.name || websiteRecord.site_name || '',
                          full_name: legacy.full_name || '',
                          tagline: legacy.tagline || '',
                          motto: legacy.motto || '',
                          description: legacy.description || '',
                      });
                  }
              } catch (err) {
                  console.warn("Could not load legacy general data", err);
              }
          };
          loadLegacy();
          */
      }
    }
  }, [website, websiteRecord]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      // Pass general info AND site_name (data.name) to update function
      await updateGeneralInfo(data, data.name);

      setMessage('Erfolgreich gespeichert!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      setMessage('Fehler beim Speichern!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--admin-accent)' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Allgemeine Informationen"
        actions={
          <div className="flex items-center gap-2">
            <BackgroundColorPicker
              value={backgroundColor}
              onChange={setBackgroundColor}
            />
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-2 text-white px-4 py-2 rounded-lg transition font-semibold"
              style={{ backgroundColor: 'var(--admin-success)' }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <Eye className="w-4 h-4" />
              Vorschau
            </button>
          </div>
        }
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-xl p-8" style={{ backgroundColor: 'var(--admin-bg-card)' }}>

          {message && (
            <div
              className="mb-6 p-4 rounded-lg"
              style={
                message.includes('Fehler')
                  ? { backgroundColor: 'var(--admin-danger-bg)', color: 'var(--admin-danger)' }
                  : { backgroundColor: 'var(--admin-success-bg)', color: 'var(--admin-success)' }
              }
            >
              {message}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text)' }}>
                Salon Name (Website Name)
              </label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--admin-text-muted)' }}>Dieser Name wird auch für die Website-Verwaltung verwendet.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text)' }}>
                Vollständiger Name
              </label>
              <input
                type="text"
                value={data.full_name}
                onChange={(e) => setData({ ...data, full_name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text)' }}>
                Tagline
              </label>
              <input
                type="text"
                value={data.tagline}
                onChange={(e) => setData({ ...data, tagline: e.target.value })}
                className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text)' }}>
                Motto
              </label>
              <input
                type="text"
                value={data.motto}
                onChange={(e) => setData({ ...data, motto: e.target.value })}
                className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text)' }}>
                Beschreibung
              </label>
              <textarea
                value={data.description}
                onChange={(e) => setData({ ...data, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50"
              style={{ backgroundColor: 'var(--admin-accent)' }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <Save className="w-5 h-5" />
              {saving ? 'Speichern...' : 'Speichern'}
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Hero Vorschau"
        maxWidth="w-[1024px]"
      >
        {(() => {
          const customProps = backgroundColor ? getAdaptiveTextColors(backgroundColor) : {};
          return (
            <div 
              className="pt-8 min-h-[400px] flex items-center rounded-xl"
              style={{ 
                backgroundColor: backgroundColor || undefined,
                backgroundImage: backgroundColor ? 'none' : 'linear-gradient(to bottom right, #f8fafc, #ffffff, #f1f5f9)',
                ...customProps as React.CSSProperties
              }}
            >
              <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto text-center">
                  <h1 
                    className="text-4xl md:text-6xl font-bold mb-6"
                    style={{ color: 'var(--text-primary, #1e293b)' }}
                  >
                    {data.tagline.split(' & ')[0]} &
                    <span 
                      className="block"
                      style={{ color: 'var(--text-primary, #334155)' }}
                    >
                      {data.tagline.split(' & ')[1] || data.tagline}
                    </span>
                  </h1>
                  <p 
                    className="text-lg md:text-xl mb-8 max-w-2xl mx-auto italic"
                    style={{ color: 'var(--text-secondary, #475569)' }}
                  >
                    "{data.motto}" – {data.name}
                  </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  className="bg-slate-800 text-white px-8 py-4 rounded-lg hover:bg-slate-700 transition flex items-center justify-center gap-2 text-lg"
                >
                  Book Appointment
                  <ArrowRight size={20} />
                </button>
                <button
                  className="border-2 border-slate-800 text-slate-800 px-8 py-4 rounded-lg hover:bg-slate-800 hover:text-white transition text-lg"
                >
                  View Services
                </button>
              </div>
            </div>
          </div>
        </div>
          );
        })()}
      </Modal>
    </div>
  );
};
