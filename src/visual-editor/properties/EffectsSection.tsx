// =====================================================
// VISUAL EDITOR – EFFECTS SECTION (Phase 2 Upgrade)
// Box-Shadow Builder, Opacity, Overflow, Cursor
// Visueller Shadow-Editor mit Einzelwerten statt Raw-String
// =====================================================

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import type { StyleProperties } from '../types/styles';

interface EffectsSectionProps {
  styles: Partial<StyleProperties>;
  onChange: (key: keyof StyleProperties, value: any) => void;
  /** Pro-Modus: zeigt erweiterte Controls */
  proMode?: boolean;
}

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
    <label style={{ width: '60px', flexShrink: 0, fontSize: '11px', color: '#b0b7c3' }}>{label}</label>
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

// ===== SHADOW VALUE PARSER/BUILDER =====

interface ShadowValue {
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
}

const DEFAULT_SHADOW: ShadowValue = {
  offsetX: 0,
  offsetY: 4,
  blur: 8,
  spread: 0,
  color: 'rgba(0,0,0,0.15)',
  inset: false,
};

function parseSingleShadow(s: string): ShadowValue {
  const trimmed = s.trim();
  const result: ShadowValue = { ...DEFAULT_SHADOW };

  const isInset = trimmed.startsWith('inset');
  result.inset = isInset;
  const withoutInset = isInset ? trimmed.slice(5).trim() : trimmed;

  // Extract color (rgba/rgb/hex/#...)
  const rgbaMatch = withoutInset.match(/rgba?\([^)]+\)/);
  const hexMatch = withoutInset.match(/#[0-9a-fA-F]{3,8}/);
  if (rgbaMatch) {
    result.color = rgbaMatch[0];
  } else if (hexMatch) {
    result.color = hexMatch[0];
  }

  // Extract numbers (px values before the color)
  const colorStr = rgbaMatch?.[0] || hexMatch?.[0] || '';
  const numPart = withoutInset.replace(colorStr, '').trim();
  const nums = numPart.match(/-?\d+(\.\d+)?/g);
  if (nums) {
    if (nums.length >= 1) result.offsetX = parseFloat(nums[0]);
    if (nums.length >= 2) result.offsetY = parseFloat(nums[1]);
    if (nums.length >= 3) result.blur = parseFloat(nums[2]);
    if (nums.length >= 4) result.spread = parseFloat(nums[3]);
  }

  return result;
}

function parseShadows(raw: string | undefined): ShadowValue[] {
  if (!raw || raw.trim() === '') return [];
  // Split by comma but not within parentheses
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of raw) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts.map(parseSingleShadow);
}

function buildShadowCSS(shadows: ShadowValue[]): string | undefined {
  if (shadows.length === 0) return undefined;
  return shadows.map(s => {
    const parts: string[] = [];
    if (s.inset) parts.push('inset');
    parts.push(`${s.offsetX}px`);
    parts.push(`${s.offsetY}px`);
    parts.push(`${s.blur}px`);
    parts.push(`${s.spread}px`);
    parts.push(s.color);
    return parts.join(' ');
  }).join(', ');
}

// ===== SINGLE SHADOW EDITOR =====

const ShadowEditor: React.FC<{
  shadow: ShadowValue;
  index: number;
  onChange: (index: number, shadow: ShadowValue) => void;
  onRemove: (index: number) => void;
}> = ({ shadow, index, onChange, onRemove }) => {
  const [expanded, setExpanded] = useState(true);

  const update = (patch: Partial<ShadowValue>) => {
    onChange(index, { ...shadow, ...patch });
  };

  const sliderInputStyle: React.CSSProperties = {
    width: '46px',
    padding: '2px 4px',
    backgroundColor: '#2d2d3d',
    border: '1px solid #3d3d4d',
    borderRadius: '3px',
    color: '#d1d5db',
    fontSize: '10px',
    textAlign: 'right',
  };

  return (
    <div style={{
      backgroundColor: '#1a1a2a',
      border: '1px solid #3d3d4d',
      borderRadius: '6px',
      marginBottom: '6px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 8px',
          cursor: 'pointer',
          fontSize: '11px',
          color: '#d1d5db',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
        <span style={{ flex: 1, fontWeight: 500 }}>
          Schatten {index + 1} {shadow.inset ? '(inset)' : ''}
        </span>
        {/* Color swatch */}
        <div style={{
          width: '14px',
          height: '14px',
          borderRadius: '3px',
          backgroundColor: shadow.color,
          border: '1px solid #3d3d4d',
          flexShrink: 0,
        }} />
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(index); }}
          style={{
            padding: '2px',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            display: 'flex',
          }}
        >
          <Trash2 size={11} />
        </button>
      </div>

      {/* Body */}
      {expanded && (
        <div style={{ padding: '6px 8px 8px' }}>
          {/* X / Y */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '9px', color: '#b0b7c3', display: 'block', marginBottom: '2px' }}>X</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="range" min={-50} max={50} value={shadow.offsetX}
                  onChange={(e) => update({ offsetX: Number(e.target.value) })}
                  style={{ flex: 1, height: '3px', accentColor: '#3b82f6', cursor: 'pointer' }}
                />
                <input type="number" value={shadow.offsetX}
                  onChange={(e) => update({ offsetX: Number(e.target.value) || 0 })}
                  style={sliderInputStyle}
                />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '9px', color: '#b0b7c3', display: 'block', marginBottom: '2px' }}>Y</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="range" min={-50} max={50} value={shadow.offsetY}
                  onChange={(e) => update({ offsetY: Number(e.target.value) })}
                  style={{ flex: 1, height: '3px', accentColor: '#3b82f6', cursor: 'pointer' }}
                />
                <input type="number" value={shadow.offsetY}
                  onChange={(e) => update({ offsetY: Number(e.target.value) || 0 })}
                  style={sliderInputStyle}
                />
              </div>
            </div>
          </div>

          {/* Blur / Spread */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '9px', color: '#b0b7c3', display: 'block', marginBottom: '2px' }}>Blur</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="range" min={0} max={100} value={shadow.blur}
                  onChange={(e) => update({ blur: Number(e.target.value) })}
                  style={{ flex: 1, height: '3px', accentColor: '#3b82f6', cursor: 'pointer' }}
                />
                <input type="number" value={shadow.blur} min={0}
                  onChange={(e) => update({ blur: Math.max(0, Number(e.target.value) || 0) })}
                  style={sliderInputStyle}
                />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '9px', color: '#b0b7c3', display: 'block', marginBottom: '2px' }}>Spread</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="range" min={-30} max={50} value={shadow.spread}
                  onChange={(e) => update({ spread: Number(e.target.value) })}
                  style={{ flex: 1, height: '3px', accentColor: '#3b82f6', cursor: 'pointer' }}
                />
                <input type="number" value={shadow.spread}
                  onChange={(e) => update({ spread: Number(e.target.value) || 0 })}
                  style={sliderInputStyle}
                />
              </div>
            </div>
          </div>

          {/* Color */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <label style={{ fontSize: '9px', color: '#b0b7c3', width: '32px' }}>Farbe</label>
            <input
              type="color"
              value={shadow.color.startsWith('#') ? shadow.color : '#000000'}
              onChange={(e) => update({ color: e.target.value })}
              style={{ width: '26px', height: '22px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', padding: 0 }}
            />
            <input
              type="text"
              value={shadow.color}
              onChange={(e) => update({ color: e.target.value })}
              style={{
                flex: 1,
                padding: '3px 6px',
                backgroundColor: '#2d2d3d',
                border: '1px solid #3d3d4d',
                borderRadius: '3px',
                color: '#d1d5db',
                fontSize: '10px',
                fontFamily: 'monospace',
              }}
            />
          </div>

          {/* Inset toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '10px', color: '#b0b7c3' }}>
            <input
              type="checkbox"
              checked={shadow.inset}
              onChange={(e) => update({ inset: e.target.checked })}
              style={{ accentColor: '#3b82f6', cursor: 'pointer' }}
            />
            Inset (innerer Schatten)
          </label>
        </div>
      )}
    </div>
  );
};

// ===== MAIN COMPONENT =====

export const EffectsSection: React.FC<EffectsSectionProps> = ({ styles, onChange, proMode = false }) => {
  const [shadows, setShadows] = useState<ShadowValue[]>(() => parseShadows(styles.boxShadow));
  const [showBuilder, setShowBuilder] = useState(false);

  // Sync when external styles change
  useEffect(() => {
    setShadows(parseShadows(styles.boxShadow));
  }, [styles.boxShadow]);

  const commitShadows = useCallback((newShadows: ShadowValue[]) => {
    setShadows(newShadows);
    onChange('boxShadow', buildShadowCSS(newShadows));
  }, [onChange]);

  const updateShadow = useCallback((index: number, shadow: ShadowValue) => {
    const next = [...shadows];
    next[index] = shadow;
    commitShadows(next);
  }, [shadows, commitShadows]);

  const removeShadow = useCallback((index: number) => {
    commitShadows(shadows.filter((_, i) => i !== index));
  }, [shadows, commitShadows]);

  const addShadow = useCallback(() => {
    commitShadows([...shadows, { ...DEFAULT_SHADOW }]);
    setShowBuilder(true);
  }, [shadows, commitShadows]);

  // Find which preset matches (if any)
  const currentPreset = SHADOW_PRESETS.find((p) => p.value === (styles.boxShadow || ''));
  const opacityPercent = styles.opacity !== undefined ? Math.round(styles.opacity * 100) : 100;

  return (
    <div>
      {/* Opacity */}
      <label style={{ fontSize: '11px', color: '#b0b7c3', display: 'block', marginBottom: '6px' }}>
        Opacity
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <input
          type="range"
          min={0}
          max={100}
          value={opacityPercent}
          onChange={(e) => onChange('opacity', Number(e.target.value) / 100)}
          style={{
            flex: 1,
            height: '4px',
            accentColor: '#3b82f6',
            cursor: 'pointer',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <input
            type="number"
            min={0}
            max={100}
            value={opacityPercent}
            onChange={(e) => {
              const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
              onChange('opacity', val / 100);
            }}
            style={{
              width: '42px',
              padding: '3px 4px',
              backgroundColor: '#2d2d3d',
              border: '1px solid #3d3d4d',
              borderRadius: '3px',
              color: '#d1d5db',
              fontSize: '11px',
              textAlign: 'right',
            }}
          />
          <span style={{ fontSize: '10px', color: '#b0b7c3' }}>%</span>
        </div>
      </div>

      {/* Box Shadow */}
      <label style={{ fontSize: '11px', color: '#b0b7c3', display: 'block', marginBottom: '6px' }}>
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
              color: currentPreset?.label === preset.label ? '#fff' : '#b0b7c3',
              fontSize: '10px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Shadow Builder Toggle */}
      {proMode && (
        <button
          onClick={() => setShowBuilder(!showBuilder)}
          style={{
            width: '100%',
            padding: '5px 8px',
            marginBottom: '8px',
            backgroundColor: showBuilder ? '#3b82f615' : '#2d2d3d',
            border: `1px solid ${showBuilder ? '#3b82f650' : '#3d3d4d'}`,
            borderRadius: '4px',
            color: showBuilder ? '#60a5fa' : '#b0b7c3',
            fontSize: '10px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>⚙ Shadow Builder ({shadows.length})</span>
          {showBuilder ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
        </button>
      )}

      {/* Visual Shadow Builder (Pro only) */}
      {proMode && showBuilder && (
        <div style={{ marginBottom: '8px' }}>
          {shadows.map((shadow, i) => (
            <ShadowEditor
              key={i}
              shadow={shadow}
              index={i}
              onChange={updateShadow}
              onRemove={removeShadow}
            />
          ))}
          <button
            onClick={addShadow}
            style={{
              width: '100%',
              padding: '5px 8px',
              backgroundColor: '#2d2d3d',
              border: '1px dashed #3d3d4d',
              borderRadius: '4px',
              color: '#b0b7c3',
              fontSize: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <Plus size={10} /> Schatten hinzufügen
          </button>
        </div>
      )}

      {/* Custom CSS input (Pro only) */}
      {proMode && (
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
      )}

      {/* Overflow (Pro only) */}
      {proMode && (
        <>
          <label style={{ fontSize: '11px', color: '#b0b7c3', display: 'block', marginBottom: '6px' }}>
            Overflow
          </label>
          <Row label="Alle">
            <div style={{ display: 'flex', gap: '2px' }}>
              {(['visible', 'hidden', 'scroll', 'auto'] as const).map((val) => (
                <button
                  key={val}
                  onClick={() => onChange('overflow', styles.overflow === val ? undefined : val)}
                  style={{
                    flex: 1,
                    padding: '3px 4px',
                    backgroundColor: styles.overflow === val ? '#3b82f6' : '#2d2d3d',
                    border: '1px solid ' + (styles.overflow === val ? '#3b82f6' : '#3d3d4d'),
                    borderRadius: '3px',
                    color: styles.overflow === val ? '#fff' : '#b0b7c3',
                    fontSize: '10px',
                    cursor: 'pointer',
                    fontWeight: 500,
                    textTransform: 'capitalize',
                  }}
                >
                  {val}
                </button>
              ))}
            </div>
          </Row>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '12px' }}>
            <Row label="X">
              <select
                value={styles.overflowX ?? ''}
                onChange={(e) => onChange('overflowX', e.target.value || undefined)}
                style={{
                  width: '100%',
                  padding: '4px 6px',
                  backgroundColor: '#2d2d3d',
                  border: '1px solid #3d3d4d',
                  borderRadius: '4px',
                  color: '#d1d5db',
                  fontSize: '11px',
                }}
              >
                <option value="">–</option>
                <option value="visible">visible</option>
                <option value="hidden">hidden</option>
                <option value="scroll">scroll</option>
                <option value="auto">auto</option>
              </select>
            </Row>
            <Row label="Y">
              <select
                value={styles.overflowY ?? ''}
                onChange={(e) => onChange('overflowY', e.target.value || undefined)}
                style={{
                  width: '100%',
                  padding: '4px 6px',
                  backgroundColor: '#2d2d3d',
                  border: '1px solid #3d3d4d',
                  borderRadius: '4px',
                  color: '#d1d5db',
                  fontSize: '11px',
                }}
              >
                <option value="">–</option>
                <option value="visible">visible</option>
                <option value="hidden">hidden</option>
                <option value="scroll">scroll</option>
                <option value="auto">auto</option>
              </select>
            </Row>
          </div>
        </>
      )}

      {/* Cursor (Pro only) */}
      {proMode && (
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
      )}
    </div>
  );
};
