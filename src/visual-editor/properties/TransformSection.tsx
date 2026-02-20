// =====================================================
// VISUAL EDITOR – TRANSFORM SECTION (Phase 2)
// Properties Panel: Translate, Scale, Rotate, Transform Origin
// Kein Skew – vom Nutzer bewusst ausgeschlossen
// =====================================================

import React, { useState, useCallback, useEffect } from 'react';
import { RotateCw, Move, Maximize2 } from 'lucide-react';
import type { StyleProperties } from '../types/styles';

interface TransformSectionProps {
  styles: Partial<StyleProperties>;
  onChange: (key: keyof StyleProperties, value: any) => void;
}

// ===== TRANSFORM PARSER =====

interface TransformValues {
  translateX: number;
  translateXUnit: 'px' | '%';
  translateY: number;
  translateYUnit: 'px' | '%';
  scaleX: number;
  scaleY: number;
  rotate: number;
}

const DEFAULT_TRANSFORM: TransformValues = {
  translateX: 0,
  translateXUnit: 'px',
  translateY: 0,
  translateYUnit: 'px',
  scaleX: 1,
  scaleY: 1,
  rotate: 0,
};

function parseTransform(raw: string | undefined): TransformValues {
  if (!raw) return { ...DEFAULT_TRANSFORM };

  const result: TransformValues = { ...DEFAULT_TRANSFORM };

  // translateX
  const txMatch = raw.match(/translateX\(\s*([-\d.]+)(px|%)\s*\)/);
  if (txMatch) {
    result.translateX = parseFloat(txMatch[1]);
    result.translateXUnit = txMatch[2] as 'px' | '%';
  }

  // translateY
  const tyMatch = raw.match(/translateY\(\s*([-\d.]+)(px|%)\s*\)/);
  if (tyMatch) {
    result.translateY = parseFloat(tyMatch[1]);
    result.translateYUnit = tyMatch[2] as 'px' | '%';
  }

  // scaleX
  const sxMatch = raw.match(/scaleX\(\s*([-\d.]+)\s*\)/);
  if (sxMatch) result.scaleX = parseFloat(sxMatch[1]);

  // scaleY
  const syMatch = raw.match(/scaleY\(\s*([-\d.]+)\s*\)/);
  if (syMatch) result.scaleY = parseFloat(syMatch[1]);

  // scale (uniform)
  const scaleMatch = raw.match(/scale\(\s*([-\d.]+)\s*\)/);
  if (scaleMatch && !sxMatch && !syMatch) {
    result.scaleX = parseFloat(scaleMatch[1]);
    result.scaleY = parseFloat(scaleMatch[1]);
  }

  // rotate
  const rotMatch = raw.match(/rotate\(\s*([-\d.]+)deg\s*\)/);
  if (rotMatch) result.rotate = parseFloat(rotMatch[1]);

  return result;
}

function buildTransform(vals: TransformValues): string | undefined {
  const parts: string[] = [];

  if (vals.translateX !== 0) parts.push(`translateX(${vals.translateX}${vals.translateXUnit})`);
  if (vals.translateY !== 0) parts.push(`translateY(${vals.translateY}${vals.translateYUnit})`);
  if (vals.scaleX !== 1 || vals.scaleY !== 1) {
    if (vals.scaleX === vals.scaleY) {
      parts.push(`scale(${vals.scaleX})`);
    } else {
      parts.push(`scaleX(${vals.scaleX})`);
      parts.push(`scaleY(${vals.scaleY})`);
    }
  }
  if (vals.rotate !== 0) parts.push(`rotate(${vals.rotate}deg)`);

  return parts.length > 0 ? parts.join(' ') : undefined;
}

// ===== SLIDER ROW =====

const SliderRow: React.FC<{
  label: string;
  icon?: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit?: string;
  unitOptions?: string[];
  currentUnit?: string;
  onUnitChange?: (u: string) => void;
  onChange: (v: number) => void;
}> = ({ label, icon, value, min, max, step, defaultValue, unit, unitOptions, currentUnit, onUnitChange, onChange }) => (
  <div style={{ marginBottom: '8px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
      {icon && <span style={{ color: 'var(--admin-text-icon)', display: 'flex' }}>{icon}</span>}
      <span style={{ fontSize: '10px', color: 'var(--admin-text-icon)', flex: 1, fontWeight: 500 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(parseFloat(e.target.value) || defaultValue)}
          style={{
            width: '52px',
            padding: '3px 4px',
            backgroundColor: 'var(--admin-bg-input)',
            border: '1px solid var(--admin-border-strong)',
            borderRadius: '3px',
            color: 'var(--admin-text)',
            fontSize: '11px',
            textAlign: 'right',
          }}
        />
        {unitOptions && onUnitChange ? (
          <select
            value={currentUnit || 'px'}
            onChange={(e) => onUnitChange(e.target.value)}
            style={{
              padding: '3px 2px',
              backgroundColor: 'var(--admin-bg-input)',
              border: '1px solid var(--admin-border-strong)',
              borderRadius: '3px',
              color: 'var(--admin-text-icon)',
              fontSize: '10px',
              cursor: 'pointer',
            }}
          >
            {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        ) : unit ? (
          <span style={{ fontSize: '10px', color: 'var(--admin-text-icon)' }}>{unit}</span>
        ) : null}
        {value !== defaultValue && (
          <button
            onClick={() => onChange(defaultValue)}
            title="Zurücksetzen"
            style={{
              padding: '2px 4px',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--admin-text-icon)',
              fontSize: '9px',
              cursor: 'pointer',
            }}
          >
            ↺
          </button>
        )}
      </div>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      style={{
        width: '100%',
        height: '4px',
        accentColor: value !== defaultValue ? '#3b82f6' : '#4a4a5a',
        cursor: 'pointer',
      }}
    />
  </div>
);

// ===== TRANSFORM ORIGIN GRID =====

const ORIGINS = [
  'top left', 'top center', 'top right',
  'center left', 'center center', 'center right',
  'bottom left', 'bottom center', 'bottom right',
];

const OriginGrid: React.FC<{
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}> = ({ value, onChange }) => (
  <div style={{ marginBottom: '8px' }}>
    <span style={{ fontSize: '10px', color: 'var(--admin-text-icon)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>
      Transform Origin
    </span>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', width: '84px' }}>
      {ORIGINS.map((o) => {
        const isActive = (value || 'center center') === o;
        return (
          <button
            key={o}
            title={o}
            onClick={() => onChange(o === 'center center' ? undefined : o)}
            style={{
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isActive ? '#3b82f6' : 'var(--admin-border)',
              border: `1px solid ${isActive ? '#3b82f6' : 'var(--admin-border-strong)'}`,
              borderRadius: '3px',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isActive ? '#fff' : 'var(--admin-text-icon)',
            }} />
          </button>
        );
      })}
    </div>
  </div>
);

// ===== MAIN COMPONENT =====

export const TransformSection: React.FC<TransformSectionProps> = ({ styles, onChange }) => {
  const [vals, setVals] = useState<TransformValues>(() => parseTransform(styles.transform));

  // Sync when external styles change
  useEffect(() => {
    setVals(parseTransform(styles.transform));
  }, [styles.transform]);

  const update = useCallback((patch: Partial<TransformValues>) => {
    const next = { ...vals, ...patch };
    setVals(next);
    onChange('transform', buildTransform(next));
  }, [vals, onChange]);

  const hasTransform = styles.transform !== undefined;

  return (
    <div>
      {/* Translate */}
      <SliderRow
        label="Verschieben X"
        icon={<Move size={11} />}
        value={vals.translateX}
        min={-500}
        max={500}
        step={1}
        defaultValue={0}
        unitOptions={['px', '%']}
        currentUnit={vals.translateXUnit}
        onUnitChange={(u) => update({ translateXUnit: u as 'px' | '%' })}
        onChange={(v) => update({ translateX: v })}
      />

      <SliderRow
        label="Verschieben Y"
        icon={<Move size={11} />}
        value={vals.translateY}
        min={-500}
        max={500}
        step={1}
        defaultValue={0}
        unitOptions={['px', '%']}
        currentUnit={vals.translateYUnit}
        onUnitChange={(u) => update({ translateYUnit: u as 'px' | '%' })}
        onChange={(v) => update({ translateY: v })}
      />

      {/* Scale */}
      <SliderRow
        label="Skalieren X"
        icon={<Maximize2 size={11} />}
        value={vals.scaleX}
        min={0}
        max={3}
        step={0.05}
        defaultValue={1}
        onChange={(v) => update({ scaleX: v })}
      />

      <SliderRow
        label="Skalieren Y"
        icon={<Maximize2 size={11} />}
        value={vals.scaleY}
        min={0}
        max={3}
        step={0.05}
        defaultValue={1}
        onChange={(v) => update({ scaleY: v })}
      />

      {/* Rotate */}
      <SliderRow
        label="Drehen"
        icon={<RotateCw size={11} />}
        value={vals.rotate}
        min={-360}
        max={360}
        step={1}
        defaultValue={0}
        unit="°"
        onChange={(v) => update({ rotate: v })}
      />

      {/* Transform Origin */}
      <OriginGrid
        value={styles.transformOrigin}
        onChange={(v) => onChange('transformOrigin', v)}
      />

      {/* Reset button */}
      {hasTransform && (
        <button
          onClick={() => {
            onChange('transform', undefined);
            onChange('transformOrigin', undefined);
            setVals({ ...DEFAULT_TRANSFORM });
          }}
          style={{
            width: '100%',
            padding: '5px 8px',
            backgroundColor: '#ef444420',
            border: '1px solid #ef444440',
            borderRadius: '4px',
            color: '#f87171',
            fontSize: '11px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Transform zurücksetzen
        </button>
      )}
    </div>
  );
};
