import React, { useState } from 'react';
import { Save, Settings } from 'lucide-react';
import { useWebsite } from '../../contexts/WebsiteContext';
import { AdminHeader } from './AdminHeader';

export const SettingsEditorNew: React.FC = () => {
  const { website, loading, updateSiteSettings, websiteRecord } = useWebsite();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Local state for form
  const [formData, setFormData] = useState({
    header_type: website?.site_settings?.header_type || 'simple',
  });

  // Update form data when website context loads
  React.useEffect(() => {
    if (website?.site_settings) {
      setFormData({
        header_type: website.site_settings.header_type || 'simple',
      });
    }
  }, [website?.site_settings]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      await updateSiteSettings({
        header_type: formData.header_type as 'simple' | 'centered' | 'split',
      });
      
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
      <AdminHeader title="Website-Einstellungen" icon={Settings} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-xl p-8" style={{ backgroundColor: 'var(--admin-bg-card)', border: '1px solid var(--admin-border)' }}>

          {message && (
            <div
              className="mb-6 p-4 rounded-lg"
              style={{
                backgroundColor: message.includes('Fehler') ? 'var(--admin-danger-bg)' : 'var(--admin-success-bg)',
                color: message.includes('Fehler') ? 'var(--admin-danger)' : 'var(--admin-success)',
              }}
            >
              {message}
            </div>
          )}

          <div className="space-y-6">
            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--admin-accent-bg)', border: '1px solid var(--admin-accent-bg)' }}>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--admin-accent-text)' }}>Website-Informationen</h3>
              <div className="space-y-1 text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
                <p><strong>Kunden-ID:</strong> {websiteRecord?.customer_id || 'Nicht gesetzt'}</p>
                <p><strong>Website-Name:</strong> {websiteRecord?.site_name || 'Nicht gesetzt'}</p>
                <p><strong>Status:</strong> {websiteRecord?.is_published ? '✅ Veröffentlicht' : '⚠️ Nicht veröffentlicht'}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text)' }}>
                Header-Typ
              </label>
              <select
                value={formData.header_type}
                onChange={(e) => setFormData({ ...formData, header_type: e.target.value as 'simple' | 'centered' | 'split' })}
                className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ backgroundColor: 'var(--admin-bg-input)', borderColor: 'var(--admin-border)', color: 'var(--admin-text)', border: '1px solid var(--admin-border)' }}
              >
                <option value="simple">Simple Header</option>
                <option value="centered">Centered Header</option>
                <option value="split">Split Header</option>
              </select>
              <p className="text-sm mt-1" style={{ color: 'var(--admin-text-muted)' }}>
                Wählen Sie den Stil für den Seiten-Header
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text)' }}>
                Primärfarbe
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={website?.site_settings?.theme?.primary_color || '#e11d48'}
                  disabled
                  className="h-12 w-20 rounded"
                  style={{ border: '1px solid var(--admin-border)' }}
                />
                <span className="text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
                  {website?.site_settings?.theme?.primary_color || '#e11d48'}
                </span>
              </div>
              <p className="text-sm mt-1" style={{ color: 'var(--admin-text-muted)' }}>
                Farbauswahl wird in zukünftiger Version verfügbar sein
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text)' }}>
                Schriftart
              </label>
              <input
                type="text"
                value={website?.site_settings?.theme?.font_family || 'Inter'}
                disabled
                className="w-full px-4 py-3 rounded-lg"
                style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text-secondary)' }}
              />
              <p className="text-sm mt-1" style={{ color: 'var(--admin-text-muted)' }}>
                Schriftart-Auswahl wird in zukünftiger Version verfügbar sein
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--admin-accent)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--admin-accent-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--admin-accent)'}
            >
              <Save className="w-5 h-5" />
              {saving ? 'Speichern...' : 'Speichern'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
