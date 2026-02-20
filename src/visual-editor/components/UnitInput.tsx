// =====================================================
// VISUAL EDITOR – UNIT INPUT
// Zahleneingabe mit Unit-Switch (Webflow-Style)
// [42] [px ▼]
// =====================================================

import React, { useState, useRef, useEffect } from 'react';
import type { SizeValue } from '../types/styles';

type SizeUnit = SizeValue['unit'];

interface UnitInputProps {
  label: string;
  value: SizeValue | undefined;
  onChange: (value: SizeValue | undefined) => void;
  /** Erlaubte Units */
  units?: SizeUnit[];
  /** Placeholder wenn leer */
  placeholder?: string;
  /** Minimum Value */
  min?: number;
  /** Step-Größe */
  step?: number;
  /** Kompaktes Layout (label oben) */
  compact?: boolean;
}

const DEFAULT_UNITS: SizeUnit[] = ['rem', 'px', '%', 'em', 'vw', 'vh'];

export const UnitInput: React.FC<UnitInputProps> = ({
  label,
  value,
  onChange,
  units = DEFAULT_UNITS,
  placeholder = '–',
  min,
  step = 1,
  compact = false,
}) => {
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentUnit = value?.unit || 'px';
  const currentValue = value?.value;

  useEffect(() => {
    if (!showUnitDropdown) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowUnitDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showUnitDropdown]);

  const handleValueChange = (raw: string) => {
    if (raw === '' || raw === '-') {
      onChange(undefined);
      return;
    }
    const num = parseFloat(raw);
    if (!isNaN(num)) {
      onChange({ value: num, unit: currentUnit });
    }
  };

  const handleUnitChange = (unit: SizeUnit) => {
    setShowUnitDropdown(false);
    if (value) {
      onChange({ value: value.value, unit });
    }
  };

  // Arrow key scrubbing
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const delta = e.key === 'ArrowUp' ? step : -step;
      const multiplier = e.shiftKey ? 10 : 1;
      const current = value?.value ?? 0;
      const newVal = current + delta * multiplier;
      onChange({ value: min !== undefined ? Math.max(min, newVal) : newVal, unit: currentUnit });
    }
  };

  if (compact) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontSize: '10px', color: '#9ca3af', textAlign: 'center' }}>{label}</span>
        <div style={{ display: 'flex', position: 'relative' }}>
          <input
            ref={inputRef}
            type="number"
            value={currentValue ?? ''}
            onChange={(e) => handleValueChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            min={min}
            step={step}
            style={{
              width: '48px',
              padding: '5px 4px',
              backgroundColor: '#2d2d3d',
              border: '1px solid #3d3d4d',
              borderRight: 'none',
              borderRadius: '4px 0 0 4px',
              color: '#d1d5db',
              fontSize: '11px',
              textAlign: 'center',
              outline: 'none',
              MozAppearance: 'textfield',
            }}
          />
          <button
            onClick={() => setShowUnitDropdown(!showUnitDropdown)}
            style={{
              padding: '5px 4px',
              backgroundColor: '#252535',
              border: '1px solid #3d3d4d',
              borderRadius: '0 4px 4px 0',
              color: '#b0b7c3',
              fontSize: '10px',
              cursor: 'pointer',
              minWidth: '26px',
            }}
          >
            {currentUnit}
          </button>
          {showUnitDropdown && (
            <div
              ref={dropdownRef}
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                zIndex: 100,
                backgroundColor: '#1e1e2e',
                border: '1px solid #3d3d4d',
                borderRadius: '4px',
                marginTop: '2px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                minWidth: '50px',
              }}
            >
              {units.map((u) => (
                <button
                  key={u}
                  onClick={() => handleUnitChange(u)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '4px 8px',
                    backgroundColor: u === currentUnit ? '#2563eb22' : 'transparent',
                    border: 'none',
                    color: u === currentUnit ? '#60a5fa' : '#d1d5db',
                    fontSize: '11px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {u}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Standard layout (inline)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
      <label style={{ width: '80px', flexShrink: 0, fontSize: '12px', color: '#b0b7c3' }}>
        {label}
      </label>
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        <input
          ref={inputRef}
          type="number"
          value={currentValue ?? ''}
          onChange={(e) => handleValueChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          min={min}
          step={step}
          style={{
            flex: 1,
            padding: '6px 6px',
            backgroundColor: '#2d2d3d',
            border: '1px solid #3d3d4d',
            borderRight: 'none',
            borderRadius: '4px 0 0 4px',
            color: '#d1d5db',
            fontSize: '12px',
            outline: 'none',
            MozAppearance: 'textfield',
          }}
        />
        <button
          onClick={() => setShowUnitDropdown(!showUnitDropdown)}
          style={{
            padding: '6px 8px',
            backgroundColor: '#252535',
            border: '1px solid #3d3d4d',
            borderRadius: '0 4px 4px 0',
            color: '#b0b7c3',
            fontSize: '11px',
            cursor: 'pointer',
            minWidth: '36px',
          }}
        >
          {currentUnit}
        </button>
        {showUnitDropdown && (
          <div
            ref={dropdownRef}
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              zIndex: 100,
              backgroundColor: '#1e1e2e',
              border: '1px solid #3d3d4d',
              borderRadius: '4px',
              marginTop: '2px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              minWidth: '60px',
            }}
          >
            {units.map((u) => (
              <button
                key={u}
                onClick={() => handleUnitChange(u)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '4px 10px',
                  backgroundColor: u === currentUnit ? '#2563eb22' : 'transparent',
                  border: 'none',
                  color: u === currentUnit ? '#60a5fa' : '#d1d5db',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {u}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
