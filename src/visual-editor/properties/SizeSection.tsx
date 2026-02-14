// =====================================================
// VISUAL EDITOR – SIZE SECTION
// Properties Panel: Width, Height, Min/Max, Overflow
//
// Jede Größen-Property ist klickbar und öffnet ein
// Dropdown mit Slider, Number-Input, Unit-Dropdown,
// Auto-Button und Preset-Werten (analog SpacingBox).
// =====================================================

import React, { useState, useRef, useEffect } from 'react';
import type { StyleProperties, SizeValue, SizeValueOrAuto } from '../types/styles';

// ===== TYPES =====

type SizeProperty = 'width' | 'height' | 'minWidth' | 'minHeight' | 'maxWidth' | 'maxHeight';
type SizeUnit = SizeValue['unit'];

interface SizeSectionProps {
  styles: Partial<StyleProperties>;
  onChange: (key: keyof StyleProperties, value: any) => void;
}

// ===== HELPERS =====

const ALL_UNITS: SizeUnit[] = ['px', '%', 'vw', 'vh', 'rem'];

const PROPERTY_LABELS: Record<SizeProperty, string> = {
  width: 'Width',
  height: 'Height',
  minWidth: 'Min W',
  minHeight: 'Min H',
  maxWidth: 'Max W',
  maxHeight: 'Max H',
};

// Properties that support "auto"
const SUPPORTS_AUTO: Set<SizeProperty> = new Set([
  'width', 'height', 'maxWidth', 'maxHeight',
]);

// Preset values (px)
const SIZE_PRESETS = [
  [50, 100, 200, 300],
  [400, 500, 750, 1000],
];

function getNumericValue(val: SizeValueOrAuto | undefined): number {
  if (!val || val === 'auto') return 0;
  return val.value;
}

function getUnit(val: SizeValueOrAuto | undefined): SizeUnit {
  if (!val || val === 'auto') return 'px';
  return val.unit;
}

function isAutoVal(val: SizeValueOrAuto | undefined): boolean {
  return val === 'auto';
}

function getDisplayText(val: SizeValueOrAuto | undefined): string {
  if (val === 'auto') return 'auto';
  if (!val) return '–';
  return `${val.value}${val.unit}`;
}

// ===== SIZE DROPDOWN =====

interface SizeDropdownProps {
  property: SizeProperty;
  value: SizeValueOrAuto | undefined;
  onChange: (val: SizeValueOrAuto | undefined) => void;
  onClose: () => void;
}

const SizeDropdown: React.FC<SizeDropdownProps> = ({
  property,
  value,
  onChange,
  onClose,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supportsAuto = SUPPORTS_AUTO.has(property);

  const numericVal = getNumericValue(value);
  const currentUnit = getUnit(value);
  const autoActive = isAutoVal(value);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handler);
    };
  }, [onClose]);

  const setNumeric = (num: number, unit?: SizeUnit) => {
    onChange({ value: num, unit: unit ?? currentUnit });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNumeric(parseInt(e.target.value, 10));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '' || raw === '-') {
      onChange(undefined);
      return;
    }
    const num = parseFloat(raw);
    if (!isNaN(num)) setNumeric(num);
  };

  const handleUnitChange = (unit: SizeUnit) => {
    onChange({ value: autoActive ? 0 : numericVal, unit });
  };

  const handleAutoClick = () => {
    onChange(autoActive ? { value: 0, unit: currentUnit } : 'auto');
  };

  return (
    <div
      ref={dropdownRef}
      style={{
        backgroundColor: '#1a1a2a',
        border: '1px solid #3d3d4d',
        borderRadius: '6px',
        padding: '10px',
        marginTop: '4px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header */}
      <div style={{
        fontSize: '10px',
        color: '#b0b7c3',
        marginBottom: '8px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        fontWeight: 600,
      }}>
        {PROPERTY_LABELS[property]}
      </div>

      {/* Row 1: Slider + Number + Unit */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
        <input
          type="range"
          min={0}
          max={1000}
          step={1}
          value={autoActive ? 0 : numericVal}
          onChange={handleSliderChange}
          style={{ flex: 1, accentColor: '#3b82f6', height: '4px', cursor: 'pointer' }}
        />
        <input
          type="number"
          value={autoActive ? '' : numericVal}
          onChange={handleNumberChange}
          placeholder={autoActive ? 'auto' : '0'}
          style={{
            width: '52px',
            padding: '4px 6px',
            backgroundColor: '#2d2d3d',
            border: '1px solid #3d3d4d',
            borderRadius: '4px',
            color: '#d1d5db',
            fontSize: '12px',
            textAlign: 'center',
            outline: 'none',
          }}
        />
        <select
          value={currentUnit}
          onChange={(e) => handleUnitChange(e.target.value as SizeUnit)}
          style={{
            width: '54px',
            padding: '4px 4px',
            backgroundColor: '#2d2d3d',
            border: '1px solid #3d3d4d',
            borderRadius: '4px',
            color: '#d1d5db',
            fontSize: '11px',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {ALL_UNITS.map((u) => (
            <option key={u} value={u}>{u === '%' ? '%' : u}</option>
          ))}
        </select>
      </div>

      {/* Row 2: Auto Button + Preset Values */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'stretch' }}>
        {/* Auto Button */}
        {supportsAuto && (
          <button
            onClick={handleAutoClick}
            style={{
              width: '48px',
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: autoActive ? '#3b82f6' : '#2d2d3d',
              border: `1px solid ${autoActive ? '#3b82f6' : '#3d3d4d'}`,
              borderRadius: '4px',
              color: autoActive ? '#fff' : '#b0b7c3',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s',
            }}
          >
            auto
          </button>
        )}

        {/* Preset Grid */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '3px',
        }}>
          {SIZE_PRESETS.flat().map((val, i) => {
            const isActive = numericVal === val && !autoActive;
            return (
              <button
                key={`${val}-${i}`}
                onClick={() => setNumeric(val)}
                style={{
                  padding: '4px 2px',
                  backgroundColor: isActive ? '#3b82f6' : '#2d2d3d',
                  border: `1px solid ${isActive ? '#3b82f6' : '#3d3d4d'}`,
                  borderRadius: '3px',
                  color: isActive ? '#fff' : '#b0b7c3',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.1s',
                }}
              >
                {val}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ===== CLICKABLE SIZE VALUE =====

const ClickableSizeValue: React.FC<{
  label: string;
  value: SizeValueOrAuto | undefined;
  active: boolean;
  onClick: () => void;
}> = ({ label, value, active, onClick }) => {
  const display = getDisplayText(value);
  const hasValue = value !== undefined;

  return (
    <div
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
        cursor: 'pointer',
        padding: '6px 8px',
        borderRadius: '4px',
        backgroundColor: active ? '#3b82f620' : '#2d2d3d',
        border: `1px solid ${active ? '#3b82f6' : '#3d3d4d'}`,
        transition: 'all 0.15s',
        userSelect: 'none',
      }}
    >
      <span style={{
        fontSize: '9px',
        color: '#b0b7c3',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        fontWeight: 500,
      }}>
        {label}
      </span>
      <span style={{
        fontSize: '12px',
        fontWeight: active ? 700 : 500,
        color: active ? '#3b82f6' : hasValue ? '#d1d5db' : '#9ca3af',
      }}>
        {display}
      </span>
    </div>
  );
};

// ===== ROW HELPER =====

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
    <label style={{ width: '60px', flexShrink: 0, fontSize: '11px', color: '#b0b7c3' }}>{label}</label>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

// ===== COMPONENT =====

export const SizeSection: React.FC<SizeSectionProps> = ({ styles, onChange }) => {
  const [activeProperty, setActiveProperty] = useState<SizeProperty | null>(null);

  const getValue = (prop: SizeProperty): SizeValueOrAuto | undefined => {
    const v = styles[prop];
    if (v === 'auto') return 'auto';
    if (typeof v === 'object' && v !== null) return v as SizeValue;
    return undefined;
  };

  const handleClick = (prop: SizeProperty) => {
    setActiveProperty(activeProperty === prop ? null : prop);
  };

  const handleDropdownChange = (val: SizeValueOrAuto | undefined) => {
    if (activeProperty) {
      onChange(activeProperty, val);
    }
  };

  // Pair definitions: [property1, property2]
  const pairs: [SizeProperty, SizeProperty][] = [
    ['width', 'height'],
    ['minWidth', 'minHeight'],
    ['maxWidth', 'maxHeight'],
  ];

  return (
    <div>
      {/* Size Pairs */}
      {pairs.map(([prop1, prop2]) => (
        <React.Fragment key={`${prop1}-${prop2}`}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
            <ClickableSizeValue
              label={PROPERTY_LABELS[prop1]}
              value={getValue(prop1)}
              active={activeProperty === prop1}
              onClick={() => handleClick(prop1)}
            />
            <ClickableSizeValue
              label={PROPERTY_LABELS[prop2]}
              value={getValue(prop2)}
              active={activeProperty === prop2}
              onClick={() => handleClick(prop2)}
            />
          </div>

          {/* Dropdown appears directly below the pair it belongs to */}
          {(activeProperty === prop1 || activeProperty === prop2) && (
            <SizeDropdown
              property={activeProperty!}
              value={getValue(activeProperty!)}
              onChange={handleDropdownChange}
              onClose={() => setActiveProperty(null)}
            />
          )}
        </React.Fragment>
      ))}

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
          <span style={{ fontSize: '11px', color: '#b0b7c3', width: '36px', textAlign: 'right' }}>
            {Math.round((styles.opacity ?? 1) * 100)}%
          </span>
        </div>
      </Row>
    </div>
  );
};
