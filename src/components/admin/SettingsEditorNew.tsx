import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Settings } from 'lucide-react';
import { useWebsite } from '../../contexts/WebsiteContext';

export const SettingsEditorNew: React.FC = () => {
  const navigate = useNavigate();
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-gray-600 hover:text-rose-500 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zum Dashboard
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-8 h-8 text-rose-500" />
            <h1 className="text-3xl font-bold text-gray-900">
              Website-Einstellungen
            </h1>
          </div>

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

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Website-Informationen</h3>
              <div className="space-y-1 text-sm text-blue-800">
                <p><strong>Kunden-ID:</strong> {websiteRecord?.customer_id || 'Nicht gesetzt'}</p>
                <p><strong>Website-Name:</strong> {websiteRecord?.site_name || 'Nicht gesetzt'}</p>
                <p><strong>Status:</strong> {websiteRecord?.is_published ? '✅ Veröffentlicht' : '⚠️ Nicht veröffentlicht'}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Header-Typ
              </label>
              <select
                value={formData.header_type}
                onChange={(e) => setFormData({ ...formData, header_type: e.target.value as 'simple' | 'centered' | 'split' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="simple">Simple Header</option>
                <option value="centered">Centered Header</option>
                <option value="split">Split Header</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Wählen Sie den Stil für den Seiten-Header
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primärfarbe
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={website?.site_settings?.theme?.primary_color || '#e11d48'}
                  disabled
                  className="h-12 w-20 rounded border border-gray-300"
                />
                <span className="text-sm text-gray-600">
                  {website?.site_settings?.theme?.primary_color || '#e11d48'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Farbauswahl wird in zukünftiger Version verfügbar sein
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schriftart
              </label>
              <input
                type="text"
                value={website?.site_settings?.theme?.font_family || 'Inter'}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
              <p className="text-sm text-gray-500 mt-1">
                Schriftart-Auswahl wird in zukünftiger Version verfügbar sein
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-rose-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-rose-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
