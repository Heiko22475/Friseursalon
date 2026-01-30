import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebsite } from '../../contexts/WebsiteContext';
import { ArrowLeft, Save, Plus, Trash2, ChevronUp, ChevronDown, Eye, Home, Layers } from 'lucide-react';
import { Modal } from './Modal';
import type { Page } from '../../contexts/WebsiteContext';

export const PageManagerNew: React.FC = () => {
  const navigate = useNavigate();
  const { website, updatePages, addPage, deletePage, loading } = useWebsite();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Page>>({
    slug: '',
    title: '',
    is_home: false,
    is_published: true,
    display_order: 0,
    meta_description: '',
    blocks: [],
  });
  const [message, setMessage] = useState('');

  const pages = website?.pages || [];
  const regularPages = pages.filter(p => p.slug !== 'imprint' && p.slug !== 'privacy' && p.slug !== 'terms');
  const legalPages = pages.filter(p => ['imprint', 'privacy', 'terms'].includes(p.slug));

  const normalizeSlug = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSave = async () => {
    try {
      if (!editForm.slug || !editForm.title) {
        setMessage('Slug und Titel sind erforderlich!');
        return;
      }

      if (editingId) {
        // Update existing page
        const updatedPages = pages.map(p => 
          p.id === editingId ? { ...p, ...editForm } : p
        );
        await updatePages(updatedPages as Page[]);
      } else {
        // Add new page
        const newPage: Omit<Page, 'id'> = {
          slug: editForm.slug!,
          title: editForm.title!,
          is_home: editForm.is_home || false,
          is_published: editForm.is_published !== false,
          meta_description: editForm.meta_description || null,
          seo_title: editForm.seo_title || null,
          display_order: editForm.display_order || pages.length,
          blocks: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await addPage(newPage);
      }

      setMessage('Erfolgreich gespeichert!');
      setTimeout(() => setMessage(''), 3000);
      setIsModalOpen(false);
      setEditingId(null);
      setEditForm({
        slug: '',
        title: '',
        is_home: false,
        is_published: true,
        display_order: 0,
        meta_description: '',
        blocks: [],
      });
    } catch (error) {
      console.error('Error saving page:', error);
      setMessage('Fehler beim Speichern!');
    }
  };

  const handleEdit = (page: Page) => {
    setEditingId(page.id);
    setEditForm({
      slug: page.slug,
      title: page.title,
      is_home: page.is_home,
      is_published: page.is_published,
      display_order: page.display_order,
      meta_description: page.meta_description || '',
      blocks: page.blocks,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Seite wirklich löschen?')) return;
    try {
      await deletePage(id);
      setMessage('Seite gelöscht!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting page:', error);
      setMessage('Fehler beim Löschen!');
    }
  };

  const movePageUp = async (index: number) => {
    if (index === 0) return;
    const newPages = [...regularPages];
    [newPages[index - 1], newPages[index]] = [newPages[index], newPages[index - 1]];
    
    // Update display_order
    const updatedPages = newPages.map((p, i) => ({ ...p, display_order: i }));
    await updatePages([...updatedPages, ...legalPages] as Page[]);
  };

  const movePageDown = async (index: number) => {
    if (index === regularPages.length - 1) return;
    const newPages = [...regularPages];
    [newPages[index], newPages[index + 1]] = [newPages[index + 1], newPages[index]];
    
    // Update display_order
    const updatedPages = newPages.map((p, i) => ({ ...p, display_order: i }));
    await updatePages([...updatedPages, ...legalPages] as Page[]);
  };

  const togglePublished = async (page: Page) => {
    const updatedPages = pages.map(p =>
      p.id === page.id ? { ...p, is_published: !p.is_published } : p
    );
    await updatePages(updatedPages as Page[]);
  };

  const setAsHome = async (page: Page) => {
    const updatedPages = pages.map(p => ({
      ...p,
      is_home: p.id === page.id,
    }));
    await updatePages(updatedPages as Page[]);
    setMessage('Homepage gesetzt!');
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              Zurück
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Seiten verwalten</h1>
          </div>
          <button
            onClick={() => {
              setEditingId(null);
              setEditForm({
                slug: '',
                title: '',
                is_home: false,
                is_published: true,
                display_order: regularPages.length,
                meta_description: '',
                blocks: [],
              });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700"
          >
            <Plus size={20} />
            Neue Seite
          </button>
        </div>

        {message && (
          <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">
            {message}
          </div>
        )}

        {/* Regular Pages */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Ihre Seiten</h2>
          {regularPages.length === 0 ? (
            <p className="text-gray-500">Keine Seiten vorhanden</p>
          ) : (
            <div className="space-y-2">
              {regularPages.map((page, index) => (
                <div
                  key={page.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  {/* Home Badge */}
                  {page.is_home && (
                    <Home size={20} className="text-rose-600" title="Homepage" />
                  )}

                  {/* Page Info */}
                  <div className="flex-1">
                    <div className="font-semibold">{page.title}</div>
                    <div className="text-sm text-gray-500">/{page.slug}</div>
                  </div>

                  {/* Published Badge */}
                  <button
                    onClick={() => togglePublished(page)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                      page.is_published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    <Eye size={16} />
                    {page.is_published ? 'Veröffentlicht' : 'Entwurf'}
                  </button>

                  {/* Block Count */}
                  <div className="flex items-center gap-1 text-gray-600">
                    <Layers size={16} />
                    <span className="text-sm">{page.blocks?.length || 0} Blöcke</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => movePageUp(index)}
                      disabled={index === 0}
                      className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                    >
                      <ChevronUp size={20} />
                    </button>
                    <button
                      onClick={() => movePageDown(index)}
                      disabled={index === regularPages.length - 1}
                      className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                    >
                      <ChevronDown size={20} />
                    </button>
                    {!page.is_home && (
                      <button
                        onClick={() => setAsHome(page)}
                        className="px-3 py-1 text-sm bg-rose-100 text-rose-700 rounded hover:bg-rose-200"
                      >
                        Als Home
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/admin/blocks/${page.id}`)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Blöcke
                    </button>
                    <button
                      onClick={() => handleEdit(page)}
                      className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      Bearbeiten
                    </button>
                    <button
                      onClick={() => handleDelete(page.id)}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legal Pages */}
        {legalPages.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Rechtliche Seiten</h2>
            <div className="space-y-2">
              {legalPages.map((page) => (
                <div
                  key={page.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-semibold">{page.title}</div>
                    <div className="text-sm text-gray-500">/{page.slug}</div>
                  </div>
                  <button
                    onClick={() => navigate(`/admin/blocks/${page.id}`)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Blöcke
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h2 className="text-2xl font-bold mb-4">
            {editingId ? 'Seite bearbeiten' : 'Neue Seite'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Titel</label>
              <input
                type="text"
                value={editForm.title || ''}
                onChange={(e) => {
                  setEditForm({ ...editForm, title: e.target.value });
                  if (!editingId) {
                    setEditForm({ ...editForm, title: e.target.value, slug: normalizeSlug(e.target.value) });
                  }
                }}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL-Slug</label>
              <input
                type="text"
                value={editForm.slug || ''}
                onChange={(e) => setEditForm({ ...editForm, slug: normalizeSlug(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Meta Description</label>
              <textarea
                value={editForm.meta_description || ''}
                onChange={(e) => setEditForm({ ...editForm, meta_description: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editForm.is_published !== false}
                onChange={(e) => setEditForm({ ...editForm, is_published: e.target.checked })}
                className="rounded"
              />
              <label className="text-sm">Veröffentlicht</label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700"
              >
                <Save size={20} />
                Speichern
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
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
