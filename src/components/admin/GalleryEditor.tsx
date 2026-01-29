import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Upload, Trash2, Image as ImageIcon, Eye, ArrowLeft } from 'lucide-react';
import { Modal } from './Modal';
import { BackgroundColorPicker } from './BackgroundColorPicker';
import { useBlockBackgroundColor } from '../../hooks/useBlockBackgroundColor';
import { getAdaptiveTextColors } from '../../utils/color-utils';

interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
  display_order: number;
}

export default function GalleryEditor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const instanceId = parseInt(searchParams.get('instance') || '1');
  const { backgroundColor, setBackgroundColor } = useBlockBackgroundColor({ blockType: 'gallery', instanceId });
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [editingCaptions, setEditingCaptions] = useState<Record<string, string>>({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    loadImages();
  }, [instanceId]);

  const loadImages = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('gallery')
      .select('*')
      .eq('instance_id', instanceId)
      .order('display_order');

    if (data) {
      setImages(data);
      // Initialize editing captions
      const captions: Record<string, string> = {};
      data.forEach(img => {
        captions[img.id] = img.caption || '';
      });
      setEditingCaptions(captions);
    }
    setLoading(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    for (const file of Array.from(files)) {
      try {
        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(filePath, file);

        if (uploadError) {
          alert(`Upload error: ${uploadError.message}`);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('gallery')
          .getPublicUrl(filePath);

        // Save to database
        const nextOrder = images.length > 0 
          ? Math.max(...images.map(img => img.display_order)) + 1 
          : 0;

        const { error: dbError } = await supabase
          .from('gallery')
          .insert({
            image_url: urlData.publicUrl,
            caption: newCaption || null,
            display_order: nextOrder,
            instance_id: instanceId
          });

        if (dbError) {
          alert(`Database error: ${dbError.message}`);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Error uploading file');
      }
    }

    setUploading(false);
    setNewCaption('');
    loadImages();
    
    // Reset file input
    event.target.value = '';
  };

  const deleteImage = async (image: GalleryImage) => {
    if (!confirm(`Delete this image?`)) return;

    try {
      // Extract filename from URL
      const urlParts = image.image_url.split('/');
      const fileName = urlParts[urlParts.length - 1];

      // Delete from storage
      await supabase.storage
        .from('gallery')
        .remove([fileName]);

      // Delete from database
      const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', image.id);

      if (error) {
        alert(`Error: ${error.message}`);
      } else {
        loadImages();
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error deleting image');
    }
  };

  const updateCaption = async (id: string, caption: string) => {
    const { error } = await supabase
      .from('gallery')
      .update({ caption })
      .eq('id', id);

    if (error) {
      alert(`Error: ${error.message}`);
    }
    // Don't reload - just update local state
  };

  const handleCaptionChange = (id: string, value: string) => {
    setEditingCaptions(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleCaptionBlur = (id: string) => {
    const newCaption = editingCaptions[id];
    const originalImage = images.find(img => img.id === id);
    
    // Only update if changed
    if (originalImage && originalImage.caption !== newCaption) {
      updateCaption(id, newCaption);
      // Update local state
      setImages(prev => prev.map(img => 
        img.id === id ? { ...img, caption: newCaption } : img
      ));
    }
  };

  const handleCaptionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur(); // Trigger blur event
    }
  };

  const updateOrder = async (id: string, newOrder: number) => {
    const { error } = await supabase
      .from('gallery')
      .update({ display_order: newOrder })
      .eq('id', id);

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      // Update local state and reload to re-sort
      loadImages();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 text-gray-600 hover:text-rose-500 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück zum Dashboard
            </button>
            <div className="flex items-center gap-3">
              <BackgroundColorPicker
                value={backgroundColor}
                onChange={setBackgroundColor}
              />
              <button
                onClick={() => setIsPreviewOpen(true)}
                className="flex items-center gap-2 bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition"
              >
                <Eye className="w-5 h-5" />
                Vorschau
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Gallery Images{instanceId > 1 && ` (Instanz #${instanceId})`}
            </h2>
            <p className="text-slate-600">Upload and manage gallery images</p>
          </div>

      {/* Upload Section */}
      <div className="bg-slate-50 rounded-lg p-4 border-2 border-dashed border-slate-300">
        <div className="flex flex-col items-center space-y-3">
          <ImageIcon className="text-slate-400" size={32} />
          
          <div className="w-full">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Caption (optional)
            </label>
            <input
              type="text"
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              placeholder="Enter caption for next upload"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <label className="cursor-pointer bg-slate-800 text-white px-6 py-3 rounded-lg hover:bg-slate-700 transition flex items-center gap-2">
            <Upload size={20} />
            {uploading ? 'Uploading...' : 'Upload Images'}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          
          <p className="text-sm text-slate-500">
            Supports JPG, PNG, GIF. Multiple files allowed.
          </p>
        </div>
      </div>

      {/* Images Grid */}
      {loading ? (
        <p className="text-center text-slate-500">Loading...</p>
      ) : images.length === 0 ? (
        <p className="text-center text-slate-500">No images uploaded yet</p>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="aspect-square relative">
                <img
                  src={image.image_url}
                  alt={image.caption || 'Gallery image'}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-2 space-y-1.5">
                <input
                  type="text"
                  value={editingCaptions[image.id] || ''}
                  onChange={(e) => handleCaptionChange(image.id, e.target.value)}
                  onBlur={() => handleCaptionBlur(image.id)}
                  onKeyDown={handleCaptionKeyDown}
                  placeholder="Caption"
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                />
                
                <div className="flex items-center gap-1">
                  <label className="text-xs text-slate-600">Order:</label>
                  <input
                    type="number"
                    value={image.display_order}
                    onChange={(e) => updateOrder(image.id, parseInt(e.target.value))}
                    className="w-14 px-1 py-1 text-xs border border-slate-300 rounded"
                  />
                </div>

                <button
                  onClick={() => deleteImage(image)}
                  className="w-full flex items-center justify-center gap-1 bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition text-xs"
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setSelectedPreviewImage(null);
        }}
        title="Vorschau: Gallery Sektion"
        maxWidth="w-[1024px]"
      >
        {(() => {
          const customProps = backgroundColor ? getAdaptiveTextColors(backgroundColor) : {};
          return (
            <div className="bg-white">
              <section 
                className="py-20 bg-white"
                style={{ 
                  backgroundColor: backgroundColor || undefined,
                  ...customProps as React.CSSProperties
                }}
              >
                <div className="container mx-auto px-4">
                  <div className="text-center mb-16">
                    <h2 
                      className="text-4xl md:text-5xl font-bold mb-4"
                      style={{ color: 'var(--text-primary, #1e293b)' }}
                    >
                      Gallery
                    </h2>
                    <p 
                      className="text-xl max-w-2xl mx-auto"
                      style={{ color: 'var(--text-secondary, #475569)' }}
                    >
                      Explore our work and get inspired
                    </p>
                  </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
                    onClick={() => setSelectedPreviewImage(image)}
                  >
                    <img
                      src={image.image_url}
                      alt={image.caption || 'Gallery image'}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {image.caption && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <p className="text-white text-sm font-medium">{image.caption}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Lightbox inside preview */}
          {selectedPreviewImage && (
            <div
              className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
              onClick={() => setSelectedPreviewImage(null)}
            >
              <div className="relative max-w-7xl max-h-[90vh]">
                <img
                  src={selectedPreviewImage.image_url}
                  alt={selectedPreviewImage.caption || 'Gallery image'}
                  className="max-w-full max-h-[90vh] object-contain"
                />
                {selectedPreviewImage.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4 text-center">
                    <p className="text-white text-lg">{selectedPreviewImage.caption}</p>
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPreviewImage(null);
                  }}
                  className="absolute top-4 right-4 text-white hover:text-slate-300 text-4xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
          );
        })()}
      </Modal>
        </div>
      </div>
    </div>
  );
}
