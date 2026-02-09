// =====================================================
// VISUAL EDITOR – LAYOUT SECTION
// Properties Panel: Display, Flex, Grid
// Webflow-Style: visuelle Toggles für Layout-Modes
// =====================================================

import React from 'react';
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
            color: value === opt.value ? '#fff' : '#6b7280',
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
    <label style={{ width: '72px', flexShrink: 0, fontSize: '11px', color: '#6b7280' }}>{label}</label>
    <div style={{ flex: 1 }}>{children}</div>
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
    { value: 'stretch', icon: <Minus size={sz} />, title: 'Stretch' },
  ];

  const isFlex = styles.display === 'flex' || styles.display === 'inline-flex';
  const isGrid = styles.display === 'grid';

  return (
    <div>
      {/* Display Mode */}
      <Row label="Display">
        <IconButtonGroup options={displayOptions} value={styles.display} onChange={(v) => onChange('display', v)} />
      </Row>

      {/* Flex-specific properties */}
      {isFlex && (
        <>
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

      {/* Grid-specific properties */}
      {isGrid && (
        <>
          <Row label="Columns">
            <input
              type="text"
              value={styles.gridTemplateColumns || ''}
              onChange={(e) => onChange('gridTemplateColumns', e.target.value || undefined)}
              placeholder="1fr 1fr"
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
          <Row label="Rows">
            <input
              type="text"
              value={styles.gridTemplateRows || ''}
              onChange={(e) => onChange('gridTemplateRows', e.target.value || undefined)}
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
    </div>
  );
};
