// =====================================================
// VISUAL EDITOR – SIZE SECTION
// Properties Panel: Width, Height, Min/Max, Overflow
// =====================================================

import React from 'react';
import type { StyleProperties, SizeValue, SizeValueOrAuto } from '../types/styles';
import { UnitInput } from '../components/UnitInput';

interface SizeSectionProps {
  styles: Partial<StyleProperties>;
  onChange: (key: keyof StyleProperties, value: any) => void;
}

// ===== HELPER: SizeValueOrAuto → SizeValue =====

function sizeValueOrAutoToSizeValue(val: SizeValueOrAuto | undefined): SizeValue | undefined {
  if (!val || val === 'auto') return undefined;
  return val;
}

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
    <label style={{ width: '60px', flexShrink: 0, fontSize: '11px', color: '#6b7280' }}>{label}</label>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

// ===== AUTO TOGGLE FOR SIZE =====

const SizeInput: React.FC<{
  label: string;
  value: SizeValueOrAuto | undefined;
  onChange: (v: SizeValueOrAuto | undefined) => void;
  supportsAuto?: boolean;
}> = ({ label, value, onChange, supportsAuto = true }) => {
  const isAuto = value === 'auto';
  const sizeVal = sizeValueOrAutoToSizeValue(value);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <div style={{ flex: 1 }}>
          <UnitInput
            label={label}
            value={isAuto ? undefined : sizeVal}
            onChange={(v) => onChange(v || undefined)}
            compact
            units={['px', '%', 'vw', 'vh', 'rem']}
            placeholder={isAuto ? 'auto' : '–'}
          />
        </div>
        {supportsAuto && (
          <button
            onClick={() => onChange(isAuto ? undefined : 'auto')}
            title={isAuto ? 'Wert setzen' : 'Auto'}
            style={{
              marginTop: '17px',
              padding: '3px 6px',
              backgroundColor: isAuto ? '#3b82f6' : '#2d2d3d',
              border: '1px solid ' + (isAuto ? '#3b82f6' : '#3d3d4d'),
              borderRadius: '3px',
              color: isAuto ? '#fff' : '#6b7280',
              fontSize: '10px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            A
          </button>
        )}
      </div>
    </div>
  );
};

// ===== COMPONENT =====

export const SizeSection: React.FC<SizeSectionProps> = ({ styles, onChange }) => {
  return (
    <div>
      {/* Width + Height */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
        <div style={{ flex: 1 }}>
          <SizeInput
            label="Width"
            value={styles.width}
            onChange={(v) => onChange('width', v)}
          />
        </div>
        <div style={{ flex: 1 }}>
          <SizeInput
            label="Height"
            value={styles.height}
            onChange={(v) => onChange('height', v)}
          />
        </div>
      </div>

      {/* Min Width + Min Height */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
        <div style={{ flex: 1 }}>
          <SizeInput
            label="Min W"
            value={styles.minWidth}
            onChange={(v) => onChange('minWidth', v)}
            supportsAuto={false}
          />
        </div>
        <div style={{ flex: 1 }}>
          <SizeInput
            label="Min H"
            value={styles.minHeight}
            onChange={(v) => onChange('minHeight', v)}
            supportsAuto={false}
          />
        </div>
      </div>

      {/* Max Width + Max Height */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
        <div style={{ flex: 1 }}>
          <SizeInput
            label="Max W"
            value={styles.maxWidth}
            onChange={(v) => onChange('maxWidth', v)}
          />
        </div>
        <div style={{ flex: 1 }}>
          <SizeInput
            label="Max H"
            value={styles.maxHeight}
            onChange={(v) => onChange('maxHeight', v)}
          />
        </div>
      </div>

      {/* Overflow */}
      <div style={{ marginTop: '8px' }}>
        <Row label="Overflow">
          <select
            value={styles.overflow ?? ''}
            onChange={(e) => onChange('overflow', e.target.value || undefined)}
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
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
            <option value="scroll">Scroll</option>
            <option value="auto">Auto</option>
          </select>
        </Row>
      </div>

      {/* Opacity */}
      <Row label="Opacity">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={styles.opacity ?? 1}
            onChange={(e) => onChange('opacity', parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#3b82f6' }}
          />
          <span style={{ fontSize: '11px', color: '#9ca3af', width: '36px', textAlign: 'right' }}>
            {Math.round((styles.opacity ?? 1) * 100)}%
          </span>
        </div>
      </Row>
    </div>
  );
};
