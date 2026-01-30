import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Eye, ArrowLeft, Save, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { Modal } from './Modal';
import { MediaLibrary } from './MediaLibrary';
import { BackgroundColorPicker } from './BackgroundColorPicker';
import { useBlockBackgroundColor } from '../../hooks/useBlockBackgroundColor';
import { getAdaptiveTextColors } from '../../utils/color-utils';
import { useWebsite } from '../../contexts/WebsiteContext';
import type { GalleryImage } from '../../contexts/WebsiteContext';

export const GalleryEditorNew: React.FC = () => {
  const navigate = useNavigate();
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Galerie</h1>

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

          {/* Add New Image */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Neues Bild hinzufügen</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bild URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => setIsMediaLibraryOpen(true)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300 flex items-center gap-2"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Mediathek
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Wählen Sie ein Bild aus der Mediathek oder geben Sie eine externe URL ein.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caption (optional)
                </label>
                <input
                  type="text"
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="Bildbeschreibung..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleAddImage}
                disabled={saving}
                className="flex items-center gap-2 bg-rose-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-rose-600 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Hinzufügen...' : 'Bild hinzufügen'}
              </button>
            </div>
          </div>

          {/* Images Grid */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Galerie Bilder ({images.length})</h2>
            {images.length === 0 ? (
              <p className="text-gray-500">Noch keine Bilder vorhanden.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((image) => (
                  <div key={image.id} className="bg-gray-50 rounded-lg overflow-hidden">
                    <div className="aspect-video bg-gray-200 relative">
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
                        className="absolute top-2 right-2 bg-white p-2 rounded-lg shadow hover:bg-gray-100 transition"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-600" />
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
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateCaption(image.id)}
                          disabled={saving}
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition disabled:opacity-50"
                        >
                          <Save className="w-3 h-3" />
                          Speichern
                        </button>
                        <button
                          onClick={() => handleDelete(image.id)}
                          disabled={saving}
                          className="flex items-center justify-center gap-2 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
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
