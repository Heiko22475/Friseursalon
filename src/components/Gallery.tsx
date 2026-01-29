import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
}

interface GalleryProps {
  instanceId?: number;
}

export default function Gallery({ instanceId = 1 }: GalleryProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    loadImages();
  }, [instanceId]);

  const loadImages = async () => {
    const { data } = await supabase
      .from('gallery')
      .select('id, image_url, caption')
      .eq('instance_id', instanceId)
      .order('display_order');

    if (data) setImages(data);
  };

  return (
    <>
      <section id="gallery" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Gallery
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Explore our work and get inspired
            </p>
          </div>

          <div className="gallery-container">
            <div className="gallery-grid max-w-7xl mx-auto">
            {images.map((image) => (
              <div
                key={image.id}
                className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image.image_url}
                  alt={image.caption || 'Gallery image'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                {image.caption && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-white text-sm">{image.caption}</p>
                  </div>
                )}
              </div>
            ))}
            </div>
          </div>

          {images.length === 0 && (
            <p className="text-center text-slate-500">No images yet</p>
          )}
          
          <style>{`
            .gallery-container {
              container-type: inline-size;
            }
            .gallery-grid {
              display: grid;
              gap: 1rem;
              grid-template-columns: repeat(2, 1fr);
            }
            @container (min-width: 640px) {
              .gallery-grid {
                grid-template-columns: repeat(3, 1fr);
              }
            }
            @container (min-width: 1024px) {
              .gallery-grid {
                grid-template-columns: repeat(4, 1fr);
              }
            }
          `}</style>
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <button
              className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
              onClick={() => setSelectedImage(null)}
            >
              &times;
            </button>
            <img
              src={selectedImage.image_url}
              alt={selectedImage.caption || 'Gallery image'}
              className="max-w-full max-h-[90vh] object-contain"
            />
            {selectedImage.caption && (
              <p className="text-white text-center mt-4 text-lg">
                {selectedImage.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
