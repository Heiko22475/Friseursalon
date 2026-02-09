import React, { useState } from 'react';
import { Save, Eye, MapPin, Phone, Mail } from 'lucide-react';
import { AdminHeader } from './AdminHeader';
import { Modal } from './Modal';
import { BackgroundColorPicker } from './BackgroundColorPicker';
import { useBlockBackgroundColor } from '../../hooks/useBlockBackgroundColor';
import { getAdaptiveTextColors } from '../../utils/color-utils';
import { useWebsite } from '../../contexts/WebsiteContext';

export const ContactEditorNew: React.FC = () => {
  const { website, loading, updateContact } = useWebsite();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { backgroundColor, setBackgroundColor } = useBlockBackgroundColor({ 
    blockType: 'contact', 
    instanceId: 1 
  });

  // Local state for form
  const [formData, setFormData] = useState({
    street: website?.contact?.street || '',
    city: website?.contact?.city || '',
    phone: website?.contact?.phone || '',
    email: website?.contact?.email || '',
    instagram: website?.contact?.instagram || '',
    instagram_url: website?.contact?.instagram_url || '',
  });

  // Update form data when website context loads
  React.useEffect(() => {
    if (website?.contact) {
      setFormData({
        street: website.contact.street || '',
        city: website.contact.city || '',
        phone: website.contact.phone || '',
        email: website.contact.email || '',
        instagram: website.contact.instagram || '',
        instagram_url: website.contact.instagram_url || '',
      });
    }
  }, [website?.contact]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      await updateContact(formData);
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
        title="Kontaktdaten"
        icon={Mail}
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
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
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
              style={{
                backgroundColor: message.includes('Fehler') ? 'var(--admin-danger-bg)' : 'var(--admin-success-bg)',
                color: message.includes('Fehler') ? 'var(--admin-danger)' : 'var(--admin-success)'
              }}
            >
              {message}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text)' }}>Straße</label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full px-4 py-3 rounded-lg"
                style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text)' }}>Stadt</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-3 rounded-lg"
                style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text)' }}>Telefon</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-lg"
                style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text)' }}>E-Mail</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg"
                style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text)' }}>
                Instagram Handle
              </label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="w-full px-4 py-3 rounded-lg"
                style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                placeholder="@username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text)' }}>
                Instagram URL
              </label>
              <input
                type="url"
                value={formData.instagram_url}
                onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                className="w-full px-4 py-3 rounded-lg"
                style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                placeholder="https://instagram.com/username"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50"
              style={{ backgroundColor: 'var(--admin-accent)' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
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
        title="Kontakt Vorschau"
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
              <h3 
                className="text-2xl font-bold mb-6"
                style={{ color: 'var(--text-primary, #1e293b)' }}
              >
                Visit Us
              </h3>
          
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-slate-800 p-3 rounded-lg">
                    <MapPin className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 mb-1">Address</p>
                    <p className="text-slate-600">
                      {formData.street}<br />
                      {formData.city}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-slate-800 p-3 rounded-lg">
                    <Phone className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 mb-1">Phone</p>
                    <p className="text-slate-600">{formData.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-slate-800 p-3 rounded-lg">
                    <Mail className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 mb-1">Email</p>
                    <p className="text-slate-600">{formData.email}</p>
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
