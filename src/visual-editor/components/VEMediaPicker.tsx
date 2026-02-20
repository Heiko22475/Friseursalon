// =====================================================
// VISUAL EDITOR – MEDIA PICKER
// Wrapper für Image-URL-Auswahl in Properties-Panel
//
// Features:
//   • Thumbnail-Vorschau mit Overlay-Buttons
//   • Klick → öffnet zentralen VEMediaDialog
//   • Einzelbild-Auswahl (singleSelect)
//   • Entfernen-Button
//   • Dark-Theme passend zum Visual Editor
// =====================================================

import React from 'react';
import { ImagePlus, Replace, Trash2 } from 'lucide-react';
import { useMediaDialog } from '../state/VEMediaDialogContext';

// ===== TYPES =====

interface VEMediaPickerProps {
  value: string | undefined;
  onChange: (url: string | undefined) => void;
  label?: string;
}

// ===== COMPONENT =====

export const VEMediaPicker: React.FC<VEMediaPickerProps> = ({ value, onChange, label }) => {
  const { openMediaDialog } = useMediaDialog();

  const handleOpen = () => {
    openMediaDialog((url) => {
      onChange(url);
    });
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
            backgroundColor: 'var(--admin-bg-input)',
            border: '1px solid var(--admin-border-strong)',
            overflow: 'hidden',
            cursor: 'pointer',
          }}
          onClick={handleOpen}
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
              onClick={(e) => { e.stopPropagation(); handleOpen(); }}
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
          onClick={handleOpen}
          style={{
            width: '100%',
            height: '80px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            backgroundColor: 'var(--admin-bg-input)',
            border: '2px dashed var(--admin-border-strong)',
            borderRadius: '6px',
            cursor: 'pointer',
            color: 'var(--admin-text-secondary)',
            fontSize: '11px',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#3b82f6';
            e.currentTarget.style.color = '#3b82f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--admin-border-strong)';
            e.currentTarget.style.color = 'var(--admin-text-secondary)';
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
          color: 'var(--admin-text-secondary)',
          wordBreak: 'break-all',
          lineHeight: '1.4',
        }}>
          {value}
        </div>
      )}
    </>
  );
};
