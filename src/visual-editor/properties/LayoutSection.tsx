// =====================================================
// VISUAL EDITOR – LAYOUT SECTION
// Properties Panel: Display, Flex, Grid (Webflow-Style)
// Phase 1: Visueller Grid-Builder, Flex/Grid Align/Justify
// =====================================================

import React, { useState, useCallback } from 'react';
import {
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignHorizontalSpaceBetween,
  AlignHorizontalSpaceAround,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Columns,
  Rows,
  LayoutGrid,
  Minus,
  EyeOff,
  Plus,
  X,
  StretchHorizontal,
} from 'lucide-react';
import type { StyleProperties } from '../types/styles';
import { UnitInput } from '../components/UnitInput';

interface LayoutSectionProps {
  styles: Partial<StyleProperties>;
  onChange: (key: keyof StyleProperties, value: any) => void;
}

// ===== ICON BUTTON GROUP =====

interface IconButtonOption<T extends string> {
  value: T;
  icon: React.ReactNode;
  title: string;
}

function IconButtonGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: IconButtonOption<T>[];
  value: T | undefined;
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: '2px', backgroundColor: '#1a1a2a', borderRadius: '4px', padding: '2px' }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          title={opt.title}
          onClick={() => onChange(opt.value)}
          style={{
            width: '28px',
            height: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: value === opt.value ? '#3b82f6' : 'transparent',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            color: value === opt.value ? '#fff' : '#b0b7c3',
            transition: 'all 0.1s',
          }}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}

// ===== ROW COMPONENT =====

const Row: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
    <label style={{ width: '72px', flexShrink: 0, fontSize: '11px', color: '#b0b7c3' }}>{label}</label>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

// ===== GRID TRACK PARSER / BUILDER =====

interface GridTrack {
  value: number;
  unit: 'fr' | 'px' | '%' | 'auto' | 'minmax';
  minmax?: string; // For minmax() tracks
}

function parseGridTracks(template: string | undefined): GridTrack[] {
  if (!template || !template.trim()) return [];
  const parts = template.trim().split(/\s+/);
  return parts.map((part) => {
    if (part === 'auto') return { value: 0, unit: 'auto' as const };
    if (part.endsWith('fr')) return { value: parseFloat(part) || 1, unit: 'fr' as const };
    if (part.endsWith('px')) return { value: parseFloat(part) || 0, unit: 'px' as const };
    if (part.endsWith('%')) return { value: parseFloat(part) || 0, unit: '%' as const };
    if (part.startsWith('minmax')) return { value: 0, unit: 'minmax' as const, minmax: part };
    return { value: parseFloat(part) || 1, unit: 'fr' as const };
  });
}

function tracksToCSS(tracks: GridTrack[]): string {
  return tracks.map((t) => {
    if (t.unit === 'auto') return 'auto';
    if (t.unit === 'minmax' && t.minmax) return t.minmax;
    return `${t.value}${t.unit}`;
  }).join(' ');
}

// ===== GRID TRACK EDITOR =====

const GridTrackEditor: React.FC<{
  label: string;
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}> = ({ label, value, onChange }) => {
  const tracks = parseGridTracks(value);
  const [showRaw, setShowRaw] = useState(false);

  const updateTrack = useCallback((index: number, field: keyof GridTrack, val: any) => {
    const newTracks = [...tracks];
    newTracks[index] = { ...newTracks[index], [field]: val };
    onChange(tracksToCSS(newTracks) || undefined);
  }, [tracks, onChange]);

  const addTrack = useCallback(() => {
    const newTracks = [...tracks, { value: 1, unit: 'fr' as const }];
    onChange(tracksToCSS(newTracks));
  }, [tracks, onChange]);

  const removeTrack = useCallback((index: number) => {
    const newTracks = tracks.filter((_, i) => i !== index);
    onChange(newTracks.length > 0 ? tracksToCSS(newTracks) : undefined);
  }, [tracks, onChange]);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '4px 8px',
    backgroundColor: '#2d2d3d',
    border: '1px solid #3d3d4d',
    borderRadius: '4px',
    color: '#d1d5db',
    fontSize: '12px',
  };

  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <label style={{ fontSize: '11px', color: '#b0b7c3' }}>{label}</label>
        <div style={{ display: 'flex', gap: '2px' }}>
          <button
            onClick={() => setShowRaw(!showRaw)}
            title={showRaw ? 'Visuell' : 'CSS-Text'}
            style={{
              padding: '2px 6px',
              backgroundColor: showRaw ? '#3b82f620' : 'transparent',
              border: '1px solid #3d3d4d',
              borderRadius: '3px',
              color: showRaw ? '#3b82f6' : '#b0b7c3',
              fontSize: '9px',
              cursor: 'pointer',
              fontFamily: 'monospace',
            }}
          >
            CSS
          </button>
          {!showRaw && (
            <button
              onClick={addTrack}
              title="Track hinzufügen"
              style={{
                padding: '2px 4px',
                backgroundColor: 'transparent',
                border: '1px solid #3d3d4d',
                borderRadius: '3px',
                color: '#b0b7c3',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Plus size={10} />
            </button>
          )}
        </div>
      </div>

      {showRaw ? (
        /* Raw CSS input */
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value || undefined)}
          placeholder={label === 'Columns' ? '1fr 1fr 1fr' : 'auto'}
          style={inputStyle}
        />
      ) : (
        /* Visual track list */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {tracks.length === 0 && (
            <div
              style={{ fontSize: '11px', color: '#9ca3af', padding: '4px 0', cursor: 'pointer' }}
              onClick={addTrack}
            >
              + Track hinzufügen
            </div>
          )}
          {tracks.map((track, i) => (
            <div key={i} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              {/* Track value */}
              {track.unit !== 'auto' && track.unit !== 'minmax' && (
                <input
                  type="number"
                  value={track.value}
                  onChange={(e) => updateTrack(i, 'value', parseFloat(e.target.value) || 0)}
                  min={0}
                  step={track.unit === 'fr' ? 0.5 : 1}
                  style={{
                    width: '52px',
                    padding: '3px 6px',
                    backgroundColor: '#2d2d3d',
                    border: '1px solid #3d3d4d',
                    borderRadius: '3px',
                    color: '#d1d5db',
                    fontSize: '11px',
                  }}
                />
              )}
              {/* Unit selector */}
              <select
                value={track.unit}
                onChange={(e) => {
                  const newUnit = e.target.value as GridTrack['unit'];
                  if (newUnit === 'auto') {
                    updateTrack(i, 'unit', 'auto');
                    updateTrack(i, 'value', 0);
                  } else {
                    const newTracks = [...tracks];
                    newTracks[i] = { value: newUnit === 'fr' ? 1 : 100, unit: newUnit };
                    onChange(tracksToCSS(newTracks));
                  }
                }}
                style={{
                  flex: 1,
                  padding: '3px 4px',
                  backgroundColor: '#2d2d3d',
                  border: '1px solid #3d3d4d',
                  borderRadius: '3px',
                  color: '#d1d5db',
                  fontSize: '11px',
                }}
              >
                <option value="fr">fr</option>
                <option value="px">px</option>
                <option value="%">%</option>
                <option value="auto">auto</option>
              </select>
              {/* Visual proportion bar */}
              <div
                style={{
                  width: '32px',
                  height: '12px',
                  backgroundColor: '#3b82f630',
                  border: '1px solid #3b82f650',
                  borderRadius: '2px',
                  flexShrink: 0,
                }}
              />
              {/* Remove button */}
              <button
                onClick={() => removeTrack(i)}
                title="Entfernen"
                style={{
                  padding: '2px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#b0b7c3',
                  cursor: 'pointer',
                  display: 'flex',
                  flexShrink: 0,
                }}
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Column preset buttons for quick setup */}
      {label === 'Columns' && !showRaw && (
        <div style={{ display: 'flex', gap: '2px', marginTop: '6px', flexWrap: 'wrap' }}>
          {[
            { label: '1', css: '1fr' },
            { label: '2', css: '1fr 1fr' },
            { label: '3', css: '1fr 1fr 1fr' },
            { label: '4', css: '1fr 1fr 1fr 1fr' },
            { label: '1+2', css: '1fr 2fr' },
            { label: '2+1', css: '2fr 1fr' },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => onChange(preset.css)}
              title={preset.css}
              style={{
                padding: '2px 7px',
                backgroundColor: value === preset.css ? '#3b82f6' : '#2d2d3d',
                border: '1px solid ' + (value === preset.css ? '#3b82f6' : '#3d3d4d'),
                borderRadius: '3px',
                color: value === preset.css ? '#fff' : '#b0b7c3',
                fontSize: '10px',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ===== VISUAL GRID PREVIEW =====

/**
 * Klickbares Grid-Vorschau-Panel.
 * Zeigt die aktuelle Grid-Aufteilung als Zellen-Umrisse an.
 * Man kann über ein max. 6×4 Raster hovern und klicken, um cols×rows direkt zu setzen.
 */
const GridPreview: React.FC<{
  columns: string | undefined;
  rows: string | undefined;
  onSelect: (cols: number, rows: number) => void;
}> = ({ columns, rows, onSelect }) => {
  const [hoverCol, setHoverCol] = useState<number>(0);
  const [hoverRow, setHoverRow] = useState<number>(0);

  const maxCols = 6;
  const maxRows = 4;

  // Parse current column/row count
  const currentCols = columns ? columns.trim().split(/\s+/).length : 0;
  const currentRows = rows ? rows.trim().split(/\s+/).length : 0;

  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <label style={{ fontSize: '10px', color: '#b0b7c3' }}>Schnellauswahl</label>
        {(hoverCol > 0 && hoverRow > 0) ? (
          <span style={{ fontSize: '10px', color: '#3b82f6', fontWeight: 600 }}>
            {hoverCol} × {hoverRow}
          </span>
        ) : currentCols > 0 && currentRows > 0 ? (
          <span style={{ fontSize: '10px', color: '#b0b7c3' }}>
            {currentCols} × {currentRows}
          </span>
        ) : null}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${maxCols}, 1fr)`,
          gridTemplateRows: `repeat(${maxRows}, 1fr)`,
          gap: '3px',
          padding: '6px',
          backgroundColor: '#1a1a2a',
          borderRadius: '6px',
          aspectRatio: `${maxCols} / ${maxRows * 0.7}`,
        }}
        onMouseLeave={() => { setHoverCol(0); setHoverRow(0); }}
      >
        {Array.from({ length: maxRows }, (_, rowIdx) =>
          Array.from({ length: maxCols }, (_, colIdx) => {
            const isInHover = hoverCol > 0 && hoverRow > 0 && colIdx < hoverCol && rowIdx < hoverRow;
            const isInCurrent = !isInHover && colIdx < currentCols && rowIdx < currentRows;

            return (
              <div
                key={`${colIdx}-${rowIdx}`}
                onMouseEnter={() => { setHoverCol(colIdx + 1); setHoverRow(rowIdx + 1); }}
                onClick={() => onSelect(colIdx + 1, rowIdx + 1)}
                style={{
                  borderRadius: '2px',
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                  border: isInHover
                    ? '1.5px solid #3b82f6'
                    : isInCurrent
                    ? '1.5px solid #3b82f680'
                    : '1px solid #3d3d4d',
                  backgroundColor: isInHover
                    ? '#3b82f625'
                    : isInCurrent
                    ? '#3b82f610'
                    : 'transparent',
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

// ===== GRID QUICK PRESETS (responsive) =====

const GRID_PRESETS = [
  { label: '3×2 → 2×3 → 1×6', desktop: { cols: '1fr 1fr 1fr', rows: '1fr 1fr' }, tablet: { cols: '1fr 1fr', rows: '1fr 1fr 1fr' }, mobile: { cols: '1fr', rows: 'auto auto auto auto auto auto' }, desc: 'Desktop 3 Spalten, Tablet 2, Mobile 1' },
  { label: '4×1 → 2×2 → 1×4', desktop: { cols: '1fr 1fr 1fr 1fr', rows: '1fr' }, tablet: { cols: '1fr 1fr', rows: '1fr 1fr' }, mobile: { cols: '1fr', rows: 'auto auto auto auto' }, desc: 'Desktop 4, Tablet 2, Mobile 1' },
  { label: '2×1 → 1×2', desktop: { cols: '1fr 1fr', rows: '1fr' }, tablet: { cols: '1fr 1fr', rows: '1fr' }, mobile: { cols: '1fr', rows: 'auto auto' }, desc: 'Desktop 2, Mobile 1' },
  { label: '3×1 → 1×3', desktop: { cols: '1fr 1fr 1fr', rows: '1fr' }, tablet: { cols: '1fr 1fr 1fr', rows: '1fr' }, mobile: { cols: '1fr', rows: 'auto auto auto' }, desc: 'Desktop 3, Mobile 1' },
];

const GridQuickPresets: React.FC<{
  columns: string | undefined;
  rows: string | undefined;
  onApply: (cols: string, rows: string) => void;
}> = ({ columns, rows, onApply }) => {
  return (
    <div style={{ marginBottom: '10px' }}>
      <label style={{ fontSize: '10px', color: '#b0b7c3', display: 'block', marginBottom: '4px' }}>
        Responsive Vorlagen
      </label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {GRID_PRESETS.map((preset) => {
          const isActive = columns === preset.desktop.cols && rows === preset.desktop.rows;
          return (
            <button
              key={preset.label}
              onClick={() => onApply(preset.desktop.cols, preset.desktop.rows)}
              title={preset.desc}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '5px 8px',
                backgroundColor: isActive ? '#3b82f615' : '#2d2d3d',
                border: `1px solid ${isActive ? '#3b82f650' : '#3d3d4d'}`,
                borderRadius: '4px',
                cursor: 'pointer',
                color: isActive ? '#93bbfc' : '#b0b7c3',
                fontSize: '11px',
                fontWeight: 500,
                textAlign: 'left',
                gap: '8px',
              }}
            >
              <span>{preset.label}</span>
              {/* Mini-Vorschau: 3 Viewport-Icons */}
              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                {[preset.desktop, preset.tablet, preset.mobile].map((vp, i) => {
                  const colCount = vp.cols.trim().split(/\s+/).length;
                  const rowCount = vp.rows.trim().split(/\s+/).length;
                  return (
                    <div
                      key={i}
                      title={['Desktop', 'Tablet', 'Mobile'][i]}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${colCount}, 1fr)`,
                        gridTemplateRows: `repeat(${Math.min(rowCount, 3)}, 1fr)`,
                        gap: '1px',
                        width: i === 0 ? '20px' : i === 1 ? '16px' : '10px',
                        height: '14px',
                      }}
                    >
                      {Array.from({ length: colCount * Math.min(rowCount, 3) }, (_, j) => (
                        <div
                          key={j}
                          style={{
                            backgroundColor: isActive ? '#3b82f640' : '#b0b7c330',
                            borderRadius: '0.5px',
                          }}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ===== SECTION LABEL =====

const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <div style={{
    fontSize: '10px',
    color: '#b0b7c3',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginTop: '10px',
    marginBottom: '6px',
    paddingTop: '6px',
    borderTop: '1px solid #2d2d3d',
  }}>
    {label}
  </div>
);

// ===== COMPONENT =====

export const LayoutSection: React.FC<LayoutSectionProps> = ({ styles, onChange }) => {
  const sz = 13;

  const displayOptions: IconButtonOption<NonNullable<StyleProperties['display']>>[] = [
    { value: 'block', icon: <Minus size={sz} />, title: 'Block' },
    { value: 'flex', icon: <Columns size={sz} />, title: 'Flex' },
    { value: 'grid', icon: <LayoutGrid size={sz} />, title: 'Grid' },
    { value: 'inline-block', icon: <Rows size={sz} />, title: 'Inline Block' },
    { value: 'none', icon: <EyeOff size={sz} />, title: 'None' },
  ];

  const directionOptions: IconButtonOption<NonNullable<StyleProperties['flexDirection']>>[] = [
    { value: 'row', icon: <ArrowRight size={sz} />, title: 'Row (→)' },
    { value: 'column', icon: <ArrowDown size={sz} />, title: 'Column (↓)' },
    { value: 'row-reverse', icon: <ArrowLeft size={sz} />, title: 'Row Reverse (←)' },
    { value: 'column-reverse', icon: <ArrowUp size={sz} />, title: 'Column Reverse (↑)' },
  ];

  const justifyOptions: IconButtonOption<NonNullable<StyleProperties['justifyContent']>>[] = [
    { value: 'flex-start', icon: <AlignHorizontalJustifyStart size={sz} />, title: 'Start' },
    { value: 'center', icon: <AlignHorizontalJustifyCenter size={sz} />, title: 'Center' },
    { value: 'flex-end', icon: <AlignHorizontalJustifyEnd size={sz} />, title: 'End' },
    { value: 'space-between', icon: <AlignHorizontalSpaceBetween size={sz} />, title: 'Space Between' },
    { value: 'space-around', icon: <AlignHorizontalSpaceAround size={sz} />, title: 'Space Around' },
  ];

  const alignOptions: IconButtonOption<NonNullable<StyleProperties['alignItems']>>[] = [
    { value: 'flex-start', icon: <AlignVerticalJustifyStart size={sz} />, title: 'Start' },
    { value: 'center', icon: <AlignVerticalJustifyCenter size={sz} />, title: 'Center' },
    { value: 'flex-end', icon: <AlignVerticalJustifyEnd size={sz} />, title: 'End' },
    { value: 'stretch', icon: <StretchHorizontal size={sz} />, title: 'Stretch' },
  ];

  const isFlex = styles.display === 'flex' || styles.display === 'inline-flex';
  const isGrid = styles.display === 'grid';

  return (
    <div>
      {/* Display Mode */}
      <Row label="Display">
        <IconButtonGroup options={displayOptions} value={styles.display} onChange={(v) => onChange('display', v)} />
      </Row>

      {/* ===== FLEX PARENT CONTROLS ===== */}
      {isFlex && (
        <>
          <SectionLabel label="Flex Container" />

          <Row label="Direction">
            <IconButtonGroup options={directionOptions} value={styles.flexDirection} onChange={(v) => onChange('flexDirection', v)} />
          </Row>

          <Row label="Justify">
            <IconButtonGroup options={justifyOptions} value={styles.justifyContent} onChange={(v) => onChange('justifyContent', v)} />
          </Row>

          <Row label="Align">
            <IconButtonGroup options={alignOptions} value={styles.alignItems} onChange={(v) => onChange('alignItems', v)} />
          </Row>

          <Row label="Wrap">
            <IconButtonGroup
              options={[
                { value: 'nowrap', icon: <span style={{ fontSize: '10px' }}>—</span>, title: 'No Wrap' },
                { value: 'wrap', icon: <span style={{ fontSize: '10px' }}>↩</span>, title: 'Wrap' },
              ]}
              value={styles.flexWrap as 'nowrap' | 'wrap' | undefined}
              onChange={(v) => onChange('flexWrap', v)}
            />
          </Row>

          <Row label="Gap">
            <UnitInput
              label=""
              value={styles.gap}
              onChange={(v) => onChange('gap', v)}
              compact
              units={['px', 'rem', 'em', '%']}
              placeholder="0"
            />
          </Row>
        </>
      )}

      {/* ===== GRID PARENT CONTROLS ===== */}
      {isGrid && (
        <>
          <SectionLabel label="Grid Container" />

          {/* ===== VISUAL GRID PREVIEW ===== */}
          <GridPreview
            columns={styles.gridTemplateColumns}
            rows={styles.gridTemplateRows}
            onSelect={(col, row) => {
              // Quick-setup: set columns × rows on click
              const newCols = Array(col).fill('1fr').join(' ');
              const newRows = Array(row).fill('1fr').join(' ');
              onChange('gridTemplateColumns', newCols);
              onChange('gridTemplateRows', newRows);
            }}
          />

          {/* Quick responsive presets */}
          <GridQuickPresets
            columns={styles.gridTemplateColumns}
            rows={styles.gridTemplateRows}
            onApply={(cols, rows) => {
              onChange('gridTemplateColumns', cols);
              onChange('gridTemplateRows', rows);
            }}
          />

          {/* Visual Column Builder */}
          <GridTrackEditor
            label="Columns"
            value={styles.gridTemplateColumns}
            onChange={(v) => onChange('gridTemplateColumns', v)}
          />

          {/* Visual Row Builder */}
          <GridTrackEditor
            label="Rows"
            value={styles.gridTemplateRows}
            onChange={(v) => onChange('gridTemplateRows', v)}
          />

          {/* Gap */}
          <Row label="Gap">
            <UnitInput
              label=""
              value={styles.gap}
              onChange={(v) => onChange('gap', v)}
              compact
              units={['px', 'rem', 'em', '%']}
              placeholder="0"
            />
          </Row>

          {/* Separate Row / Column gap */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
            <div style={{ flex: 1 }}>
              <UnitInput
                label="Row Gap"
                value={styles.rowGap}
                onChange={(v) => onChange('rowGap', v)}
                compact
                units={['px', 'rem', 'em', '%']}
                placeholder="–"
              />
            </div>
            <div style={{ flex: 1 }}>
              <UnitInput
                label="Col Gap"
                value={styles.columnGap}
                onChange={(v) => onChange('columnGap', v)}
                compact
                units={['px', 'rem', 'em', '%']}
                placeholder="–"
              />
            </div>
          </div>

          {/* Align Items (grid) */}
          <Row label="Align">
            <IconButtonGroup
              options={[
                { value: 'flex-start' as any, icon: <AlignVerticalJustifyStart size={sz} />, title: 'Start' },
                { value: 'center' as any, icon: <AlignVerticalJustifyCenter size={sz} />, title: 'Center' },
                { value: 'flex-end' as any, icon: <AlignVerticalJustifyEnd size={sz} />, title: 'End' },
                { value: 'stretch' as any, icon: <StretchHorizontal size={sz} />, title: 'Stretch' },
              ]}
              value={styles.alignItems}
              onChange={(v) => onChange('alignItems', v)}
            />
          </Row>

          {/* Justify Items */}
          <Row label="Justify It.">
            <IconButtonGroup
              options={[
                { value: 'start', icon: <AlignHorizontalJustifyStart size={sz} />, title: 'Start' },
                { value: 'center', icon: <AlignHorizontalJustifyCenter size={sz} />, title: 'Center' },
                { value: 'end', icon: <AlignHorizontalJustifyEnd size={sz} />, title: 'End' },
                { value: 'stretch', icon: <StretchHorizontal size={sz} />, title: 'Stretch' },
              ]}
              value={styles.justifyItems}
              onChange={(v) => onChange('justifyItems', v)}
            />
          </Row>

          {/* Align Content */}
          <Row label="Align C.">
            <IconButtonGroup
              options={[
                { value: 'start', icon: <AlignVerticalJustifyStart size={sz} />, title: 'Start' },
                { value: 'center', icon: <AlignVerticalJustifyCenter size={sz} />, title: 'Center' },
                { value: 'end', icon: <AlignVerticalJustifyEnd size={sz} />, title: 'End' },
                { value: 'stretch', icon: <StretchHorizontal size={sz} />, title: 'Stretch' },
                { value: 'space-between', icon: <AlignHorizontalSpaceBetween size={sz} />, title: 'Space Between' },
              ]}
              value={styles.alignContent}
              onChange={(v) => onChange('alignContent', v)}
            />
          </Row>

          {/* Auto Flow */}
          <Row label="Auto Flow">
            <select
              value={styles.gridAutoFlow ?? ''}
              onChange={(e) => onChange('gridAutoFlow', e.target.value || undefined)}
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
              <option value="">– (row)</option>
              <option value="row">Row</option>
              <option value="column">Column</option>
              <option value="dense">Dense</option>
              <option value="row dense">Row Dense</option>
              <option value="column dense">Column Dense</option>
            </select>
          </Row>

          {/* Auto Columns / Rows */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '10px', color: '#b0b7c3', display: 'block', marginBottom: '3px' }}>Auto Cols</label>
              <input
                type="text"
                value={styles.gridAutoColumns || ''}
                onChange={(e) => onChange('gridAutoColumns', e.target.value || undefined)}
                placeholder="auto"
                style={{
                  width: '100%',
                  padding: '3px 6px',
                  backgroundColor: '#2d2d3d',
                  border: '1px solid #3d3d4d',
                  borderRadius: '3px',
                  color: '#d1d5db',
                  fontSize: '11px',
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '10px', color: '#b0b7c3', display: 'block', marginBottom: '3px' }}>Auto Rows</label>
              <input
                type="text"
                value={styles.gridAutoRows || ''}
                onChange={(e) => onChange('gridAutoRows', e.target.value || undefined)}
                placeholder="auto"
                style={{
                  width: '100%',
                  padding: '3px 6px',
                  backgroundColor: '#2d2d3d',
                  border: '1px solid #3d3d4d',
                  borderRadius: '3px',
                  color: '#d1d5db',
                  fontSize: '11px',
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ===== FLEX CHILD SECTION (eigene Komponente) =====

interface FlexChildSectionProps {
  styles: Partial<StyleProperties>;
  onChange: (key: keyof StyleProperties, value: any) => void;
}

export const FlexChildSection: React.FC<FlexChildSectionProps> = ({ styles, onChange }) => {
  return (
    <div>
      {/* Flex Grow / Shrink / Basis */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '10px', color: '#b0b7c3', display: 'block', marginBottom: '3px' }}>Grow</label>
          <input
            type="number"
            value={styles.flexGrow ?? ''}
            onChange={(e) => onChange('flexGrow', e.target.value !== '' ? Number(e.target.value) : undefined)}
            min={0}
            step={1}
            placeholder="0"
            style={{
              width: '100%',
              padding: '4px 6px',
              backgroundColor: '#2d2d3d',
              border: '1px solid #3d3d4d',
              borderRadius: '4px',
              color: '#d1d5db',
              fontSize: '12px',
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '10px', color: '#b0b7c3', display: 'block', marginBottom: '3px' }}>Shrink</label>
          <input
            type="number"
            value={styles.flexShrink ?? ''}
            onChange={(e) => onChange('flexShrink', e.target.value !== '' ? Number(e.target.value) : undefined)}
            min={0}
            step={1}
            placeholder="1"
            style={{
              width: '100%',
              padding: '4px 6px',
              backgroundColor: '#2d2d3d',
              border: '1px solid #3d3d4d',
              borderRadius: '4px',
              color: '#d1d5db',
              fontSize: '12px',
            }}
          />
        </div>
      </div>

      {/* Flex Basis */}
      <Row label="Basis">
        <UnitInput
          label=""
          value={typeof styles.flexBasis === 'object' ? styles.flexBasis : undefined}
          onChange={(v) => onChange('flexBasis', v)}
          compact
          units={['px', '%', 'em', 'rem']}
          placeholder="auto"
        />
      </Row>

      {/* Order */}
      <Row label="Order">
        <input
          type="number"
          value={styles.order ?? ''}
          onChange={(e) => onChange('order', e.target.value !== '' ? Number(e.target.value) : undefined)}
          placeholder="0"
          style={{
            width: '72px',
            padding: '4px 6px',
            backgroundColor: '#2d2d3d',
            border: '1px solid #3d3d4d',
            borderRadius: '4px',
            color: '#d1d5db',
            fontSize: '12px',
          }}
        />
      </Row>

      {/* Align Self */}
      <Row label="Align Self">
        <IconButtonGroup
          options={[
            { value: 'auto', icon: <span style={{ fontSize: '10px' }}>A</span>, title: 'Auto' },
            { value: 'flex-start', icon: <AlignVerticalJustifyStart size={13} />, title: 'Start' },
            { value: 'center', icon: <AlignVerticalJustifyCenter size={13} />, title: 'Center' },
            { value: 'flex-end', icon: <AlignVerticalJustifyEnd size={13} />, title: 'End' },
            { value: 'stretch', icon: <StretchHorizontal size={13} />, title: 'Stretch' },
          ]}
          value={styles.alignSelf}
          onChange={(v) => onChange('alignSelf', v)}
        />
      </Row>
    </div>
  );
};

// ===== GRID CHILD SECTION (eigene Komponente) =====

interface GridChildSectionProps {
  styles: Partial<StyleProperties>;
  onChange: (key: keyof StyleProperties, value: any) => void;
}

export const GridChildSection: React.FC<GridChildSectionProps> = ({ styles, onChange }) => {
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '4px 6px',
    backgroundColor: '#2d2d3d',
    border: '1px solid #3d3d4d',
    borderRadius: '4px',
    color: '#d1d5db',
    fontSize: '12px',
    fontFamily: 'monospace',
  };

  return (
    <div>
      {/* Grid Column */}
      <Row label="Column">
        <input
          type="text"
          value={styles.gridColumn || ''}
          onChange={(e) => onChange('gridColumn', e.target.value || undefined)}
          placeholder="auto (z.B. 1 / 3, span 2)"
          style={inputStyle}
        />
      </Row>

      {/* Quick span presets */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '8px', paddingLeft: '80px' }}>
        {[
          { label: 'auto', css: undefined },
          { label: 'span 2', css: 'span 2' },
          { label: 'span 3', css: 'span 3' },
          { label: '1/-1', css: '1 / -1' },
        ].map((preset) => (
          <button
            key={preset.label}
            onClick={() => onChange('gridColumn', preset.css)}
            style={{
              padding: '2px 6px',
              backgroundColor: styles.gridColumn === preset.css ? '#3b82f6' : '#2d2d3d',
              border: '1px solid ' + (styles.gridColumn === preset.css ? '#3b82f6' : '#3d3d4d'),
              borderRadius: '3px',
              color: styles.gridColumn === preset.css ? '#fff' : '#b0b7c3',
              fontSize: '9px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Grid Row */}
      <Row label="Row">
        <input
          type="text"
          value={styles.gridRow || ''}
          onChange={(e) => onChange('gridRow', e.target.value || undefined)}
          placeholder="auto (z.B. 1 / 2, span 2)"
          style={inputStyle}
        />
      </Row>

      {/* Align Self */}
      <Row label="Align Self">
        <IconButtonGroup
          options={[
            { value: 'auto', icon: <span style={{ fontSize: '10px' }}>A</span>, title: 'Auto' },
            { value: 'flex-start', icon: <AlignVerticalJustifyStart size={13} />, title: 'Start' },
            { value: 'center', icon: <AlignVerticalJustifyCenter size={13} />, title: 'Center' },
            { value: 'flex-end', icon: <AlignVerticalJustifyEnd size={13} />, title: 'End' },
            { value: 'stretch', icon: <StretchHorizontal size={13} />, title: 'Stretch' },
          ]}
          value={styles.alignSelf}
          onChange={(v) => onChange('alignSelf', v)}
        />
      </Row>

      {/* Justify Self */}
      <Row label="Justify Self">
        <IconButtonGroup
          options={[
            { value: 'auto', icon: <span style={{ fontSize: '10px' }}>A</span>, title: 'Auto' },
            { value: 'start', icon: <AlignHorizontalJustifyStart size={13} />, title: 'Start' },
            { value: 'center', icon: <AlignHorizontalJustifyCenter size={13} />, title: 'Center' },
            { value: 'end', icon: <AlignHorizontalJustifyEnd size={13} />, title: 'End' },
            { value: 'stretch', icon: <StretchHorizontal size={13} />, title: 'Stretch' },
          ]}
          value={styles.justifySelf}
          onChange={(v) => onChange('justifySelf', v)}
        />
      </Row>
    </div>
  );
};
