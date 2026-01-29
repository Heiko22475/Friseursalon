import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save, Settings } from 'lucide-react';

interface SiteSettings {
  id?: string;
  header_type: string;
  site_name: string;
  customer_id: string;
}

export const SettingsEditor: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<SiteSettings>({
    header_type: 'single-page',
    site_name: '',
    customer_id: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: result, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (result) {
        setData({
          id: result.id,
          header_type: result.header_type,
          site_name: result.site_name,
          customer_id: result.customer_id || '',
        });
      }
    } catch (error) {
      console.error('Fehler beim Laden:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateCustomerId = (id: string): boolean => {
    if (id === '') return true; // Allow empty
    return /^[0-9]{6}$/.test(id);
  };

  const handleSave = async () => {
    if (data.customer_id && !validateCustomerId(data.customer_id)) {
      setMessage('Kunden-ID muss genau 6 Ziffern enthalten!');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      if (data.id) {
        const { error } = await supabase
          .from('site_settings')
          .update({
            header_type: data.header_type,
            site_name: data.site_name,
            customer_id: data.customer_id || null,
          })
          .eq('id', data.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert([{
            header_type: data.header_type,
            site_name: data.site_name,
            customer_id: data.customer_id || null,
          }]);
        
        if (error) throw error;
      }

      setMessage('Erfolgreich gespeichert!');
      setTimeout(() => setMessage(''), 3000);
      loadData();
    } catch (error: any) {
      console.error('Fehler beim Speichern:', error);
      setMessage(error.message || 'Fehler beim Speichern!');
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website-Name
              </label>
              <input
                type="text"
                value={data.site_name}
                onChange={(e) => setData({ ...data, site_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="z.B. Friseursalon Sarah Soriano"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kunden-ID
              </label>
              <input
                type="text"
                value={data.customer_id}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow digits
                  if (value === '' || /^[0-9]{0,6}$/.test(value)) {
                    setData({ ...data, customer_id: value });
                  }
                }}
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent font-mono text-lg"
                placeholder="123456"
              />
              <p className="text-sm text-gray-500 mt-1">
                6-stellige Kundennummer (nur Ziffern)
              </p>
              {data.customer_id && !validateCustomerId(data.customer_id) && (
                <p className="text-sm text-red-600 mt-1">
                  ⚠️ Muss genau 6 Ziffern enthalten
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Header-Typ
              </label>
              <select
                value={data.header_type}
                onChange={(e) => setData({ ...data, header_type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="single-page">Single-Page (One-Pager)</option>
                <option value="multi-page">Multi-Page (Mehrere Seiten)</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Single-Page: Alle Inhalte auf einer Seite | Multi-Page: Separate Unterseiten
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || (data.customer_id && !validateCustomerId(data.customer_id))}
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
