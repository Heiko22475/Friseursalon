import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save, Trash2, Edit2, Eye, Star } from 'lucide-react';
import { Modal } from './Modal';
import { BackgroundColorPicker } from './BackgroundColorPicker';
import { useBlockBackgroundColor } from '../../hooks/useBlockBackgroundColor';
import { getAdaptiveTextColors } from '../../utils/color-utils';

interface Review {
  id?: string;
  name: string;
  rating: number;
  text: string;
  date: string;
  display_order: number;
}

export const ReviewsEditor: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const instanceId = parseInt(searchParams.get('instance') || '1');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Review>({
    name: '',
    rating: 5,
    text: '',
    date: new Date().getFullYear().toString(),
    display_order: 0,
  });
  const [message, setMessage] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { backgroundColor, setBackgroundColor } = useBlockBackgroundColor({ blockType: 'reviews', instanceId });

  useEffect(() => {
    loadReviews();
  }, [instanceId]);

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('instance_id', instanceId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setReviews(data || []);
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
          .from('reviews')
          .update(editForm)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('reviews').insert([{ ...editForm, instance_id: instanceId }]);
        if (error) throw error;
      }

      setMessage('Erfolgreich gespeichert!');
      setTimeout(() => setMessage(''), 3000);
      setEditingId(null);
      setEditForm({
        name: '',
        rating: 5,
        text: '',
        date: new Date().getFullYear().toString(),
        display_order: 0,
      });
      loadReviews();
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      setMessage('Fehler beim Speichern!');
    }
  };

  const handleEdit = (review: Review) => {
    setEditingId(review.id || null);
    setEditForm(review);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie diese Bewertung wirklich löschen?')) return;

    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;

      setMessage('Erfolgreich gelöscht!');
      setTimeout(() => setMessage(''), 3000);
      loadReviews();
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      setMessage('Fehler beim Löschen!');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({
      name: '',
      rating: 5,
      text: '',
      date: new Date().getFullYear().toString(),
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

        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Bewertungen{instanceId > 1 && ` (Instanz #${instanceId})`}
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

          {/* Edit Form */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Bewertung bearbeiten' : 'Neue Bewertung'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bewertung</label>
                <select
                  value={editForm.rating}
                  onChange={(e) =>
                    setEditForm({ ...editForm, rating: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 Sterne)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 Sterne)</option>
                  <option value={3}>⭐⭐⭐ (3 Sterne)</option>
                  <option value={2}>⭐⭐ (2 Sterne)</option>
                  <option value={1}>⭐ (1 Stern)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Text</label>
                <textarea
                  value={editForm.text}
                  onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Datum/Jahr</label>
                  <input
                    type="text"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="2025"
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

          {/* Reviews List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Vorhandene Bewertungen</h2>
            {reviews.length === 0 ? (
              <p className="text-gray-500">Noch keine Bewertungen vorhanden.</p>
            ) : (
              <div className="grid gap-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="flex items-start justify-between bg-gray-50 p-4 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{review.name}</h3>
                        <span className="text-yellow-500">
                          {'⭐'.repeat(review.rating)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{review.text}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {review.date} | Reihenfolge: {review.display_order}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(review)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(review.id!)}
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

      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Bewertungen Vorschau"
        maxWidth="w-[1024px]"
      >
        {(() => {
          const cssVars = backgroundColor ? getAdaptiveTextColors(backgroundColor) : { '--text-primary': '#ffffff', '--text-secondary': '#e2e8f0', '--text-muted': '#9CA3AF' };
          return (
            <div 
              className="py-8 px-4 rounded-xl"
              style={{ 
                backgroundColor: backgroundColor || '#0f172a',
                ...cssVars as React.CSSProperties
              }}
            >
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="fill-amber-500 text-amber-500" size={32} />
              ))}
            </div>

            {reviews.length > 0 && (
              <>
                <blockquote 
                  className="text-2xl md:text-3xl font-serif italic mb-8 leading-relaxed"
                  style={{ color: cssVars['--text-primary'] }}
                >
                  "{reviews[0].text}"
                </blockquote>

                <div className="text-amber-500 uppercase tracking-widest text-sm font-semibold">
                  {reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '5.0'} Sterne bei {reviews.length} Google-Rezensionen
                </div>
              </>
            )}

            {reviews.length > 1 && (
              <div className="mt-12 grid md:grid-cols-3 gap-6 text-left">
                {reviews.slice(1).map((review, index) => (
                  <div key={index} className="bg-white/10 p-6 rounded-lg">
                    <div className="flex mb-3">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="fill-amber-500 text-amber-500" size={16} />
                      ))}
                    </div>
                    <p className="text-slate-300 italic mb-3">"{review.text}"</p>
                    <p className="text-slate-400 text-sm">- {review.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
          );
        })()}
      </Modal>
    </div>
  );
};
