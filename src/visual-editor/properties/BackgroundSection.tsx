// =====================================================
// VISUAL EDITOR – BACKGROUND SECTION
// Properties Panel: Background Color, Image, Size, Position
// =====================================================

import React from 'react';
import { X } from 'lucide-react';
import type { StyleProperties } from '../types/styles';
import { VEColorPicker } from '../components/VEColorPicker';

interface BackgroundSectionProps {
  styles: Partial<StyleProperties>;
  onChange: (key: keyof StyleProperties, value: any) => void;
}

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
    <label style={{ width: '60px', flexShrink: 0, fontSize: '11px', color: '#6b7280' }}>{label}</label>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

export const BackgroundSection: React.FC<BackgroundSectionProps> = ({ styles, onChange }) => {
  const hasImage = !!styles.backgroundImage;

  return (
    <div>
      {/* Background Color */}
      <VEColorPicker
        label="Farbe"
        value={styles.backgroundColor}
        onChange={(v) => onChange('backgroundColor', v)}
      />

      {/* Background Image */}
      <Row label="Bild">
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <input
            type="text"
            value={styles.backgroundImage || ''}
            onChange={(e) => onChange('backgroundImage', e.target.value || undefined)}
            placeholder="URL eingeben…"
            style={{
              flex: 1,
              padding: '4px 8px',
              backgroundColor: '#2d2d3d',
              border: '1px solid #3d3d4d',
              borderRadius: '4px',
              color: '#d1d5db',
              fontSize: '12px',
            }}
          />
          {hasImage && (
            <button
              onClick={() => {
                onChange('backgroundImage', undefined);
                onChange('backgroundSize', undefined);
                onChange('backgroundPosition', undefined);
                onChange('backgroundRepeat', undefined);
              }}
              title="Bild entfernen"
              style={{
                padding: '4px',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                display: 'flex',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </Row>

      {/* Image preview */}
      {hasImage && (
        <div style={{
          marginBottom: '8px',
          height: '60px',
          borderRadius: '4px',
          backgroundColor: '#2d2d3d',
          backgroundImage: `url(${styles.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '1px solid #3d3d4d',
        }} />
      )}

      {/* Image options (only when image is set) */}
      {hasImage && (
        <>
          <Row label="Size">
            <select
              value={styles.backgroundSize || ''}
              onChange={(e) => onChange('backgroundSize', e.target.value || undefined)}
              style={{
                width: '100%',
                padding: '4px 6px',
                backgroundColor: '#2d2d3d',
                border: '1px solid #3d3d4d',
                borderRadius: '4px',
                color: '#d1d5db',
                fontSize: '12px',
              }}
            >
              <option value="">–</option>
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
              <option value="auto">Auto</option>
              <option value="100% 100%">Stretch</option>
            </select>
          </Row>

          <Row label="Position">
            <select
              value={styles.backgroundPosition || ''}
              onChange={(e) => onChange('backgroundPosition', e.target.value || undefined)}
              style={{
                width: '100%',
                padding: '4px 6px',
                backgroundColor: '#2d2d3d',
                border: '1px solid #3d3d4d',
                borderRadius: '4px',
                color: '#d1d5db',
                fontSize: '12px',
              }}
            >
              <option value="">–</option>
              <option value="center">Center</option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
              <option value="left center">Left</option>
              <option value="right center">Right</option>
              <option value="top left">Top Left</option>
              <option value="top right">Top Right</option>
              <option value="bottom left">Bottom Left</option>
              <option value="bottom right">Bottom Right</option>
            </select>
          </Row>

          <Row label="Repeat">
            <select
              value={styles.backgroundRepeat || ''}
              onChange={(e) => onChange('backgroundRepeat', e.target.value || undefined)}
              style={{
                width: '100%',
                padding: '4px 6px',
                backgroundColor: '#2d2d3d',
                border: '1px solid #3d3d4d',
                borderRadius: '4px',
                color: '#d1d5db',
                fontSize: '12px',
              }}
            >
              <option value="">–</option>
              <option value="no-repeat">Nicht wiederholen</option>
              <option value="repeat">Wiederholen</option>
              <option value="repeat-x">Horizontal</option>
              <option value="repeat-y">Vertikal</option>
            </select>
          </Row>
        </>
      )}
    </div>
  );
};
