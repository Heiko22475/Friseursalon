// =====================================================
// TEMPLATE THUMBNAIL
// Rendert eine verkleinerte Vorschau eines VE-Elements
// Für Template-Auswahl-Panels (Sections, Cards, etc.)
// =====================================================

import React, { useRef, useEffect, useState } from 'react';
import type { VEElement } from '../types/elements';
import type { GlobalStyles } from '../types/styles';
import { ElementRenderer } from '../renderer/ElementRenderer';

interface TemplateThumbnailProps {
  /** Das Element, das als Miniatur gerendert werden soll */
  element: VEElement;
  /** Globale Styles (Klassen) */
  globalStyles?: GlobalStyles;
  /** Theme-Farben für Referenz-Auflösung */
  themeColors?: Record<string, string>;
  /** Breite der Miniatur in px (Default: 100) */
  width?: number;
  /** Höhe der Miniatur in px (Default: auto mit max 80px) */
  height?: number;
  /** Original-Breite des Elements (für Scale-Berechnung, Default: 1200) */
  originalWidth?: number;
  /** Optionaler Name/Titel der angezeigt wird */
  label?: string;
  /** Click Handler */
  onClick?: () => void;
  /** Ob das Template ausgewählt ist */
  isSelected?: boolean;
}

/**
 * Rendert eine skalierte Miniatur eines VE-Elements.
 * Nutzt CSS transform: scale() für performance-optimierte Verkleinerung.
 */
export const TemplateThumbnail: React.FC<TemplateThumbnailProps> = ({
  element,
  globalStyles: _globalStyles = {},
  themeColors: _themeColors = {},
  width = 100,
  height,
  originalWidth = 1200,
  label,
  onClick,
  isSelected = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);

  // Berechne Scale-Faktor
  const scale = width / originalWidth;
  const scaledHeight = height || Math.min(contentHeight * scale, 80);

  // Messe die Original-Höhe des Inhalts
  useEffect(() => {
    if (containerRef.current) {
      const content = containerRef.current.querySelector('.thumbnail-content') as HTMLElement;
      if (content) {
        // Trigger reflow to get accurate height
        requestAnimationFrame(() => {
          setContentHeight(content.scrollHeight);
        });
      }
    }
  }, [element]);

  return (
    <div
      className="template-thumbnail"
      onClick={onClick}
      style={{
        width: `${width}px`,
        height: scaledHeight > 0 ? `${scaledHeight}px` : 'auto',
        minHeight: height ? `${height}px` : '60px',
        maxHeight: height || '80px',
        overflow: 'hidden',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: '6px',
        border: `2px solid ${isSelected ? '#3b82f6' : 'var(--admin-border)'}`,
        backgroundColor: 'var(--admin-bg-sidebar)',
        transition: 'all 0.15s',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = isSelected ? '#3b82f6' : '#4d4d5d';
          e.currentTarget.style.backgroundColor = 'var(--admin-bg-card)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = isSelected ? '#3b82f6' : 'var(--admin-border)';
          e.currentTarget.style.backgroundColor = 'var(--admin-bg-sidebar)';
        }
      }}
      ref={containerRef}
    >
      {/* Scaled Content */}
      <div
        className="thumbnail-content"
        style={{
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
          width: `${originalWidth}px`,
          pointerEvents: 'none',
          userSelect: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {/* Render Element with minimal interactivity */}
        <div style={{ backgroundColor: '#ffffff', minHeight: '100px' }}>
          <ElementRenderer
            element={element}
            viewport="desktop"
            selectedId={null}
            hoveredId={null}
            onSelect={() => {}}
            onHover={() => {}}
          />
        </div>
      </div>

      {/* Optional Label */}
      {label && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '4px 6px',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            color: '#e0e0e0',
            fontSize: '11px',
            fontWeight: 600,
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            borderBottomLeftRadius: '4px',
            borderBottomRightRadius: '4px',
          }}
        >
          {label}
        </div>
      )}

      {/* Selection Indicator */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 700,
          }}
        >
          ✓
        </div>
      )}
    </div>
  );
};
