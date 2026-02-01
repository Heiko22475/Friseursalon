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
    show_in_menu: true,
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
          show_in_menu: editForm.show_in_menu !== false,
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
        show_in_menu: true,
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
      show_in_menu: page.show_in_menu,
      display_order: page.display_order,
      meta_description: page.meta_description || '',
      blocks: page.blocks,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const page = pages.find(p => p.id === id);
    if (page?.is_home) {
      setMessage('Die Hauptseite kann nicht gelöscht werden!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
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

  const toggleShowInMenu = async (page: Page) => {
    if (page.is_home) return; // Homepage always in menu
    const updatedPages = pages.map(p =>
      p.id === page.id ? { ...p, show_in_menu: !p.show_in_menu } : p
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
                show_in_menu: true,
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
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr 80px 100px 80px auto',
                gap: '0',
                alignItems: 'center'
              }}
            >
              {/* Header Row */}
              <div style={{ padding: '8px 4px', borderBottom: '2px solid #e5e7eb', fontWeight: 600, fontSize: '14px', color: '#6b7280' }}></div>
              <div style={{ padding: '8px 4px', borderBottom: '2px solid #e5e7eb', fontWeight: 600, fontSize: '14px', color: '#6b7280' }}>Seite</div>
              <div style={{ padding: '8px 4px', borderBottom: '2px solid #e5e7eb', fontWeight: 600, fontSize: '14px', color: '#6b7280', textAlign: 'center' }}>Im Menü</div>
              <div style={{ padding: '8px 4px', borderBottom: '2px solid #e5e7eb', fontWeight: 600, fontSize: '14px', color: '#6b7280', textAlign: 'center' }}>Status</div>
              <div style={{ padding: '8px 4px', borderBottom: '2px solid #e5e7eb', fontWeight: 600, fontSize: '14px', color: '#6b7280', textAlign: 'center' }}>Blöcke</div>
              <div style={{ padding: '8px 4px', borderBottom: '2px solid #e5e7eb', fontWeight: 600, fontSize: '14px', color: '#6b7280' }}>Aktionen</div>
              
              {/* Data Rows */}
              {regularPages.map((page, index) => (
                <React.Fragment key={page.id}>
                  {/* Home Icon */}
                  <div style={{ padding: '12px 4px', backgroundColor: index % 2 === 0 ? '#f9fafb' : '#ffffff', display: 'flex', justifyContent: 'center' }}>
                    {page.is_home && <Home size={20} className="text-rose-600" aria-label="Homepage" />}
                  </div>

                  {/* Page Info */}
                  <div style={{ padding: '12px 4px', backgroundColor: index % 2 === 0 ? '#f9fafb' : '#ffffff' }}>
                    <div style={{ fontWeight: 600, fontSize: '16px' }}>{page.title}</div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>/{page.slug}</div>
                  </div>

                  {/* Menu Checkbox */}
                  <div style={{ padding: '12px 4px', backgroundColor: index % 2 === 0 ? '#f9fafb' : '#ffffff', display: 'flex', justifyContent: 'center' }}>
                    <input
                      type="checkbox"
                      checked={page.show_in_menu || page.is_home}
                      onChange={() => toggleShowInMenu(page)}
                      disabled={page.is_home}
                      style={{ width: '20px', height: '20px', cursor: page.is_home ? 'not-allowed' : 'pointer', accentColor: '#e11d48' }}
                      title={page.is_home ? 'Homepage ist immer im Menü' : 'Im Menü anzeigen'}
                    />
                  </div>

                  {/* Published Status */}
                  <div style={{ padding: '12px 4px', backgroundColor: index % 2 === 0 ? '#f9fafb' : '#ffffff', display: 'flex', justifyContent: 'center' }}>
                    <button
                      onClick={() => togglePublished(page)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                        padding: '4px 12px', borderRadius: '9999px', fontSize: '13px', fontWeight: 500,
                        border: 'none', cursor: 'pointer',
                        backgroundColor: page.is_published ? '#dcfce7' : '#e5e7eb',
                        color: page.is_published ? '#166534' : '#4b5563'
                      }}
                    >
                      <Eye size={14} />
                      {page.is_published ? 'Live' : 'Entwurf'}
                    </button>
                  </div>

                  {/* Block Count */}
                  <div style={{ padding: '12px 4px', backgroundColor: index % 2 === 0 ? '#f9fafb' : '#ffffff', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', color: '#374151' }}>
                    <Layers size={16} />
                    <span style={{ fontWeight: 500 }}>{page.blocks?.length || 0}</span>
                  </div>

                  {/* Actions */}
                  <div style={{ padding: '12px 4px', backgroundColor: index % 2 === 0 ? '#f9fafb' : '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => movePageUp(index)} disabled={index === 0} style={{ padding: '4px', color: index === 0 ? '#d1d5db' : '#4b5563', background: 'none', border: 'none', cursor: index === 0 ? 'default' : 'pointer' }} title="Nach oben">
                      <ChevronUp size={20} />
                    </button>
                    <button onClick={() => movePageDown(index)} disabled={index === regularPages.length - 1} style={{ padding: '4px', color: index === regularPages.length - 1 ? '#d1d5db' : '#4b5563', background: 'none', border: 'none', cursor: index === regularPages.length - 1 ? 'default' : 'pointer' }} title="Nach unten">
                      <ChevronDown size={20} />
                    </button>
                    {!page.is_home && (
                      <button onClick={() => setAsHome(page)} style={{ padding: '4px 12px', fontSize: '13px', backgroundColor: '#ffe4e6', color: '#be123c', borderRadius: '4px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        Als Home
                      </button>
                    )}
                    <button onClick={() => navigate(`/admin/blocks/${page.id}`)} style={{ padding: '4px 12px', fontSize: '13px', backgroundColor: '#dbeafe', color: '#1d4ed8', borderRadius: '4px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      Blöcke
                    </button>
                    <button onClick={() => handleEdit(page)} style={{ padding: '4px 12px', fontSize: '13px', backgroundColor: '#e5e7eb', color: '#374151', borderRadius: '4px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      Bearbeiten
                    </button>
                    {!page.is_home && (
                      <button onClick={() => handleDelete(page.id)} style={{ padding: '4px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }} title="Löschen">
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </React.Fragment>
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
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Seite bearbeiten' : 'Neue Seite'}>
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
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editForm.is_published !== false}
                  onChange={(e) => setEditForm({ ...editForm, is_published: e.target.checked })}
                  className="rounded"
                />
                <label className="text-sm">Veröffentlicht</label>
              </div>
              {!editForm.is_home ? (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.show_in_menu !== false}
                    onChange={(e) => setEditForm({ ...editForm, show_in_menu: e.target.checked })}
                    className="rounded"
                  />
                  <label className="text-sm">Im Menü anzeigen</label>
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">Die Hauptseite wird immer im Menü angezeigt</p>
              )}
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
