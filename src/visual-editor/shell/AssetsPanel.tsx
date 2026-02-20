// =====================================================
// VISUAL EDITOR – ASSETS PANEL
// Medien-Bibliothek im Navigator-Flyout
// Zeigt Bilder aus der Mediathek + Stock Photos
// =====================================================

import React, { useState, useEffect } from 'react';
import { Image, Search, FolderOpen, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useWebsite } from '../../contexts/WebsiteContext';

interface MediaItem {
  id: string;
  url: string;
  folder?: string;
  media_type?: string;
}

export const AssetsPanel: React.FC = () => {
  const { websiteRecord } = useWebsite();
  const [images, setImages] = useState<MediaItem[]>([]);
  const [stockPhotos, setStockPhotos] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'user' | 'stock'>('user');
  const [loading, setLoading] = useState(false);

  // Load user media
  useEffect(() => {
    if (!websiteRecord?.customer_id) return;

    const loadMedia = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('user_media')
          .select('id, url, folder, media_type')
          .eq('customer_id', websiteRecord.customer_id)
          .order('created_at', { ascending: false })
          .limit(100);

        if (data) setImages(data);
      } catch (err) {
        console.error('Failed to load media:', err);
      }
      setLoading(false);
    };

    loadMedia();
  }, [websiteRecord?.customer_id]);

  // Load stock photos
  useEffect(() => {
    const loadStock = async () => {
      try {
        const { data } = await supabase
          .from('stock_photos')
          .select('id, url, category')
          .order('created_at', { ascending: false })
          .limit(50);

        if (data) {
          setStockPhotos(data.map(p => ({ id: p.id, url: p.url, folder: p.category })));
        }
      } catch (err) {
        console.error('Failed to load stock photos:', err);
      }
    };

    loadStock();
  }, []);

  const currentItems = activeTab === 'user' ? images : stockPhotos;
  const filtered = search
    ? currentItems.filter(item =>
        item.url.toLowerCase().includes(search.toLowerCase()) ||
        item.folder?.toLowerCase().includes(search.toLowerCase())
      )
    : currentItems;

  const handleDragStart = (e: React.DragEvent, url: string) => {
    e.dataTransfer.setData('text/plain', url);
    e.dataTransfer.setData('application/ve-asset', url);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Tab Toggle */}
      <div
        style={{
          display: 'flex',
          padding: '8px 8px 0',
          gap: '4px',
        }}
      >
        {(['user', 'stock'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '6px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: activeTab === tab ? '#2563eb33' : 'transparent',
              color: activeTab === tab ? '#60a5fa' : 'var(--admin-text-icon)',
              fontSize: '11px',
              fontWeight: activeTab === tab ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {tab === 'user' ? (
              <><FolderOpen size={12} style={{ marginRight: '4px', verticalAlign: '-2px' }} />Meine Medien</>
            ) : (
              <><Image size={12} style={{ marginRight: '4px', verticalAlign: '-2px' }} />Stock Fotos</>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ padding: '8px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 8px',
            backgroundColor: 'var(--admin-bg-input)',
            border: '1px solid var(--admin-border-strong)',
            borderRadius: '4px',
          }}
        >
          <Search size={12} style={{ color: 'var(--admin-text-icon)', flexShrink: 0 }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suchen..."
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--admin-text)',
              fontSize: '12px',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Media Grid */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 8px 8px',
        }}
        className="ve-canvas-scroll"
      >
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--admin-text-icon)', fontSize: '12px' }}>
            Laden...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--admin-text-icon)', fontSize: '12px' }}>
            {search ? 'Keine Ergebnisse.' : activeTab === 'user' ? 'Keine Medien vorhanden.' : 'Keine Stock Fotos.'}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '4px',
            }}
          >
            {filtered.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.url)}
                style={{
                  aspectRatio: '1',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  cursor: 'grab',
                  position: 'relative',
                  border: '1px solid var(--admin-border-strong)',
                  backgroundColor: 'var(--admin-bg-input)',
                }}
                title={item.url.split('/').pop()}
              >
                <img
                  src={item.url}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                  draggable={false}
                  loading="lazy"
                />
                {item.folder && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      left: '2px',
                      fontSize: '8px',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      color: 'var(--admin-text)',
                      padding: '1px 4px',
                      borderRadius: '2px',
                      maxWidth: 'calc(100% - 4px)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.folder}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer: Open Mediathek link */}
      <div
        style={{
          padding: '8px',
          borderTop: '1px solid var(--admin-border)',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <a
          href="/admin/media"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            color: 'var(--admin-text-icon)',
            textDecoration: 'none',
          }}
        >
          <ExternalLink size={10} />
          Mediathek öffnen
        </a>
      </div>
    </div>
  );
};
