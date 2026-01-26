import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';

interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
  display_order: number;
}

export default function GalleryEditor() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [editingCaptions, setEditingCaptions] = useState<Record<string, string>>({});

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('gallery')
      .select('*')
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
            display_order: nextOrder
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

  const handleCaptionKeyDown = (e: React.KeyboardEvent, id: string) => {
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Gallery Images</h2>
        <p className="text-slate-600">Upload and manage gallery images</p>
      </div>

      {/* Upload Section */}
      <div className="bg-slate-50 rounded-lg p-6 border-2 border-dashed border-slate-300">
        <div className="flex flex-col items-center space-y-4">
          <ImageIcon className="text-slate-400" size={48} />
          
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="aspect-square relative">
                <img
                  src={image.image_url}
                  alt={image.caption || 'Gallery image'}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-3 space-y-2">
                <input
                  type="text"
                  value={editingCaptions[image.id] || ''}
                  onChange={(e) => handleCaptionChange(image.id, e.target.value)}
                  onBlur={() => handleCaptionBlur(image.id)}
                  onKeyDown={(e) => handleCaptionKeyDown(e, image.id)}
                  placeholder="Caption"
                  className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
                />
                
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-600">Order:</label>
                  <input
                    type="number"
                    value={image.display_order}
                    onChange={(e) => updateOrder(image.id, parseInt(e.target.value))}
                    className="w-20 px-2 py-1 text-sm border border-slate-300 rounded"
                  />
                </div>

                <button
                  onClick={() => deleteImage(image)}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition text-sm"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
