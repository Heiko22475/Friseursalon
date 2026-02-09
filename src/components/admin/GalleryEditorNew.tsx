import React, { useState } from 'react';
import { Trash2, Eye, Save, ExternalLink, Image as ImageIcon, Images } from 'lucide-react';
import { AdminHeader } from './AdminHeader';
import { Modal } from './Modal';
import { MediaLibrary } from './MediaLibrary';
import { BackgroundColorPicker } from './BackgroundColorPicker';
import { useBlockBackgroundColor } from '../../hooks/useBlockBackgroundColor';
import { getAdaptiveTextColors } from '../../utils/color-utils';
import { useWebsite } from '../../contexts/WebsiteContext';
import type { GalleryImage } from '../../contexts/WebsiteContext';

export const GalleryEditorNew: React.FC = () => {
  const { website, loading, updateGallery } = useWebsite();
  const { backgroundColor, setBackgroundColor } = useBlockBackgroundColor({ 
    blockType: 'gallery', 
    instanceId: 1 
  });
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [editingCaptions, setEditingCaptions] = useState<Record<string, string>>({});
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);

  const images = website?.gallery?.images || [];

  // Initialize editing captions
  React.useEffect(() => {
    const captions: Record<string, string> = {};
    images.forEach(img => {
      captions[img.id] = img.caption || '';
    });
    setEditingCaptions(captions);
  }, [images]);

  const handleAddImage = async () => {
    if (!newImageUrl.trim()) {
      setMessage('Bitte geben Sie eine Bild-URL ein!');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const newImage: GalleryImage = {
        id: crypto.randomUUID(),
        url: newImageUrl,
        alt_text: newCaption || '',
        caption: newCaption || '',
        display_order: images.length,
      };

      await updateGallery({
        images: [...images, newImage],
      });

      setNewImageUrl('');
      setNewCaption('');
      setMessage('Bild erfolgreich hinzugefügt!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
      setMessage('Fehler beim Hinzufügen!');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCaption = async (imageId: string) => {
    setSaving(true);
    setMessage('');

    try {
      const updatedImages = images.map(img =>
        img.id === imageId 
          ? { ...img, caption: editingCaptions[imageId] || '', alt_text: editingCaptions[imageId] || '' }
          : img
      );

      await updateGallery({ images: updatedImages });
      
      setMessage('Caption aktualisiert!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error);
      setMessage('Fehler beim Aktualisieren!');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('Möchten Sie dieses Bild wirklich löschen?')) return;

    setSaving(true);
    setMessage('');

    try {
      const updatedImages = images
        .filter(img => img.id !== imageId)
        .map((img, index) => ({ ...img, display_order: index }));

      await updateGallery({ images: updatedImages });
      
      setMessage('Bild erfolgreich gelöscht!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      setMessage('Fehler beim Löschen!');
    } finally {
      setSaving(false);
    }
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
        title="Galerie verwalten"
        icon={Images}
        actions={
          <div className="flex items-center gap-2">
            <BackgroundColorPicker
              value={backgroundColor}
              onChange={setBackgroundColor}
            />
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-2 text-white px-4 py-2 rounded-lg transition font-semibold"
              style={{ backgroundColor: 'var(--admin-success, #22c55e)' }}
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
              style={message.includes('Fehler')
                ? { backgroundColor: 'var(--admin-danger-bg)', color: 'var(--admin-danger)' }
                : { backgroundColor: 'var(--admin-success-bg)', color: 'var(--admin-success)' }
              }
            >
              {message}
            </div>
          )}

          {/* Add New Image */}
          <div className="p-6 rounded-lg mb-8" style={{ backgroundColor: 'var(--admin-bg-secondary)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--admin-text-heading)' }}>Neues Bild hinzufügen</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text)' }}>
                  Bild URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-4 py-2 rounded-lg focus:ring-2 focus:outline-none"
                    style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                  />
                  <button
                    onClick={() => setIsMediaLibraryOpen(true)}
                    className="px-4 py-2 rounded-lg flex items-center gap-2 transition"
                    style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    <ImageIcon className="w-4 h-4" />
                    Mediathek
                  </button>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--admin-text-muted)' }}>
                  Wählen Sie ein Bild aus der Mediathek oder geben Sie eine externe URL ein.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text)' }}>
                  Caption (optional)
                </label>
                <input
                  type="text"
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="Bildbeschreibung..."
                  className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none"
                  style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                />
              </div>
              <button
                onClick={handleAddImage}
                disabled={saving}
                className="flex items-center gap-2 text-white px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                style={{ backgroundColor: 'var(--admin-accent)' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                <Save className="w-4 h-4" />
                {saving ? 'Hinzufügen...' : 'Bild hinzufügen'}
              </button>
            </div>
          </div>

          {/* Images Grid */}
          <div>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--admin-text-heading)' }}>Galerie Bilder ({images.length})</h2>
            {images.length === 0 ? (
              <p style={{ color: 'var(--admin-text-muted)' }}>Noch keine Bilder vorhanden.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((image) => (
                  <div key={image.id} className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--admin-bg-secondary)' }}>
                    <div className="aspect-video relative" style={{ backgroundColor: 'var(--admin-border)' }}>
                      <img
                        src={image.url}
                        alt={image.alt_text || 'Gallery image'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EBild nicht gefunden%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <a
                        href={image.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-2 right-2 p-2 rounded-lg transition"
                        style={{ backgroundColor: 'var(--admin-bg-card)' }}
                      >
                        <ExternalLink className="w-4 h-4" style={{ color: 'var(--admin-text-secondary)' }} />
                      </a>
                    </div>
                    <div className="p-4">
                      <div className="mb-2">
                        <input
                          type="text"
                          value={editingCaptions[image.id] || ''}
                          onChange={(e) =>
                            setEditingCaptions({
                              ...editingCaptions,
                              [image.id]: e.target.value,
                            })
                          }
                          placeholder="Caption..."
                          className="w-full px-3 py-2 text-sm rounded-lg focus:ring-2 focus:outline-none"
                          style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateCaption(image.id)}
                          disabled={saving}
                          className="flex-1 flex items-center justify-center gap-2 text-white px-3 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                          style={{ backgroundColor: 'var(--admin-accent)' }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                        >
                          <Save className="w-3 h-3" />
                          Speichern
                        </button>
                        <button
                          onClick={() => handleDelete(image.id)}
                          disabled={saving}
                          className="flex items-center justify-center gap-2 text-white px-3 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                          style={{ backgroundColor: 'var(--admin-danger)' }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-xs mt-2" style={{ color: 'var(--admin-text-muted)' }}>
                        Position: {image.display_order}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Media Library Modal */}
      <Modal
        isOpen={isMediaLibraryOpen}
        onClose={() => setIsMediaLibraryOpen(false)}
        title="Bilder aus Mediathek wählen"
        maxWidth="max-w-5xl"
      >
        <div className="h-[70vh] flex flex-col">
            <MediaLibrary 
                mode="select"
                onSelect={(files: any[]) => {
                    if (files.length > 0) {
                        // If one file selected and input is empty, fill input
                        // If multiple selected, or user intent is clear, we could add immediately.
                        // For now, let's keep the single file flow if 1 file, or add first.
                        // BUT better to support multi-add.
                        // Let's assume for now focused on single select for the input field.
                         setNewImageUrl(files[0].file_url);
                    }
                    setIsMediaLibraryOpen(false);
                }}
                onCancel={() => setIsMediaLibraryOpen(false)}
            />
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Galerie Vorschau"
        maxWidth="w-[1200px]"
      >
        {(() => {
          const customProps = backgroundColor ? getAdaptiveTextColors(backgroundColor) : {};
          
          return (
            <div 
              className="py-12 px-4"
              style={{ 
                backgroundColor: backgroundColor || '#f8fafc',
                ...customProps as React.CSSProperties
              }}
            >
              <div className="max-w-6xl mx-auto">
                <h2 
                  className="text-3xl font-bold text-center mb-8"
                  style={{ color: 'var(--text-primary, #1e293b)' }}
                >
                  Unsere Galerie
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image) => (
                    <div 
                      key={image.id}
                      className="aspect-square bg-gray-200 rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer"
                    >
                      <img
                        src={image.url}
                        alt={image.alt_text || 'Gallery'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};
