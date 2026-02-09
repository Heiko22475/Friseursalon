// =====================================================
// VISUAL EDITOR – MEDIA PICKER
// Wrapper um MediaLibrary für Image-URL-Auswahl
//
// Features:
//   • Thumbnail-Vorschau mit Overlay-Buttons
//   • Klick → MediaLibrary-Modal im Select-Modus
//   • Einzelbild-Auswahl (singleSelect)
//   • Entfernen-Button
//   • Dark-Theme passend zum Visual Editor
// =====================================================

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ImagePlus, Replace, Trash2, X } from 'lucide-react';
import { MediaLibrary } from '../../components/admin/MediaLibrary';
import type { MediaFile } from '../../components/admin/MediaLibrary';

// ===== TYPES =====

interface VEMediaPickerProps {
  value: string | undefined;
  onChange: (url: string | undefined) => void;
  label?: string;
}

// ===== COMPONENT =====

export const VEMediaPicker: React.FC<VEMediaPickerProps> = ({ value, onChange, label }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (files: MediaFile[]) => {
    if (files.length > 0) {
      onChange(files[0].file_url);
    }
    setOpen(false);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  return (
    <>
      {/* Picker Area */}
      {value ? (
        /* Has Image → Thumbnail with overlay */
        <div
          style={{
            position: 'relative',
            height: '100px',
            borderRadius: '6px',
            backgroundColor: '#2d2d3d',
            border: '1px solid #3d3d4d',
            overflow: 'hidden',
            cursor: 'pointer',
          }}
          onClick={() => setOpen(true)}
        >
          {/* Thumbnail */}
          <img
            src={value}
            alt={label || 'Bild'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />

          {/* Hover Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: 0,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }}
          >
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setOpen(true); }}
              title="Bild ändern"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                backgroundColor: '#3b82f6',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Replace size={12} />
              Ändern
            </button>
            <button
              type="button"
              onClick={handleRemove}
              title="Bild entfernen"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                backgroundColor: '#ef4444',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Trash2 size={12} />
              Entfernen
            </button>
          </div>
        </div>
      ) : (
        /* No Image → Placeholder button */
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            width: '100%',
            height: '80px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            backgroundColor: '#2d2d3d',
            border: '2px dashed #3d3d4d',
            borderRadius: '6px',
            cursor: 'pointer',
            color: '#6b7280',
            fontSize: '11px',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#3b82f6';
            e.currentTarget.style.color = '#3b82f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#3d3d4d';
            e.currentTarget.style.color = '#6b7280';
          }}
        >
          <ImagePlus size={20} />
          <span>Bild auswählen</span>
        </button>
      )}

      {/* URL Display (when image is set) */}
      {value && (
        <div style={{
          marginTop: '4px',
          fontSize: '10px',
          color: '#4a4a5a',
          wordBreak: 'break-all',
          lineHeight: '1.4',
        }}>
          {value}
        </div>
      )}

      {/* MediaLibrary Modal (portal) */}
      {open && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          {/* Modal Container */}
          <div
            style={{
              width: '90vw',
              maxWidth: '1200px',
              height: '80vh',
              backgroundColor: '#f9fafb',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
            }}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: '#fff',
            }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                Mediathek – Bild auswählen
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#6b7280',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* MediaLibrary Content */}
            <div style={{ flex: 1, overflow: 'auto' }}>
              <MediaLibrary
                mode="select"
                singleSelect={true}
                onSelect={handleSelect}
                onCancel={() => setOpen(false)}
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
