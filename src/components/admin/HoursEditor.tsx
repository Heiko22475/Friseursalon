import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save, Eye, Clock } from 'lucide-react';
import { Modal } from './Modal';

interface HoursData {
  id?: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
}

export const HoursEditor: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<HoursData>({
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: result, error } = await supabase
        .from('hours')
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
          .from('hours')
          .update({
            tuesday: data.tuesday,
            wednesday: data.wednesday,
            thursday: data.thursday,
            friday: data.friday,
            saturday: data.saturday,
          })
          .eq('id', data.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('hours').insert([data]);
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
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition font-semibold"
          >
            <Eye className="w-4 h-4" />
            Vorschau
          </button>
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
                value={data.tuesday}
                onChange={(e) => setData({ ...data, tuesday: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="08:30–13:00, 14:30–18:00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mittwoch</label>
              <input
                type="text"
                value={data.wednesday}
                onChange={(e) => setData({ ...data, wednesday: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="08:30–13:00, 14:30–19:00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Donnerstag</label>
              <input
                type="text"
                value={data.thursday}
                onChange={(e) => setData({ ...data, thursday: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="08:30–13:00, 14:30–18:00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Freitag</label>
              <input
                type="text"
                value={data.friday}
                onChange={(e) => setData({ ...data, friday: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="08:30–13:00, 14:30–18:00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Samstag</label>
              <input
                type="text"
                value={data.saturday}
                onChange={(e) => setData({ ...data, saturday: e.target.value })}
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
        <div className="bg-slate-50 p-8 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="bg-slate-800 p-3 rounded-lg">
              <Clock className="text-white" size={24} />
            </div>
            <div>
              <p className="font-semibold text-slate-800 mb-1">Opening Hours</p>
              <p className="text-slate-600">
                {data.tuesday && <><strong>Dienstag:</strong> {data.tuesday}<br /></>}
                {data.wednesday && <><strong>Mittwoch:</strong> {data.wednesday}<br /></>}
                {data.thursday && <><strong>Donnerstag:</strong> {data.thursday}<br /></>}
                {data.friday && <><strong>Freitag:</strong> {data.friday}<br /></>}
                {data.saturday && <><strong>Samstag:</strong> {data.saturday}</>
                }
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
