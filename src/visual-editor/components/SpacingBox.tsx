// =====================================================
// VISUAL EDITOR – SPACING BOX (v2)
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
// Features:
//  • Full-border click areas (entire strip is clickable)
//  • Drag-to-resize (0.5:1 ratio → 1px mouse = 2px spacing)
//  • Shift key → changes BOTH opposite sides simultaneously
//  • Syncs with SpacingDropdown slider below
// =====================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
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

function isVerticalProp(prop: SpacingProperty): boolean {
  return prop.endsWith('Top') || prop.endsWith('Bottom');
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

function getOppositeProperty(prop: SpacingProperty): SpacingProperty {
  const map: Record<SpacingProperty, SpacingProperty> = {
    marginTop: 'marginBottom',
    marginBottom: 'marginTop',
    marginLeft: 'marginRight',
    marginRight: 'marginLeft',
    paddingTop: 'paddingBottom',
    paddingBottom: 'paddingTop',
    paddingLeft: 'paddingRight',
    paddingRight: 'paddingLeft',
  };
  return map[prop];
}

// ===== CONSTANTS =====

const PRESETS_HORIZONTAL = [
  [0, 5, 10, 15],
  [25, 50, 75, 100],
];

const PRESETS_VERTICAL = [
  [0, 10, 20, 40],
  [60, 100, 140, 200],
];

const ALL_UNITS: SizeUnit[] = ['px', '%', 'vw', 'vh', 'rem'];

/** 1px mouse movement = 2px spacing change (0.5:1 ratio) */
const DRAG_MULTIPLIER = 2;

// Dimensions for box-model strips
const MARGIN_STRIP_H = 24;
const MARGIN_STRIP_W = 32;
const PADDING_STRIP_H = 20;
const PADDING_STRIP_W = 28;

// Box-model area tint colors
const MARGIN_TINT       = 'rgba(76, 175, 80, 0.06)';
const MARGIN_TINT_HOVER = 'rgba(76, 175, 80, 0.16)';
const PADDING_TINT       = 'rgba(100, 120, 200, 0.06)';
const PADDING_TINT_HOVER = 'rgba(100, 120, 200, 0.16)';
const ACTIVE_TINT        = 'rgba(59, 130, 246, 0.18)';

// ===== SPACING DROPDOWN (with Shift key support) =====

interface SpacingDropdownProps {
  property: SpacingProperty;
  value: SizeValueOrAuto | SizeValue | undefined;
  onChange: (val: SizeValueOrAuto | SizeValue | undefined) => void;
  /** Called additionally when Shift is held — applies the same value to the opposite side */
  onOppositeChange?: (val: SizeValueOrAuto | SizeValue | undefined) => void;
  shiftRef: React.MutableRefObject<boolean>;
}

const SpacingDropdown: React.FC<SpacingDropdownProps> = ({
  property,
  value,
  onChange,
  onOppositeChange,
  shiftRef,
}) => {
  const margin = isMarginProp(property);
  const side = isSideProp(property);
  const presets = side ? PRESETS_HORIZONTAL : PRESETS_VERTICAL;

  const numericVal = getNumericValue(value);
  const currentUnit = getUnit(value);
  const autoActive = isAutoVal(value);

  /** Fire onChange + optionally onOppositeChange when Shift is held */
  const fireChange = useCallback(
    (val: SizeValueOrAuto | SizeValue | undefined, forceShift?: boolean) => {
      onChange(val);
      if ((forceShift || shiftRef.current) && onOppositeChange) {
        onOppositeChange(val);
      }
    },
    [onChange, onOppositeChange, shiftRef],
  );

  const setNumeric = (num: number, unit?: SizeUnit, isShift?: boolean) => {
    fireChange({ value: num, unit: unit ?? currentUnit }, isShift);
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
    fireChange({ value: autoActive ? 0 : numericVal, unit });
  };

  const handleAutoClick = (e: React.MouseEvent) => {
    const newVal: SizeValueOrAuto | undefined = autoActive
      ? { value: 0, unit: currentUnit }
      : 'auto';
    fireChange(newVal, e.shiftKey);
  };

  const sliderMin = margin ? -200 : 0;
  const sliderMax = 200;

  return (
    <div
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
        fontSize: '11px',
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

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '3px' }}>
          {presets.flat().map((val, i) => {
            const isActive = numericVal === val && !autoActive;
            return (
              <button
                key={`${val}-${i}`}
                onClick={(e) => setNumeric(val, undefined, e.shiftKey)}
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

      {/* Shift-Tipp */}
      <div style={{
        marginTop: '8px',
        fontSize: '10px',
        color: 'var(--admin-text-muted)',
        textAlign: 'center',
        opacity: 0.7,
      }}>
        ⇧ Shift = beide Seiten gleichzeitig
      </div>
    </div>
  );
};

// ===== BORDER AREA (full-width/height clickable + draggable strip) =====

interface BorderAreaProps {
  property: SpacingProperty;
  value: SizeValueOrAuto | SizeValue | undefined;
  position: 'top' | 'right' | 'bottom' | 'left';
  isActive: boolean;
  isDragging: boolean;
  isMargin: boolean;
  onMouseDown: (prop: SpacingProperty, e: React.MouseEvent) => void;
  posStyle: React.CSSProperties;
}

const BorderArea: React.FC<BorderAreaProps> = ({
  property,
  value,
  position,
  isActive,
  isDragging,
  isMargin,
  onMouseDown,
  posStyle,
}) => {
  const [hovered, setHovered] = useState(false);
  const display = getDisplayText(value);
  const hasValue = value !== undefined && value !== null;
  const isVert = position === 'top' || position === 'bottom';

  let bg: string;
  if (isActive || isDragging) bg = ACTIVE_TINT;
  else if (hovered) bg = isMargin ? MARGIN_TINT_HOVER : PADDING_TINT_HOVER;
  else bg = isMargin ? MARGIN_TINT : PADDING_TINT;

  return (
    <div
      onMouseDown={(e) => onMouseDown(property, e)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isVert ? 'ns-resize' : 'ew-resize',
        backgroundColor: bg,
        transition: 'background-color 0.1s',
        userSelect: 'none',
        zIndex: 2,
        ...posStyle,
      }}
    >
      <span
        style={{
          fontSize: '11px',
          fontWeight: isActive ? 700 : 400,
          color: isActive
            ? '#3b82f6'
            : hasValue
              ? 'var(--admin-text)'
              : 'var(--admin-text-muted)',
          pointerEvents: 'none',
        }}
      >
        {display}
      </span>
    </div>
  );
};

// ===== MAIN COMPONENT =====

export const SpacingBox: React.FC<SpacingBoxProps> = ({ styles, onChange }) => {
  const [activeProperty, setActiveProperty] = useState<SpacingProperty | null>(null);
  const [dragging, setDragging] = useState<SpacingProperty | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const shiftRef = useRef(false);

  // Track Shift key globally
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Shift') shiftRef.current = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === 'Shift') shiftRef.current = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!activeProperty) return;
    const handler = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setActiveProperty(null);
      }
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handler);
    };
  }, [activeProperty]);

  // ── Value getters ──

  const getVal = useCallback(
    (prop: SpacingProperty): SizeValueOrAuto | SizeValue | undefined => {
      const v = styles[prop];
      if (v === 'auto') return 'auto';
      if (typeof v === 'object' && v !== null) return v as SizeValue;
      return undefined;
    },
    [styles],
  );

  // ── Drag + click handler ──

  const handleMouseDown = useCallback(
    (prop: SpacingProperty, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startY = e.clientY;
      const val = getVal(prop);
      const startValue = getNumericValue(val);
      const unit = getUnit(val);
      let didDrag = false;

      const prevCursor = document.body.style.cursor;
      const prevSelect = document.body.style.userSelect;

      const onMouseMove = (moveE: MouseEvent) => {
        const dx = moveE.clientX - startX;
        const dy = moveE.clientY - startY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Start dragging after 3px threshold
        if (!didDrag && dist > 3) {
          didDrag = true;
          setDragging(prop);
          setActiveProperty(prop);
          document.body.style.cursor = isVerticalProp(prop) ? 'ns-resize' : 'ew-resize';
          document.body.style.userSelect = 'none';
        }

        if (didDrag) {
          const vertical = isVerticalProp(prop);
          let pixelDelta: number;

          if (vertical) {
            // top: mouse-up = increase | bottom: mouse-down = increase
            pixelDelta = prop.endsWith('Top')
              ? startY - moveE.clientY
              : moveE.clientY - startY;
          } else {
            // left: mouse-left = increase | right: mouse-right = increase
            pixelDelta = prop.endsWith('Left')
              ? startX - moveE.clientX
              : moveE.clientX - startX;
          }

          const newValue = Math.round(startValue + pixelDelta * DRAG_MULTIPLIER);
          // Padding min is 0, margin has no limits
          const clamped = isMarginProp(prop) ? newValue : Math.max(0, newValue);

          onChange(prop, { value: clamped, unit });

          // Shift = change opposite side simultaneously
          if (moveE.shiftKey) {
            const oppProp = getOppositeProperty(prop);
            const oppUnit = getUnit(getVal(oppProp));
            const oppClamped = isMarginProp(oppProp) ? newValue : Math.max(0, newValue);
            onChange(oppProp, { value: oppClamped, unit: oppUnit });
          }
        }
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.cursor = prevCursor;
        document.body.style.userSelect = prevSelect;

        if (!didDrag) {
          // Was a click → toggle dropdown
          setActiveProperty((prev) => (prev === prop ? null : prop));
        }

        // Small delay so click handler doesn't fire after drag
        setTimeout(() => setDragging(null), 50);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [getVal, onChange],
  );

  // ── Dropdown change handlers ──

  const handleDropdownChange = useCallback(
    (val: SizeValueOrAuto | SizeValue | undefined) => {
      if (activeProperty) onChange(activeProperty, val);
    },
    [activeProperty, onChange],
  );

  const handleOppositeChange = useCallback(
    (val: SizeValueOrAuto | SizeValue | undefined) => {
      if (activeProperty) onChange(getOppositeProperty(activeProperty), val);
    },
    [activeProperty, onChange],
  );

  // ── Helper to render 4 border areas ──

  const renderBorderAreas = (
    props: [SpacingProperty, SpacingProperty, SpacingProperty, SpacingProperty],
    isMargin: boolean,
    stripH: number,
    stripW: number,
  ) => {
    const [top, right, bottom, left] = props;

    return (
      <>
        {/* Top strip — full width */}
        <BorderArea
          property={top}
          value={getVal(top)}
          position="top"
          isActive={activeProperty === top}
          isDragging={dragging === top}
          isMargin={isMargin}
          onMouseDown={handleMouseDown}
          posStyle={{ top: 0, left: 0, right: 0, height: stripH }}
        />
        {/* Bottom strip — full width */}
        <BorderArea
          property={bottom}
          value={getVal(bottom)}
          position="bottom"
          isActive={activeProperty === bottom}
          isDragging={dragging === bottom}
          isMargin={isMargin}
          onMouseDown={handleMouseDown}
          posStyle={{ bottom: 0, left: 0, right: 0, height: stripH }}
        />
        {/* Left strip — between top/bottom */}
        <BorderArea
          property={left}
          value={getVal(left)}
          position="left"
          isActive={activeProperty === left}
          isDragging={dragging === left}
          isMargin={isMargin}
          onMouseDown={handleMouseDown}
          posStyle={{ top: stripH, bottom: stripH, left: 0, width: stripW }}
        />
        {/* Right strip — between top/bottom */}
        <BorderArea
          property={right}
          value={getVal(right)}
          position="right"
          isActive={activeProperty === right}
          isDragging={dragging === right}
          isMargin={isMargin}
          onMouseDown={handleMouseDown}
          posStyle={{ top: stripH, bottom: stripH, right: 0, width: stripW }}
        />
      </>
    );
  };

  return (
    <div ref={boxRef} style={{ padding: '4px 0' }}>
      {/* ── BOX MODEL VISUALIZATION ── */}
      <div
        style={{
          position: 'relative',
          backgroundColor: 'var(--admin-bg-card)',
          border: '1px solid var(--admin-border)',
          borderRadius: '6px',
          overflow: 'hidden',
        }}
      >
        {/* "Margin" label */}
        <span
          style={{
            position: 'absolute',
            top: '3px',
            left: '6px',
            fontSize: '9px',
            color: 'var(--admin-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            pointerEvents: 'none',
            zIndex: 3,
          }}
        >
          Margin
        </span>

        {/* Margin border areas */}
        {renderBorderAreas(
          ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'],
          true,
          MARGIN_STRIP_H,
          MARGIN_STRIP_W,
        )}

        {/* ── Padding box (inner) ── */}
        <div
          style={{
            position: 'relative',
            margin: `${MARGIN_STRIP_H}px ${MARGIN_STRIP_W}px`,
            backgroundColor: 'var(--admin-bg-input)',
            border: '1px solid var(--admin-border)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          {/* "Padding" label */}
          <span
            style={{
              position: 'absolute',
              top: '2px',
              left: '6px',
              fontSize: '9px',
              color: 'var(--admin-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              pointerEvents: 'none',
              zIndex: 3,
            }}
          >
            Padding
          </span>

          {/* Padding border areas */}
          {renderBorderAreas(
            ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
            false,
            PADDING_STRIP_H,
            PADDING_STRIP_W,
          )}

          {/* Content indicator (center) */}
          <div
            style={{
              margin: `${PADDING_STRIP_H}px ${PADDING_STRIP_W}px`,
              height: '20px',
              backgroundColor: 'var(--admin-bg)',
              borderRadius: '2px',
              border: '1px dashed var(--admin-border-strong)',
            }}
          />
        </div>
      </div>

      {/* ── DROPDOWN (appears below box model) ── */}
      {activeProperty && (
        <SpacingDropdown
          property={activeProperty}
          value={getVal(activeProperty)}
          onChange={handleDropdownChange}
          onOppositeChange={handleOppositeChange}
          shiftRef={shiftRef}
        />
      )}
    </div>
  );
};
