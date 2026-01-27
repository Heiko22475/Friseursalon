import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save, Plus, Trash2, Edit2, ChevronUp, ChevronDown, Eye, Home } from 'lucide-react';
import { Modal } from './Modal';

interface Page {
  id: string;
  slug: string;
  title: string;
  is_home: boolean;
  is_enabled: boolean;
  display_order: number;
  meta_description: string | null;
}

export const PageManager: React.FC = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Page>>({
    slug: '',
    title: '',
    is_home: false,
    is_enabled: true,
    display_order: 0,
    meta_description: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPages();
  }, []);

  const normalizeSlug = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  const loadPages = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error loading pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!editForm.slug || !editForm.title) {
        setMessage('Slug und Titel sind erforderlich!');
        return;
      }

      if (editingId) {
        const { error } = await supabase
          .from('pages')
          .update(editForm)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('pages').insert([editForm]);
        if (error) throw error;
      }

      setMessage('Erfolgreich gespeichert!');
      setTimeout(() => setMessage(''), 3000);
      setIsModalOpen(false);
      setEditingId(null);
      setEditForm({
        slug: '',
        title: '',
        is_home: false,
        is_enabled: true,
        display_order: 0,
        meta_description: '',
      });
      loadPages();
    } catch (error: any) {
      console.error('Error saving:', error);
      setMessage(error.message || 'Fehler beim Speichern!');
    }
  };

  const handleEdit = (page: Page) => {
    setEditingId(page.id);
    setEditForm(page);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie diese Seite wirklich löschen?')) return;

    try {
      const { error } = await supabase.from('pages').delete().eq('id', id);
      if (error) throw error;

      setMessage('Erfolgreich gelöscht!');
      setTimeout(() => setMessage(''), 3000);
      loadPages();
    } catch (error) {
      console.error('Error deleting:', error);
      setMessage('Fehler beim Löschen!');
    }
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;

    const newPages = [...pages];
    [newPages[index - 1], newPages[index]] = [newPages[index], newPages[index - 1]];

    try {
      await Promise.all([
        supabase
          .from('pages')
          .update({ display_order: index - 1 })
          .eq('id', newPages[index - 1].id),
        supabase
          .from('pages')
          .update({ display_order: index })
          .eq('id', newPages[index].id),
      ]);

      loadPages();
    } catch (error) {
      console.error('Error moving:', error);
      setMessage('Fehler beim Verschieben!');
    }
  };

  const moveDown = async (index: number) => {
    if (index === pages.length - 1) return;

    const newPages = [...pages];
    [newPages[index], newPages[index + 1]] = [newPages[index + 1], newPages[index]];

    try {
      await Promise.all([
        supabase
          .from('pages')
          .update({ display_order: index })
          .eq('id', newPages[index].id),
        supabase
          .from('pages')
          .update({ display_order: index + 1 })
          .eq('id', newPages[index + 1].id),
      ]);

      loadPages();
    } catch (error) {
      console.error('Error moving:', error);
      setMessage('Fehler beim Verschieben!');
    }
  };

  const toggleEnabled = async (page: Page) => {
    try {
      const { error } = await supabase
        .from('pages')
        .update({ is_enabled: !page.is_enabled })
        .eq('id', page.id);

      if (error) throw error;
      loadPages();
    } catch (error) {
      console.error('Error toggling:', error);
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-gray-600 hover:text-rose-500 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zum Dashboard
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Seiten-Verwaltung</h1>

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

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-rose-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-rose-600 transition mb-6"
          >
            <Plus className="w-5 h-5" />
            Neue Seite
          </button>

          {/* Pages List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Seiten</h2>
            {pages.length === 0 ? (
              <p className="text-gray-500">Noch keine Seiten vorhanden.</p>
            ) : (
              <div className="grid gap-4">
                {pages.map((page, index) => (
                  <div
                    key={page.id}
                    className={`flex items-start justify-between p-4 rounded-lg border-2 ${
                      page.is_enabled ? 'bg-gray-50 border-gray-200' : 'bg-gray-100 border-gray-300 opacity-60'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{page.title}</h3>
                        {page.is_home && (
                          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                            <Home className="w-3 h-3" />
                            Startseite
                          </span>
                        )}
                        {!page.is_enabled && (
                          <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
                            Deaktiviert
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Slug: /{page.slug}</p>
                      {page.meta_description && (
                        <p className="text-xs text-gray-500 mt-1">{page.meta_description}</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className={`p-2 rounded-lg transition ${
                          index === 0
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-600 hover:bg-gray-200'
                        }`}
                        title="Nach oben"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === pages.length - 1}
                        className={`p-2 rounded-lg transition ${
                          index === pages.length - 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-600 hover:bg-gray-200'
                        }`}
                        title="Nach unten"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleEnabled(page)}
                        className={`p-2 rounded-lg transition ${
                          page.is_enabled
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-200'
                        }`}
                        title={page.is_enabled ? 'Deaktivieren' : 'Aktivieren'}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/page-builder/${page.id}`)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                        title="Bausteine verwalten"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(page)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Bearbeiten"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(page.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Löschen"
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

        {/* Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingId(null);
            setEditForm({
              slug: '',
              title: '',
              is_home: false,
              is_enabled: true,
              display_order: 0,
              meta_description: '',
            });
          }}
          title={editingId ? 'Seite bearbeiten' : 'Neue Seite'}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Titel</label>
              <input
                type="text"
                value={editForm.title || ''}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug (URL-Teil)
              </label>
              <input
                type="text"
                value={editForm.slug || ''}
                onChange={(e) =>
                  setEditForm({ ...editForm, slug: normalizeSlug(e.target.value) })
                }
                placeholder="z.B. about-us"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL: /{editForm.slug || '...'}
                <br />
                <span className="text-gray-400">Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description (Optional)
              </label>
              <textarea
                value={editForm.meta_description || ''}
                onChange={(e) => setEditForm({ ...editForm, meta_description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_home"
                checked={editForm.is_home || false}
                onChange={(e) => setEditForm({ ...editForm, is_home: e.target.checked })}
                className="w-4 h-4 text-rose-500 rounded focus:ring-rose-500"
              />
              <label htmlFor="is_home" className="text-sm font-medium text-gray-700">
                Als Startseite festlegen
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_enabled"
                checked={editForm.is_enabled !== false}
                onChange={(e) => setEditForm({ ...editForm, is_enabled: e.target.checked })}
                className="w-4 h-4 text-rose-500 rounded focus:ring-rose-500"
              />
              <label htmlFor="is_enabled" className="text-sm font-medium text-gray-700">
                Seite aktiviert
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={handleSave}
                disabled={!editForm.slug || !editForm.title}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition ${
                  !editForm.slug || !editForm.title
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-rose-500 text-white hover:bg-rose-600'
                }`}
              >
                <Save className="w-4 h-4" />
                Speichern
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingId(null);
                }}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};
