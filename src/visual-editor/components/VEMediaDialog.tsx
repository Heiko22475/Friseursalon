// =====================================================
// VISUAL EDITOR – MEDIA DIALOG
// Vollflächiger Mediathek-Dialog, positioniert neben der
// Icon-Bar. Layout von der Mediathek-Seite übernommen.
//
// Positionierung:
//   • Links: neben der Icon-Bar (48px)
//   • Oben: unterhalb des TopBar
//   • Unten: am unteren Bildschirmrand
//   • Breite: max 90% des VE-Editor-Bereichs
// =====================================================

import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { MediaLibrary } from '../../components/admin/MediaLibrary';
import type { MediaFile } from '../../components/admin/MediaLibrary';
import { useMediaDialog } from '../state/VEMediaDialogContext';
import { useAdminTheme } from '../../contexts/AdminThemeContext';

// ===== CONSTANTS =====

/** Breite der Icon-Bar links */
const ICON_BAR_WIDTH = 48;

// ===== COMPONENT =====

export const VEMediaDialog: React.FC = () => {
  const { isOpen, handleSelect, closeMediaDialog } = useMediaDialog();
  const { theme } = useAdminTheme();

  // ESC schließt den Dialog
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeMediaDialog();
    }
  }, [closeMediaDialog]);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  const onMediaSelect = useCallback((files: MediaFile[]) => {
    if (files.length > 0) {
      handleSelect(files[0].file_url);
    }
  }, [handleSelect]);

  if (!isOpen) return null;

  // Berechne Position relativ zum ve-main Container
  // TopBar = 48px, DataSource-Bar = dynamisch → wir messen den .ve-main Bereich
  const veMain = document.querySelector('.ve-main') as HTMLElement | null;
  const rect = veMain?.getBoundingClientRect();

  const top = rect ? rect.top : ICON_BAR_WIDTH;
  const left = rect ? rect.left + ICON_BAR_WIDTH : ICON_BAR_WIDTH;
  const height = rect ? rect.height : `calc(100vh - ${top}px)`;
  // 90% des gesamten ve-main-Bereichs abzüglich der Icon-Bar
  const maxWidth = rect
    ? Math.floor((rect.width - ICON_BAR_WIDTH) * 0.9)
    : `calc(90vw - ${ICON_BAR_WIDTH}px)`;

  return createPortal(
    <div className={`admin-theme-${theme}`} style={{ display: 'contents' }}>
      {/* Backdrop – leicht transparent, erlaubt Schließen per Klick */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          backgroundColor: 'rgba(0,0,0,0.25)',
        }}
        onClick={closeMediaDialog}
      />

      {/* Dialog Panel */}
      <div
        className="ve-media-dialog"
        style={{
          position: 'fixed',
          top: typeof top === 'number' ? `${top}px` : top,
          left: typeof left === 'number' ? `${left}px` : left,
          height: typeof height === 'number' ? `${height}px` : height,
          width: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
          maxWidth: '1400px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--admin-bg-card)',
          borderRight: '1px solid var(--admin-border-strong)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        {/* Dialog Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            backgroundColor: 'var(--admin-bg-sidebar)',
            borderBottom: '1px solid var(--admin-border)',
            flexShrink: 0,
          }}
        >
          <h3 style={{
            margin: 0,
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--admin-text-heading)',
            letterSpacing: '0.02em',
          }}>
            Mediathek – Bild auswählen
          </h3>
          <button
            type="button"
            onClick={closeMediaDialog}
            title="Schließen (Esc)"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '4px',
              color: 'var(--admin-text-secondary)',
              cursor: 'pointer',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--admin-text-heading)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--admin-text-secondary)'; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* MediaLibrary Content (Light-Theme Container) */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            backgroundColor: 'var(--admin-bg)',
          }}
        >
          <MediaLibrary
            mode="select"
            singleSelect={true}
            onSelect={onMediaSelect}
            onCancel={closeMediaDialog}
          />
        </div>
      </div>
    </div>,
    document.body
  );
};
