import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save, Eye, MapPin, Phone, Mail } from 'lucide-react';
import { Modal } from './Modal';
import { BackgroundColorPicker } from './BackgroundColorPicker';
import { useBlockBackgroundColor } from '../../hooks/useBlockBackgroundColor';
import { getAdaptiveTextColors } from '../../utils/color-utils';

interface ContactData {
  id?: string;
  street: string;
  city: string;
  phone: string;
  email: string;
  instagram: string;
  instagram_url: string;
}

export const ContactEditor: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ContactData>({
    street: '',
    city: '',
    phone: '',
    email: '',
    instagram: '',
    instagram_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { backgroundColor, setBackgroundColor } = useBlockBackgroundColor({ blockType: 'contact', instanceId: 1 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: result, error } = await supabase
        .from('contact')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (result) setData(result);
    } catch (error) {
      console.error('Fehler beim Laden:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      if (data.id) {
        const { error } = await supabase
          .from('contact')
          .update({
            street: data.street,
            city: data.city,
            phone: data.phone,
            email: data.email,
            instagram: data.instagram,
            instagram_url: data.instagram_url,
          })
          .eq('id', data.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('contact').insert([data]);
        if (error) throw error;
      }

      setMessage('Erfolgreich gespeichert!');
      setTimeout(() => setMessage(''), 3000);
      loadData();
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Kontaktdaten</h1>

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
              <label className="block text-sm font-medium text-gray-700 mb-2">Straße</label>
              <input
                type="text"
                value={data.street}
                onChange={(e) => setData({ ...data, street: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stadt</label>
              <input
                type="text"
                value={data.city}
                onChange={(e) => setData({ ...data, city: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
              <input
                type="text"
                value={data.phone}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-Mail</label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram Handle
              </label>
              <input
                type="text"
                value={data.instagram}
                onChange={(e) => setData({ ...data, instagram: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="@username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram URL
              </label>
              <input
                type="url"
                value={data.instagram_url}
                onChange={(e) => setData({ ...data, instagram_url: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="https://instagram.com/username"
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
                  {data.street}<br />
                  {data.city}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-slate-800 p-3 rounded-lg">
                <Phone className="text-white" size={24} />
              </div>
              <div>
                <p className="font-semibold text-slate-800 mb-1">Phone</p>
                <p className="text-slate-600">{data.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-slate-800 p-3 rounded-lg">
                <Mail className="text-white" size={24} />
              </div>
              <div>
                <p className="font-semibold text-slate-800 mb-1">Email</p>
                <p className="text-slate-600">{data.email}</p>
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
