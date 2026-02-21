import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebsite } from '../../contexts/WebsiteContext';
import { Save, Plus, Trash2, ChevronUp, ChevronDown, Eye, Home, Layers } from 'lucide-react';
import { Modal } from './Modal';
import { AdminHeader } from './AdminHeader';
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

      // Check reserved slugs
      const { isReservedSlug, getReservedSlugError } = await import('../../utils/reservedSlugs');
      if (isReservedSlug(editForm.slug)) {
        setMessage(getReservedSlugError(editForm.slug));
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--admin-accent)' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <AdminHeader
          title="Seiten verwalten"
          icon={Layers}
          actions={
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
              className="flex items-center gap-2 text-white px-4 py-2 rounded-lg"
              style={{ backgroundColor: 'var(--admin-accent)' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <Plus size={20} />
              Neue Seite
            </button>
          }
        />

        {message && (
          <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--admin-success-bg)', color: 'var(--admin-success)' }}>
            {message}
          </div>
        )}

        {/* Regular Pages */}
        <div className="rounded-lg p-6 mb-6" style={{ backgroundColor: 'var(--admin-bg-card)' }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--admin-text-heading)' }}>Ihre Seiten</h2>
          {regularPages.length === 0 ? (
            <p style={{ color: 'var(--admin-text-muted)' }}>Keine Seiten vorhanden</p>
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
              <div style={{ padding: '8px 4px', borderBottom: '2px solid var(--admin-border)', fontWeight: 600, fontSize: '14px', color: 'var(--admin-text-muted)' }}></div>
              <div style={{ padding: '8px 4px', borderBottom: '2px solid var(--admin-border)', fontWeight: 600, fontSize: '14px', color: 'var(--admin-text-muted)' }}>Seite</div>
              <div style={{ padding: '8px 4px', borderBottom: '2px solid var(--admin-border)', fontWeight: 600, fontSize: '14px', color: 'var(--admin-text-muted)', textAlign: 'center' }}>Im Menü</div>
              <div style={{ padding: '8px 4px', borderBottom: '2px solid var(--admin-border)', fontWeight: 600, fontSize: '14px', color: 'var(--admin-text-muted)', textAlign: 'center' }}>Status</div>
              <div style={{ padding: '8px 4px', borderBottom: '2px solid var(--admin-border)', fontWeight: 600, fontSize: '14px', color: 'var(--admin-text-muted)', textAlign: 'center' }}>Blöcke</div>
              <div style={{ padding: '8px 4px', borderBottom: '2px solid var(--admin-border)', fontWeight: 600, fontSize: '14px', color: 'var(--admin-text-muted)' }}>Aktionen</div>
              
              {/* Data Rows */}
              {regularPages.map((page, index) => (
                <React.Fragment key={page.id}>
                  {/* Home Icon */}
                  <div style={{ padding: '12px 4px', backgroundColor: index % 2 === 0 ? 'var(--admin-bg-surface)' : 'transparent', display: 'flex', justifyContent: 'center' }}>
                    {page.is_home && <Home size={20} style={{ color: 'var(--admin-accent)' }} aria-label="Homepage" />}
                  </div>

                  {/* Page Info */}
                  <div style={{ padding: '12px 4px', backgroundColor: index % 2 === 0 ? 'var(--admin-bg-surface)' : 'transparent' }}>
                    <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--admin-text-heading)' }}>{page.title}</div>
                    <div style={{ fontSize: '13px', color: 'var(--admin-text-muted)' }}>/{page.slug}</div>
                  </div>

                  {/* Menu Checkbox */}
                  <div style={{ padding: '12px 4px', backgroundColor: index % 2 === 0 ? 'var(--admin-bg-surface)' : 'transparent', display: 'flex', justifyContent: 'center' }}>
                    <input
                      type="checkbox"
                      checked={page.show_in_menu || page.is_home}
                      onChange={() => toggleShowInMenu(page)}
                      disabled={page.is_home}
                      style={{ width: '20px', height: '20px', cursor: page.is_home ? 'not-allowed' : 'pointer', accentColor: 'var(--admin-accent)' }}
                      title={page.is_home ? 'Homepage ist immer im Menü' : 'Im Menü anzeigen'}
                    />
                  </div>

                  {/* Published Status */}
                  <div style={{ padding: '12px 4px', backgroundColor: index % 2 === 0 ? 'var(--admin-bg-surface)' : 'transparent', display: 'flex', justifyContent: 'center' }}>
                    <button
                      onClick={() => togglePublished(page)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                        padding: '4px 12px', borderRadius: '9999px', fontSize: '13px', fontWeight: 500,
                        border: 'none', cursor: 'pointer',
                        backgroundColor: page.is_published ? 'var(--admin-success-bg)' : 'var(--admin-bg-surface)',
                        color: page.is_published ? 'var(--admin-success)' : 'var(--admin-text-secondary)'
                      }}
                    >
                      <Eye size={14} />
                      {page.is_published ? 'Live' : 'Entwurf'}
                    </button>
                  </div>

                  {/* Block Count */}
                  <div style={{ padding: '12px 4px', backgroundColor: index % 2 === 0 ? 'var(--admin-bg-surface)' : 'transparent', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', color: 'var(--admin-text)' }}>
                    <Layers size={16} />
                    <span style={{ fontWeight: 500 }}>{page.blocks?.length || 0}</span>
                  </div>

                  {/* Actions */}
                  <div style={{ padding: '12px 4px', backgroundColor: index % 2 === 0 ? 'var(--admin-bg-surface)' : 'transparent', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => movePageUp(index)} disabled={index === 0} style={{ padding: '4px', color: index === 0 ? 'var(--admin-text-faint)' : 'var(--admin-text-secondary)', background: 'none', border: 'none', cursor: index === 0 ? 'default' : 'pointer' }} title="Nach oben">
                      <ChevronUp size={20} />
                    </button>
                    <button onClick={() => movePageDown(index)} disabled={index === regularPages.length - 1} style={{ padding: '4px', color: index === regularPages.length - 1 ? 'var(--admin-text-faint)' : 'var(--admin-text-secondary)', background: 'none', border: 'none', cursor: index === regularPages.length - 1 ? 'default' : 'pointer' }} title="Nach unten">
                      <ChevronDown size={20} />
                    </button>
                    {!page.is_home && (
                      <button onClick={() => setAsHome(page)} style={{ padding: '4px 12px', fontSize: '13px', backgroundColor: 'var(--admin-accent-bg)', color: 'var(--admin-accent)', borderRadius: '4px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        Als Home
                      </button>
                    )}
                    <button onClick={() => navigate(`/admin/blocks/${page.id}`)} style={{ padding: '4px 12px', fontSize: '13px', backgroundColor: 'var(--admin-accent-bg)', color: 'var(--admin-accent)', borderRadius: '4px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      Blöcke
                    </button>
                    <button onClick={() => handleEdit(page)} style={{ padding: '4px 12px', fontSize: '13px', backgroundColor: 'var(--admin-bg-surface)', color: 'var(--admin-text)', borderRadius: '4px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      Bearbeiten
                    </button>
                    {!page.is_home && (
                      <button onClick={() => handleDelete(page.id)} style={{ padding: '4px', color: 'var(--admin-danger)', background: 'none', border: 'none', cursor: 'pointer' }} title="Löschen">
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
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--admin-bg-card)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--admin-text-heading)' }}>Rechtliche Seiten</h2>
            <div className="space-y-2">
              {legalPages.map((page) => (
                <div
                  key={page.id}
                  className="flex items-center gap-4 p-4 rounded-lg"
                  style={{ backgroundColor: 'var(--admin-bg-surface)' }}
                >
                  <div className="flex-1">
                    <div className="font-semibold" style={{ color: 'var(--admin-text-heading)' }}>{page.title}</div>
                    <div className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>/{page.slug}</div>
                  </div>
                  <button
                    onClick={() => navigate(`/admin/blocks/${page.id}`)}
                    className="px-3 py-1 text-sm rounded"
                    style={{ backgroundColor: 'var(--admin-accent-bg)', color: 'var(--admin-accent)' }}
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
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>Titel</label>
              <input
                type="text"
                value={editForm.title || ''}
                onChange={(e) => {
                  setEditForm({ ...editForm, title: e.target.value });
                  if (!editingId) {
                    setEditForm({ ...editForm, title: e.target.value, slug: normalizeSlug(e.target.value) });
                  }
                }}
                className="w-full rounded-lg px-3 py-2"
                style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>URL-Slug</label>
              <input
                type="text"
                value={editForm.slug || ''}
                onChange={(e) => setEditForm({ ...editForm, slug: normalizeSlug(e.target.value) })}
                className="w-full rounded-lg px-3 py-2"
                style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>Meta Description</label>
              <textarea
                value={editForm.meta_description || ''}
                onChange={(e) => setEditForm({ ...editForm, meta_description: e.target.value })}
                className="w-full rounded-lg px-3 py-2"
                rows={3}
                style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editForm.is_published !== false}
                  onChange={(e) => setEditForm({ ...editForm, is_published: e.target.checked })}
                  className="rounded"
                  style={{ accentColor: 'var(--admin-accent)' }}
                />
                <label className="text-sm" style={{ color: 'var(--admin-text)' }}>Veröffentlicht</label>
              </div>
              {!editForm.is_home ? (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.show_in_menu !== false}
                    onChange={(e) => setEditForm({ ...editForm, show_in_menu: e.target.checked })}
                    className="rounded"
                    style={{ accentColor: 'var(--admin-accent)' }}
                  />
                  <label className="text-sm" style={{ color: 'var(--admin-text)' }}>Im Menü anzeigen</label>
                </div>
              ) : (
                <p className="text-xs italic" style={{ color: 'var(--admin-text-muted)' }}>Die Hauptseite wird immer im Menü angezeigt</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 text-white px-4 py-2 rounded-lg"
                style={{ backgroundColor: 'var(--admin-accent)' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                <Save size={20} />
                Speichern
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg"
                style={{ border: '1px solid var(--admin-border)', color: 'var(--admin-text)', backgroundColor: 'var(--admin-bg-card)' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--admin-bg-surface)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--admin-bg-card)')}
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
