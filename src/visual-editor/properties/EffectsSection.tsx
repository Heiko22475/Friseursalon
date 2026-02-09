// =====================================================
// VISUAL EDITOR – EFFECTS SECTION
// Properties Panel: Box Shadow, Position, Cursor
// =====================================================

import React from 'react';
import type { StyleProperties, SizeValue } from '../types/styles';
import { UnitInput } from '../components/UnitInput';

interface EffectsSectionProps {
  styles: Partial<StyleProperties>;
  onChange: (key: keyof StyleProperties, value: any) => void;
}

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
    <label style={{ width: '60px', flexShrink: 0, fontSize: '11px', color: '#6b7280' }}>{label}</label>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

// ===== SHADOW PRESETS =====

const SHADOW_PRESETS = [
  { label: 'Keine', value: '' },
  { label: 'XS', value: '0 1px 2px rgba(0,0,0,0.05)' },
  { label: 'SM', value: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)' },
  { label: 'MD', value: '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)' },
  { label: 'LG', value: '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)' },
  { label: 'XL', value: '0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)' },
  { label: '2XL', value: '0 25px 50px rgba(0,0,0,0.25)' },
];

export const EffectsSection: React.FC<EffectsSectionProps> = ({ styles, onChange }) => {
  // Find which preset matches (if any)
  const currentPreset = SHADOW_PRESETS.find((p) => p.value === (styles.boxShadow || ''));

  return (
    <div>
      {/* Box Shadow */}
      <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '6px' }}>
        Schatten
      </label>

      {/* Preset buttons */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '8px', flexWrap: 'wrap' }}>
        {SHADOW_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => onChange('boxShadow', preset.value || undefined)}
            style={{
              padding: '3px 8px',
              backgroundColor: currentPreset?.label === preset.label ? '#3b82f6' : '#2d2d3d',
              border: '1px solid ' + (currentPreset?.label === preset.label ? '#3b82f6' : '#3d3d4d'),
              borderRadius: '3px',
              color: currentPreset?.label === preset.label ? '#fff' : '#9ca3af',
              fontSize: '10px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom input */}
      <input
        type="text"
        value={styles.boxShadow || ''}
        onChange={(e) => onChange('boxShadow', e.target.value || undefined)}
        placeholder="0 2px 8px rgba(0,0,0,0.1)"
        style={{
          width: '100%',
          padding: '5px 8px',
          backgroundColor: '#2d2d3d',
          border: '1px solid #3d3d4d',
          borderRadius: '4px',
          color: '#d1d5db',
          fontSize: '11px',
          fontFamily: 'monospace',
          marginBottom: '12px',
        }}
      />

      {/* Position */}
      <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '6px' }}>
        Position
      </label>
      <Row label="Typ">
        <select
          value={styles.position ?? ''}
          onChange={(e) => onChange('position', e.target.value || undefined)}
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
          <option value="static">Static</option>
          <option value="relative">Relative</option>
          <option value="absolute">Absolute</option>
        </select>
      </Row>

      {(styles.position === 'relative' || styles.position === 'absolute') && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
            <UnitInput
              label="Top"
              value={typeof styles.top === 'object' ? styles.top as SizeValue : undefined}
              onChange={(v) => onChange('top', v)}
              compact
              units={['px', '%']}
              placeholder="–"
            />
            <UnitInput
              label="Right"
              value={typeof styles.right === 'object' ? styles.right as SizeValue : undefined}
              onChange={(v) => onChange('right', v)}
              compact
              units={['px', '%']}
              placeholder="–"
            />
            <UnitInput
              label="Bottom"
              value={typeof styles.bottom === 'object' ? styles.bottom as SizeValue : undefined}
              onChange={(v) => onChange('bottom', v)}
              compact
              units={['px', '%']}
              placeholder="–"
            />
            <UnitInput
              label="Left"
              value={typeof styles.left === 'object' ? styles.left as SizeValue : undefined}
              onChange={(v) => onChange('left', v)}
              compact
              units={['px', '%']}
              placeholder="–"
            />
          </div>

          <Row label="Z-Index">
            <input
              type="number"
              value={styles.zIndex ?? ''}
              onChange={(e) => onChange('zIndex', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="auto"
              style={{
                width: '100%',
                padding: '4px 8px',
                backgroundColor: '#2d2d3d',
                border: '1px solid #3d3d4d',
                borderRadius: '4px',
                color: '#d1d5db',
                fontSize: '12px',
              }}
            />
          </Row>
        </>
      )}

      {/* Cursor */}
      <Row label="Cursor">
        <select
          value={styles.cursor ?? ''}
          onChange={(e) => onChange('cursor', e.target.value || undefined)}
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
          <option value="default">Default</option>
          <option value="pointer">Pointer</option>
          <option value="text">Text</option>
          <option value="move">Move</option>
          <option value="not-allowed">Not Allowed</option>
        </select>
      </Row>
    </div>
  );
};
