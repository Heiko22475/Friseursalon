import React, { useState } from 'react';
import { Save, Trash2, Edit2, Eye, Star } from 'lucide-react';
import { AdminHeader } from './AdminHeader';
import { Modal } from './Modal';
import { BackgroundColorPicker } from './BackgroundColorPicker';
import { useBlockBackgroundColor } from '../../hooks/useBlockBackgroundColor';
import { getAdaptiveTextColors } from '../../utils/color-utils';
import { useWebsite } from '../../contexts/WebsiteContext';
import type { Review } from '../../contexts/WebsiteContext';

export const ReviewsEditorNew: React.FC = () => {
  const { website, loading, updateReviews } = useWebsite();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { backgroundColor, setBackgroundColor } = useBlockBackgroundColor({ 
    blockType: 'reviews', 
    instanceId: 1 
  });

  const reviews = website?.reviews || [];

  const [editForm, setEditForm] = useState<Omit<Review, 'id'>>({
    author_name: '',
    rating: 5,
    review_text: '',
    review_date: new Date().getFullYear().toString(),
    is_featured: false,
  });

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      let updatedReviews: Review[];

      if (editingId) {
        // Update existing review
        updatedReviews = reviews.map(r => 
          r.id === editingId ? { ...r, ...editForm } : r
        );
      } else {
        // Add new review
        const newReview: Review = {
          id: crypto.randomUUID(),
          ...editForm,
        };
        updatedReviews = [...reviews, newReview];
      }

      await updateReviews(updatedReviews);
      
      setMessage('Erfolgreich gespeichert!');
      setTimeout(() => setMessage(''), 3000);
      handleCancel();
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      setMessage('Fehler beim Speichern!');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingId(review.id);
    setEditForm({
      author_name: review.author_name,
      rating: review.rating,
      review_text: review.review_text,
      review_date: review.review_date,
      is_featured: review.is_featured,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie diese Bewertung wirklich löschen?')) return;

    setSaving(true);
    try {
      const updatedReviews = reviews.filter(r => r.id !== id);
      await updateReviews(updatedReviews);
      
      setMessage('Erfolgreich gelöscht!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      setMessage('Fehler beim Löschen!');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({
      author_name: '',
      rating: 5,
      review_text: '',
      review_date: new Date().getFullYear().toString(),
      is_featured: false,
    });
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
        title="Bewertungen"
        icon={Star}
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="rounded-xl p-8 mb-6" style={{ backgroundColor: 'var(--admin-bg-card)' }}>

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

          {/* Edit Form */}
          <div className="p-6 rounded-lg mb-8" style={{ backgroundColor: 'var(--admin-bg-surface)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--admin-text-heading)' }}>
              {editingId ? 'Bewertung bearbeiten' : 'Neue Bewertung'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text)' }}>Name</label>
                <input
                  type="text"
                  value={editForm.author_name}
                  onChange={(e) => setEditForm({ ...editForm, author_name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg"
                  style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text)' }}>Bewertung</label>
                <select
                  value={editForm.rating}
                  onChange={(e) =>
                    setEditForm({ ...editForm, rating: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 rounded-lg"
                  style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 Sterne)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 Sterne)</option>
                  <option value={3}>⭐⭐⭐ (3 Sterne)</option>
                  <option value={2}>⭐⭐ (2 Sterne)</option>
                  <option value={1}>⭐ (1 Stern)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text)' }}>Text</label>
                <textarea
                  value={editForm.review_text}
                  onChange={(e) => setEditForm({ ...editForm, review_text: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg"
                  style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text)' }}>Datum/Jahr</label>
                  <input
                    type="text"
                    value={editForm.review_date}
                    onChange={(e) => setEditForm({ ...editForm, review_date: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg"
                    style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                    placeholder="2025"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.is_featured}
                      onChange={(e) => setEditForm({ ...editForm, is_featured: e.target.checked })}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: 'var(--admin-accent)' }}
                    />
                    <span className="text-sm font-medium" style={{ color: 'var(--admin-text)' }}>Als Featured markieren</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 text-white px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                  style={{ backgroundColor: 'var(--admin-accent)' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Speichern...' : 'Speichern'}
                </button>
                {editingId && (
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2 rounded-lg font-semibold transition"
                    style={{ backgroundColor: 'var(--admin-bg-hover)', color: 'var(--admin-text)' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    Abbrechen
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--admin-text-heading)' }}>Vorhandene Bewertungen</h2>
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--admin-text-muted)' }}>Noch keine Bewertungen vorhanden.</p>
            ) : (
              <div className="grid gap-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="flex items-start justify-between p-4 rounded-lg"
                    style={{ backgroundColor: 'var(--admin-bg-surface)' }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold" style={{ color: 'var(--admin-text-heading)' }}>{review.author_name}</h3>
                        <span className="text-yellow-500">
                          {'⭐'.repeat(review.rating)}
                        </span>
                        {review.is_featured && (
                          <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--admin-accent-bg)', color: 'var(--admin-accent)' }}>
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-sm mt-1" style={{ color: 'var(--admin-text-secondary)' }}>{review.review_text}</p>
                      <p className="text-xs mt-2" style={{ color: 'var(--admin-text-muted)' }}>{review.review_date}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(review)}
                        className="p-2 rounded-lg transition"
                        style={{ color: 'var(--admin-accent)' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--admin-accent-bg)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="p-2 rounded-lg transition"
                        style={{ color: 'var(--admin-danger)' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--admin-danger-bg)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
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
                      "{reviews[0].review_text}"
                    </blockquote>

                    <div className="text-amber-500 uppercase tracking-widest text-sm font-semibold">
                      {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)} Sterne bei {reviews.length} Google-Rezensionen
                    </div>
                  </>
                )}

                {reviews.length > 1 && (
                  <div className="mt-12 grid md:grid-cols-3 gap-6 text-left">
                    {reviews.slice(1).map((review) => (
                      <div key={review.id} className="bg-white/10 p-6 rounded-lg">
                        <div className="flex mb-3">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="fill-amber-500 text-amber-500" size={16} />
                          ))}
                        </div>
                        <p className="text-slate-300 italic mb-3">"{review.review_text}"</p>
                        <p className="text-slate-400 text-sm">- {review.author_name}</p>
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
