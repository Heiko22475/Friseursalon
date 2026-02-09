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
// =====================================================

import React, { useState } from 'react';
import type { SizeValue, StyleProperties } from '../types/styles';

interface SpacingBoxProps {
  styles: Partial<StyleProperties>;
  onChange: (property: keyof StyleProperties, value: SizeValue | undefined) => void;
}

interface EditableValueProps {
  value: SizeValue | undefined;
  onChange: (val: SizeValue | undefined) => void;
  position: 'top' | 'right' | 'bottom' | 'left';
}

const EditableValue: React.FC<EditableValueProps> = ({ value, onChange, position }) => {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');

  const displayVal = value?.value ?? '';

  const handleSubmit = () => {
    setEditing(false);
    if (text === '' || text === '-') {
      onChange(undefined);
    } else {
      const num = parseFloat(text);
      if (!isNaN(num)) {
        onChange({ value: num, unit: value?.unit || 'px' });
      }
    }
  };

  const posStyle: React.CSSProperties = {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...(position === 'top' && { top: '2px', left: '50%', transform: 'translateX(-50%)' }),
    ...(position === 'bottom' && { bottom: '2px', left: '50%', transform: 'translateX(-50%)' }),
    ...(position === 'left' && { left: '4px', top: '50%', transform: 'translateY(-50%)' }),
    ...(position === 'right' && { right: '4px', top: '50%', transform: 'translateY(-50%)' }),
  };

  if (editing) {
    return (
      <div style={posStyle}>
        <input
          autoFocus
          type="number"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
            if (e.key === 'Escape') setEditing(false);
          }}
          style={{
            width: '32px',
            padding: '1px 2px',
            backgroundColor: '#1a1a2a',
            border: '1px solid #3b82f6',
            borderRadius: '2px',
            color: '#d1d5db',
            fontSize: '10px',
            textAlign: 'center',
            outline: 'none',
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        ...posStyle,
        cursor: 'pointer',
        fontSize: '10px',
        color: displayVal !== '' ? '#d1d5db' : '#4a4a5a',
        minWidth: '16px',
        textAlign: 'center',
        padding: '1px 2px',
        borderRadius: '2px',
        transition: 'background-color 0.1s',
      }}
      onClick={() => {
        setText(String(displayVal));
        setEditing(true);
      }}
      title={`${value?.value ?? 0}${value?.unit ?? 'px'}`}
    >
      {displayVal !== '' ? displayVal : '–'}
    </div>
  );
};

export const SpacingBox: React.FC<SpacingBoxProps> = ({ styles, onChange }) => {
  return (
    <div style={{ padding: '4px 0' }}>
      {/* Margin Box */}
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
        <span style={{ position: 'absolute', top: '2px', left: '6px', fontSize: '9px', color: '#5a6a5a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Margin
        </span>

        {/* Margin values */}
        <EditableValue
          value={typeof styles.marginTop === 'object' ? styles.marginTop as SizeValue : undefined}
          onChange={(v) => onChange('marginTop', v)}
          position="top"
        />
        <EditableValue
          value={typeof styles.marginRight === 'object' ? styles.marginRight as SizeValue : undefined}
          onChange={(v) => onChange('marginRight', v)}
          position="right"
        />
        <EditableValue
          value={typeof styles.marginBottom === 'object' ? styles.marginBottom as SizeValue : undefined}
          onChange={(v) => onChange('marginBottom', v)}
          position="bottom"
        />
        <EditableValue
          value={typeof styles.marginLeft === 'object' ? styles.marginLeft as SizeValue : undefined}
          onChange={(v) => onChange('marginLeft', v)}
          position="left"
        />

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
          {/* Padding label */}
          <span style={{ position: 'absolute', top: '2px', left: '6px', fontSize: '9px', color: '#5a5a6a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Padding
          </span>

          {/* Padding values */}
          <EditableValue
            value={styles.paddingTop}
            onChange={(v) => onChange('paddingTop', v)}
            position="top"
          />
          <EditableValue
            value={styles.paddingRight}
            onChange={(v) => onChange('paddingRight', v)}
            position="right"
          />
          <EditableValue
            value={styles.paddingBottom}
            onChange={(v) => onChange('paddingBottom', v)}
            position="bottom"
          />
          <EditableValue
            value={styles.paddingLeft}
            onChange={(v) => onChange('paddingLeft', v)}
            position="left"
          />

          {/* Center content indicator */}
          <div style={{
            width: '100%',
            height: '20px',
            backgroundColor: '#1e1e2e',
            borderRadius: '2px',
            border: '1px dashed #3d3d4d',
          }} />
        </div>
      </div>
    </div>
  );
};
