import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save, Plus, Trash2, Edit2 } from 'lucide-react';

interface Pricing {
  id?: string;
  category: string;
  service: string;
  price: string;
  description: string;
  display_order: number;
}

export const PricingEditor: React.FC = () => {
  const navigate = useNavigate();
  const [pricings, setPricings] = useState<Pricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Pricing>({
    category: '',
    service: '',
    price: '',
    description: '',
    display_order: 0,
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPricings();
  }, []);

  const loadPricings = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPricings(data || []);
    } catch (error) {
      console.error('Fehler beim Laden:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        const { error } = await supabase
          .from('pricing')
          .update(editForm)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('pricing').insert([editForm]);
        if (error) throw error;
      }

      setMessage('Erfolgreich gespeichert!');
      setTimeout(() => setMessage(''), 3000);
      setEditingId(null);
      setEditForm({
        category: '',
        service: '',
        price: '',
        description: '',
        display_order: 0,
      });
      loadPricings();
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      setMessage('Fehler beim Speichern!');
    }
  };

  const handleEdit = (pricing: Pricing) => {
    setEditingId(pricing.id || null);
    setEditForm(pricing);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie diesen Preiseintrag wirklich löschen?')) return;

    try {
      const { error } = await supabase.from('pricing').delete().eq('id', id);
      if (error) throw error;

      setMessage('Erfolgreich gelöscht!');
      setTimeout(() => setMessage(''), 3000);
      loadPricings();
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      setMessage('Fehler beim Löschen!');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({
      category: '',
      service: '',
      price: '',
      description: '',
      display_order: 0,
    });
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-gray-600 hover:text-rose-500 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zum Dashboard
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Preise</h1>

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

          {/* Edit Form */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Preiseintrag bearbeiten' : 'Neuer Preiseintrag'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategorie</label>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="z.B. Basic, Premium, Luxury"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preis</label>
                <input
                  type="text"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="z.B. €45"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Beschreibung</label>
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="z.B. Perfect for a quick refresh"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leistungen (kommagetrennt)
                </label>
                <textarea
                  value={editForm.service}
                  onChange={(e) => setEditForm({ ...editForm, service: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="z.B. Haircut & Styling, Hair Wash, Blow Dry"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reihenfolge</label>
                <input
                  type="number"
                  value={editForm.display_order}
                  onChange={(e) =>
                    setEditForm({ ...editForm, display_order: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-rose-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-rose-600 transition"
                >
                  <Save className="w-4 h-4" />
                  Speichern
                </button>
                {editingId && (
                  <button
                    onClick={handleCancel}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
                  >
                    Abbrechen
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Pricings List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Vorhandene Preise</h2>
            {pricings.length === 0 ? (
              <p className="text-gray-500">Noch keine Preise vorhanden.</p>
            ) : (
              <div className="grid gap-4">
                {pricings.map((pricing) => (
                  <div
                    key={pricing.id}
                    className="flex items-start justify-between bg-gray-50 p-4 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{pricing.category}</h3>
                        <span className="text-rose-600 font-bold">{pricing.price}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{pricing.description}</p>
                      <p className="text-xs text-gray-700">{pricing.service}</p>
                      <p className="text-xs text-gray-500 mt-2">Reihenfolge: {pricing.display_order}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(pricing)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(pricing.id!)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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
      </div>
    </div>
  );
};
