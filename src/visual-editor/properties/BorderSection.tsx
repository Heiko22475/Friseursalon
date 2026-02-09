// =====================================================
// VISUAL EDITOR – BORDER SECTION
// Properties Panel: Border Width, Style, Color, Radius
// =====================================================

import React from 'react';
import type { StyleProperties } from '../types/styles';
import { VEColorPicker } from '../components/VEColorPicker';
import { UnitInput } from '../components/UnitInput';

interface BorderSectionProps {
  styles: Partial<StyleProperties>;
  onChange: (key: keyof StyleProperties, value: any) => void;
}

export const BorderSection: React.FC<BorderSectionProps> = ({ styles, onChange }) => {
  return (
    <div>
      {/* Border Width + Style */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <div style={{ flex: 1 }}>
          <UnitInput
            label="Breite"
            value={styles.borderWidth}
            onChange={(v) => onChange('borderWidth', v)}
            compact
            units={['px']}
            placeholder="0"
            min={0}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '3px' }}>Stil</label>
          <select
            value={styles.borderStyle ?? ''}
            onChange={(e) => onChange('borderStyle', e.target.value || undefined)}
            style={{
              width: '100%',
              padding: '5px 6px',
              backgroundColor: '#2d2d3d',
              border: '1px solid #3d3d4d',
              borderRadius: '4px',
              color: '#d1d5db',
              fontSize: '12px',
            }}
          >
            <option value="">–</option>
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>

      {/* Border Color */}
      <VEColorPicker
        label="Farbe"
        value={styles.borderColor}
        onChange={(v) => onChange('borderColor', v)}
      />

      {/* Border Radius */}
      <div style={{ marginTop: '8px' }}>
        <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '6px' }}>
          Ecken-Radius
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <UnitInput
            label="↖"
            value={styles.borderTopLeftRadius || styles.borderRadius}
            onChange={(v) => onChange('borderTopLeftRadius', v)}
            compact
            units={['px', '%', 'rem']}
            placeholder="0"
            min={0}
          />
          <UnitInput
            label="↗"
            value={styles.borderTopRightRadius || styles.borderRadius}
            onChange={(v) => onChange('borderTopRightRadius', v)}
            compact
            units={['px', '%', 'rem']}
            placeholder="0"
            min={0}
          />
          <UnitInput
            label="↙"
            value={styles.borderBottomLeftRadius || styles.borderRadius}
            onChange={(v) => onChange('borderBottomLeftRadius', v)}
            compact
            units={['px', '%', 'rem']}
            placeholder="0"
            min={0}
          />
          <UnitInput
            label="↘"
            value={styles.borderBottomRightRadius || styles.borderRadius}
            onChange={(v) => onChange('borderBottomRightRadius', v)}
            compact
            units={['px', '%', 'rem']}
            placeholder="0"
            min={0}
          />
        </div>

        {/* All-corners shortcut */}
        <div style={{ marginTop: '6px' }}>
          <UnitInput
            label="Alle"
            value={styles.borderRadius}
            onChange={(v) => {
              onChange('borderRadius', v);
              // Clear individual corners when setting all
              onChange('borderTopLeftRadius', undefined);
              onChange('borderTopRightRadius', undefined);
              onChange('borderBottomLeftRadius', undefined);
              onChange('borderBottomRightRadius', undefined);
            }}
            units={['px', '%', 'rem']}
            placeholder="0"
            min={0}
          />
        </div>
      </div>
    </div>
  );
};
