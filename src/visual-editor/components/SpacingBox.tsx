// =====================================================
// VISUAL EDITOR – SPACING BOX
// Interaktive Box-Model-Visualisierung (Webflow-Style)
//
//        ┌─── Margin ────────────┐
//        │       [mt]            │
//        │ [ml] ┌─ Padding ┐ [mr]│
//        │      │  [pt]     │    │
//        │      │[pl]  [pr] │    │
//        │      │  [pb]     │    │
//        │      └───────────┘    │
//        │       [mb]            │
//        └───────────────────────┘
//
// Klick auf Wert → öffnet Dropdown direkt darunter:
//   Zeile 1: Slider (Mitte=0) + Number-Input + Unit-Dropdown
//   Zeile 2: [auto]-Button (nur Margin) + Preset-Werte
// =====================================================

import React, { useState, useRef, useEffect } from 'react';
import type { SizeValue, SizeValueOrAuto, StyleProperties } from '../types/styles';

// ===== TYPES =====

type SpacingProperty =
  | 'marginTop' | 'marginRight' | 'marginBottom' | 'marginLeft'
  | 'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft';

type SizeUnit = SizeValue['unit'];

interface SpacingBoxProps {
  styles: Partial<StyleProperties>;
  onChange: (property: keyof StyleProperties, value: SizeValueOrAuto | SizeValue | undefined) => void;
}

// ===== HELPERS =====

function isMarginProp(prop: SpacingProperty): boolean {
  return prop.startsWith('margin');
}

function isSideProp(prop: SpacingProperty): boolean {
  return prop.endsWith('Left') || prop.endsWith('Right');
}

function getNumericValue(val: SizeValueOrAuto | SizeValue | undefined): number {
  if (!val || val === 'auto') return 0;
  return val.value;
}

function getUnit(val: SizeValueOrAuto | SizeValue | undefined): SizeUnit {
  if (!val || val === 'auto') return 'px';
  return val.unit;
}

function isAutoVal(val: SizeValueOrAuto | SizeValue | undefined): boolean {
  return val === 'auto';
}

function getDisplayText(val: SizeValueOrAuto | SizeValue | undefined): string {
  if (val === 'auto') return 'A';
  if (!val) return '–';
  return String(val.value);
}

function getPropertyLabel(prop: SpacingProperty): string {
  const map: Record<SpacingProperty, string> = {
    marginTop: 'Margin Top',
    marginRight: 'Margin Right',
    marginBottom: 'Margin Bottom',
    marginLeft: 'Margin Left',
    paddingTop: 'Padding Top',
    paddingRight: 'Padding Right',
    paddingBottom: 'Padding Bottom',
    paddingLeft: 'Padding Left',
  };
  return map[prop];
}

// ===== PRESET VALUES =====

const PRESETS_HORIZONTAL = [
  [0, 5, 10, 15],
  [25, 50, 75, 100],
];

const PRESETS_VERTICAL = [
  [0, 10, 20, 40],
  [60, 100, 140, 200],
];

const ALL_UNITS: SizeUnit[] = ['px', '%', 'vw', 'vh', 'rem'];

// ===== SPACING DROPDOWN =====

interface SpacingDropdownProps {
  property: SpacingProperty;
  value: SizeValueOrAuto | SizeValue | undefined;
  onChange: (val: SizeValueOrAuto | SizeValue | undefined) => void;
  onClose: () => void;
}

const SpacingDropdown: React.FC<SpacingDropdownProps> = ({
  property,
  value,
  onChange,
  onClose,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const margin = isMarginProp(property);
  const side = isSideProp(property);
  const presets = side ? PRESETS_HORIZONTAL : PRESETS_VERTICAL;

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

  // Slider range: margin allows negatives, padding min=0
  const sliderMin = margin ? -200 : 0;
  const sliderMax = 200;

  return (
    <div
      ref={dropdownRef}
      style={{
        backgroundColor: 'var(--admin-bg-surface)',
        border: '1px solid var(--admin-border-strong)',
        borderRadius: '6px',
        padding: '10px',
        marginTop: '4px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header */}
      <div style={{
        fontSize: '10px',
        color: 'var(--admin-text-secondary)',
        marginBottom: '8px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        fontWeight: 600,
      }}>
        {getPropertyLabel(property)}
      </div>

      {/* Row 1: Slider + Number + Unit */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
        <input
          type="range"
          min={sliderMin}
          max={sliderMax}
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
            backgroundColor: 'var(--admin-bg-input)',
            border: '1px solid var(--admin-border-strong)',
            borderRadius: '4px',
            color: 'var(--admin-text)',
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
            backgroundColor: 'var(--admin-bg-input)',
            border: '1px solid var(--admin-border-strong)',
            borderRadius: '4px',
            color: 'var(--admin-text)',
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
        {/* Auto Button (nur Margin) */}
        {margin && (
          <button
            onClick={handleAutoClick}
            style={{
              width: '48px',
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: autoActive ? '#3b82f6' : 'var(--admin-border)',
              border: `1px solid ${autoActive ? '#3b82f6' : 'var(--admin-border-strong)'}`,
              borderRadius: '4px',
              color: autoActive ? '#fff' : 'var(--admin-text-icon)',
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
          {presets.flat().map((val, i) => {
            const isActive = numericVal === val && !autoActive;
            return (
              <button
                key={`${val}-${i}`}
                onClick={() => setNumeric(val)}
                style={{
                  padding: '4px 2px',
                  backgroundColor: isActive ? '#3b82f6' : 'var(--admin-border)',
                  border: `1px solid ${isActive ? '#3b82f6' : 'var(--admin-border-strong)'}`,
                  borderRadius: '3px',
                  color: isActive ? '#fff' : 'var(--admin-text-icon)',
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

// ===== CLICKABLE VALUE (inside the box model) =====

interface ClickableValueProps {
  value: SizeValueOrAuto | SizeValue | undefined;
  position: 'top' | 'right' | 'bottom' | 'left';
  active: boolean;
  onClick: () => void;
}

const ClickableValue: React.FC<ClickableValueProps> = ({ value, position, active, onClick }) => {
  const display = getDisplayText(value);
  const hasValue = value !== undefined && value !== null;

  const posStyle: React.CSSProperties = {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    ...(position === 'top' && { top: '2px', left: '50%', transform: 'translateX(-50%)' }),
    ...(position === 'bottom' && { bottom: '2px', left: '50%', transform: 'translateX(-50%)' }),
    ...(position === 'left' && { left: '4px', top: '50%', transform: 'translateY(-50%)' }),
    ...(position === 'right' && { right: '4px', top: '50%', transform: 'translateY(-50%)' }),
  };

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{
        ...posStyle,
        cursor: 'pointer',
        fontSize: '10px',
        fontWeight: active ? 700 : 400,
        color: active ? '#3b82f6' : hasValue ? 'var(--admin-text)' : 'var(--admin-text-secondary)',
        minWidth: '20px',
        textAlign: 'center',
        padding: '2px 4px',
        borderRadius: '3px',
        backgroundColor: active ? '#3b82f620' : 'transparent',
        border: active ? '1px solid #3b82f650' : '1px solid transparent',
        transition: 'all 0.15s',
        userSelect: 'none',
      }}
      title={isAutoVal(value) ? 'auto' : value && value !== 'auto' ? `${value.value}${value.unit}` : '–'}
    >
      {display}
    </div>
  );
};

// ===== MAIN COMPONENT =====

export const SpacingBox: React.FC<SpacingBoxProps> = ({ styles, onChange }) => {
  const [activeProperty, setActiveProperty] = useState<SpacingProperty | null>(null);

  const getMarginVal = (prop: 'marginTop' | 'marginRight' | 'marginBottom' | 'marginLeft'): SizeValueOrAuto | undefined => {
    const v = styles[prop];
    if (v === 'auto') return 'auto';
    if (typeof v === 'object' && v !== null) return v as SizeValue;
    return undefined;
  };

  const getPaddingVal = (prop: 'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft'): SizeValue | undefined => {
    return styles[prop] as SizeValue | undefined;
  };

  const handleValueClick = (prop: SpacingProperty) => {
    setActiveProperty(activeProperty === prop ? null : prop);
  };

  const handleDropdownChange = (val: SizeValueOrAuto | SizeValue | undefined) => {
    if (activeProperty) {
      onChange(activeProperty, val);
    }
  };

  const getActiveValue = (): SizeValueOrAuto | SizeValue | undefined => {
    if (!activeProperty) return undefined;
    if (isMarginProp(activeProperty)) return getMarginVal(activeProperty as any);
    return getPaddingVal(activeProperty as any);
  };

  return (
    <div style={{ padding: '4px 0' }}>
      {/* Box Model Visualization */}
      <div
        style={{
          position: 'relative',
          backgroundColor: '#2a3a2a',
          border: '1px solid #3a4a3a',
          borderRadius: '6px',
          padding: '18px 24px',
          minHeight: '110px',
        }}
      >
        {/* Margin label */}
        <span style={{
          position: 'absolute', top: '2px', left: '6px',
          fontSize: '9px', color: '#5a6a5a',
          textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          Margin
        </span>

        {/* Margin clickable values */}
        <ClickableValue value={getMarginVal('marginTop')} position="top"
          active={activeProperty === 'marginTop'} onClick={() => handleValueClick('marginTop')} />
        <ClickableValue value={getMarginVal('marginRight')} position="right"
          active={activeProperty === 'marginRight'} onClick={() => handleValueClick('marginRight')} />
        <ClickableValue value={getMarginVal('marginBottom')} position="bottom"
          active={activeProperty === 'marginBottom'} onClick={() => handleValueClick('marginBottom')} />
        <ClickableValue value={getMarginVal('marginLeft')} position="left"
          active={activeProperty === 'marginLeft'} onClick={() => handleValueClick('marginLeft')} />

        {/* Padding Box */}
        <div
          style={{
            position: 'relative',
            backgroundColor: '#2a2a3a',
            border: '1px solid #3a3a4a',
            borderRadius: '4px',
            padding: '18px 24px',
            minHeight: '40px',
          }}
        >
          <span style={{
            position: 'absolute', top: '2px', left: '6px',
            fontSize: '9px', color: '#5a5a6a',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            Padding
          </span>

          {/* Padding clickable values */}
          <ClickableValue value={getPaddingVal('paddingTop')} position="top"
            active={activeProperty === 'paddingTop'} onClick={() => handleValueClick('paddingTop')} />
          <ClickableValue value={getPaddingVal('paddingRight')} position="right"
            active={activeProperty === 'paddingRight'} onClick={() => handleValueClick('paddingRight')} />
          <ClickableValue value={getPaddingVal('paddingBottom')} position="bottom"
            active={activeProperty === 'paddingBottom'} onClick={() => handleValueClick('paddingBottom')} />
          <ClickableValue value={getPaddingVal('paddingLeft')} position="left"
            active={activeProperty === 'paddingLeft'} onClick={() => handleValueClick('paddingLeft')} />

          {/* Center content indicator */}
          <div style={{
            width: '100%', height: '20px',
            backgroundColor: 'var(--admin-bg-card)', borderRadius: '2px',
            border: '1px dashed var(--admin-border-strong)',
          }} />
        </div>
      </div>

      {/* Dropdown panel (appears below the box model) */}
      {activeProperty && (
        <SpacingDropdown
          property={activeProperty}
          value={getActiveValue()}
          onChange={handleDropdownChange}
          onClose={() => setActiveProperty(null)}
        />
      )}
    </div>
  );
};
