import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Clock } from 'lucide-react';
import { Modal } from './Modal';
import { BackgroundColorPicker } from './BackgroundColorPicker';
import { useBlockBackgroundColor } from '../../hooks/useBlockBackgroundColor';
import { getAdaptiveTextColors } from '../../utils/color-utils';
import { useWebsite } from '../../contexts/WebsiteContext';

export const HoursEditorNew: React.FC = () => {
  const navigate = useNavigate();
  const { website, loading, updateHours } = useWebsite();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { backgroundColor, setBackgroundColor } = useBlockBackgroundColor({ 
    blockType: 'hours', 
    instanceId: 1 
  });

  // Local state for form
  const [formData, setFormData] = useState({
    tuesday: website?.hours?.tuesday || '',
    wednesday: website?.hours?.wednesday || '',
    thursday: website?.hours?.thursday || '',
    friday: website?.hours?.friday || '',
    saturday: website?.hours?.saturday || '',
  });

  // Update form data when website context loads
  React.useEffect(() => {
    if (website?.hours) {
      setFormData({
        tuesday: website.hours.tuesday || '',
        wednesday: website.hours.wednesday || '',
        thursday: website.hours.thursday || '',
        friday: website.hours.friday || '',
        saturday: website.hours.saturday || '',
      });
    }
  }, [website?.hours]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      await updateHours(formData);
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
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-gray-600 hover:text-rose-500 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zum Dashboard
          </button>
          <div className="flex items-center gap-2">
            <BackgroundColorPicker
              value={backgroundColor}
              onChange={setBackgroundColor}
            />
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition font-semibold"
            >
              <Eye className="w-4 h-4" />
              Vorschau
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Öffnungszeiten</h1>

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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dienstag</label>
              <input
                type="text"
                value={formData.tuesday}
                onChange={(e) => setFormData({ ...formData, tuesday: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="08:30–13:00, 14:30–18:00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mittwoch</label>
              <input
                type="text"
                value={formData.wednesday}
                onChange={(e) => setFormData({ ...formData, wednesday: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="08:30–13:00, 14:30–19:00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Donnerstag</label>
              <input
                type="text"
                value={formData.thursday}
                onChange={(e) => setFormData({ ...formData, thursday: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="08:30–13:00, 14:30–18:00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Freitag</label>
              <input
                type="text"
                value={formData.friday}
                onChange={(e) => setFormData({ ...formData, friday: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="08:30–13:00, 14:30–18:00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Samstag</label>
              <input
                type="text"
                value={formData.saturday}
                onChange={(e) => setFormData({ ...formData, saturday: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="08:30–13:00"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-rose-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-rose-600 transition disabled:opacity-50"
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
        title="Öffnungszeiten Vorschau"
        maxWidth="w-[1024px]"
      >
        {(() => {
          const customProps = backgroundColor ? getAdaptiveTextColors(backgroundColor) : {};
          return (
            <div 
              className="p-8 rounded-xl"
              style={{ 
                backgroundColor: backgroundColor || '#f8fafc',
                ...customProps as React.CSSProperties
              }}
            >
              <div className="flex items-start gap-4">
                <div className="bg-slate-800 p-3 rounded-lg">
                  <Clock className="text-white" size={24} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 mb-1">Opening Hours</p>
                  <p className="text-slate-600">
                    {formData.tuesday && <><strong>Dienstag:</strong> {formData.tuesday}<br /></>}
                    {formData.wednesday && <><strong>Mittwoch:</strong> {formData.wednesday}<br /></>}
                    {formData.thursday && <><strong>Donnerstag:</strong> {formData.thursday}<br /></>}
                    {formData.friday && <><strong>Freitag:</strong> {formData.friday}<br /></>}
                    {formData.saturday && <><strong>Samstag:</strong> {formData.saturday}</>}
                  </p>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};
