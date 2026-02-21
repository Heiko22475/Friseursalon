// =====================================================
// VISUAL EDITOR – POSITION SECTION
// Webflow-Style Position Controls
// Static | Relative | Absolute | Fixed | Sticky
// + Inset Controls (Top/Right/Bottom/Left) + Z-Index
// =====================================================

import React from 'react';
import type { StyleProperties, SizeValue } from '../types/styles';
import { UnitInput } from '../components/UnitInput';

interface PositionSectionProps {
  styles: Partial<StyleProperties>;
  onChange: (key: keyof StyleProperties, value: any) => void;
}

// ===== POSITION TYPE OPTIONS =====

type PositionType = 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';

const POSITION_OPTIONS: { value: PositionType; label: string; icon: string; description: string }[] = [
  { value: 'static', label: 'Static', icon: '▬', description: 'Normaler Dokumentfluss' },
  { value: 'relative', label: 'Relative', icon: '⬒', description: 'Relativ zur normalen Position' },
  { value: 'absolute', label: 'Absolute', icon: '◎', description: 'Relativ zum nächsten positionierten Elternteil' },
  { value: 'fixed', label: 'Fixed', icon: '📌', description: 'Fixiert im Viewport' },
  { value: 'sticky', label: 'Sticky', icon: '📎', description: 'Klebt beim Scrollen' },
];

// ===== HELPER COMPONENTS =====

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
    <label style={{ width: '60px', flexShrink: 0, fontSize: '11px', color: 'var(--admin-text-icon)' }}>{label}</label>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

// ===== INSET VISUAL CONTROL =====

const InsetVisual: React.FC<{
  styles: Partial<StyleProperties>;
  onChange: (key: keyof StyleProperties, value: any) => void;
  posType: PositionType;
}> = ({ styles, onChange, posType }) => {
  // For sticky, typically only top is used. Show all but highlight the common ones.
  const activeColor = '#3b82f6';
  const inactiveColor = 'var(--admin-border-strong)';

  const hasTop = styles.top !== undefined;
  const hasRight = styles.right !== undefined;
  const hasBottom = styles.bottom !== undefined;
  const hasLeft = styles.left !== undefined;

  // Visual position indicator box
  return (
    <div style={{ marginBottom: '12px' }}>
      {/* Visual inset indicator */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '120px',
          backgroundColor: 'var(--admin-bg)',
          borderRadius: '8px',
          border: '1px solid var(--admin-border)',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Top indicator */}
        <div
          style={{
            position: 'absolute',
            top: '4px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '40px',
            height: '3px',
            borderRadius: '2px',
            backgroundColor: hasTop ? activeColor : inactiveColor,
            transition: 'background-color 0.15s',
          }}
        />
        {/* Bottom indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: '4px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '40px',
            height: '3px',
            borderRadius: '2px',
            backgroundColor: hasBottom ? activeColor : inactiveColor,
            transition: 'background-color 0.15s',
          }}
        />
        {/* Left indicator */}
        <div
          style={{
            position: 'absolute',
            left: '4px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '3px',
            height: '40px',
            borderRadius: '2px',
            backgroundColor: hasLeft ? activeColor : inactiveColor,
            transition: 'background-color 0.15s',
          }}
        />
        {/* Right indicator */}
        <div
          style={{
            position: 'absolute',
            right: '4px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '3px',
            height: '40px',
            borderRadius: '2px',
            backgroundColor: hasRight ? activeColor : inactiveColor,
            transition: 'background-color 0.15s',
          }}
        />

        {/* Center box representing the element */}
        <div
          style={{
            width: '48px',
            height: '48px',
            backgroundColor: 'var(--admin-bg-input)',
            border: `2px solid ${activeColor}40`,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: '11px', color: 'var(--admin-text-icon)', fontWeight: 600, textTransform: 'uppercase' }}>
            {posType.slice(0, 3)}
          </span>
        </div>

        {/* Dashed border representing the parent/viewport */}
        <div
          style={{
            position: 'absolute',
            inset: '12px',
            border: '1px dashed var(--admin-border-strong)',
            borderRadius: '4px',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Inset inputs in a cross layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* Top */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '120px' }}>
            <UnitInput
              label="Top"
              value={typeof styles.top === 'object' ? styles.top as SizeValue : undefined}
              onChange={(v) => onChange('top', v)}
              compact
              units={['px', '%', 'vh']}
              placeholder="auto"
            />
          </div>
        </div>

        {/* Left + Right */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ width: '120px' }}>
            <UnitInput
              label="Left"
              value={typeof styles.left === 'object' ? styles.left as SizeValue : undefined}
              onChange={(v) => onChange('left', v)}
              compact
              units={['px', '%', 'vw']}
              placeholder="auto"
            />
          </div>
          <div style={{ width: '120px' }}>
            <UnitInput
              label="Right"
              value={typeof styles.right === 'object' ? styles.right as SizeValue : undefined}
              onChange={(v) => onChange('right', v)}
              compact
              units={['px', '%', 'vw']}
              placeholder="auto"
            />
          </div>
        </div>

        {/* Bottom */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '120px' }}>
            <UnitInput
              label="Bottom"
              value={typeof styles.bottom === 'object' ? styles.bottom as SizeValue : undefined}
              onChange={(v) => onChange('bottom', v)}
              compact
              units={['px', '%', 'vh']}
              placeholder="auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== MAIN COMPONENT =====

export const PositionSection: React.FC<PositionSectionProps> = ({ styles, onChange }) => {
  const currentPosition = (styles.position as PositionType) || '';
  const hasInsets = currentPosition && currentPosition !== 'static';

  return (
    <div>
      {/* Position Type Selector — Webflow-style toggle buttons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '2px',
          marginBottom: '10px',
          backgroundColor: 'var(--admin-bg)',
          padding: '3px',
          borderRadius: '6px',
          border: '1px solid var(--admin-border)',
        }}
      >
        {POSITION_OPTIONS.map((opt) => {
          const isActive = currentPosition === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => {
                if (isActive) {
                  // Deselect → clear position and all insets
                  onChange('position', undefined);
                  onChange('top', undefined);
                  onChange('right', undefined);
                  onChange('bottom', undefined);
                  onChange('left', undefined);
                  onChange('zIndex', undefined);
                } else {
                  onChange('position', opt.value);
                }
              }}
              title={`${opt.label}: ${opt.description}`}
              style={{
                padding: '6px 2px',
                backgroundColor: isActive ? '#3b82f6' : 'transparent',
                border: isActive ? '1px solid #60a5fa' : '1px solid transparent',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              <span style={{ fontSize: '12px', lineHeight: 1 }}>{opt.icon}</span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#ffffff' : 'var(--admin-text-icon)',
                  lineHeight: 1,
                }}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Description of current position type */}
      {currentPosition && currentPosition !== 'static' && (
        <div
          style={{
            padding: '6px 8px',
            backgroundColor: '#1a1a2e',
            borderRadius: '4px',
            border: '1px solid var(--admin-border)',
            marginBottom: '10px',
          }}
        >
          <span style={{ fontSize: '11px', color: 'var(--admin-text-icon)', lineHeight: 1.4 }}>
            {POSITION_OPTIONS.find((o) => o.value === currentPosition)?.description}
          </span>
        </div>
      )}

      {/* Float/Inset Controls — only for non-static positions */}
      {hasInsets && (
        <>
          <InsetVisual
            styles={styles}
            onChange={onChange}
            posType={currentPosition as PositionType}
          />

          {/* Z-Index */}
          <Row label="Z-Index">
            <input
              type="number"
              value={styles.zIndex ?? ''}
              onChange={(e) => onChange('zIndex', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="auto"
              style={{
                width: '100%',
                padding: '4px 8px',
                backgroundColor: 'var(--admin-bg-input)',
                border: '1px solid var(--admin-border-strong)',
                borderRadius: '4px',
                color: 'var(--admin-text)',
                fontSize: '12px',
              }}
            />
          </Row>

          {/* Quick inset presets */}
          <div style={{ marginTop: '4px' }}>
            <label style={{ fontSize: '11px', color: 'var(--admin-text-secondary)', display: 'block', marginBottom: '4px' }}>
              Schnell-Presets
            </label>
            <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
              <PresetButton
                label="Füllen"
                title="top:0, right:0, bottom:0, left:0"
                onClick={() => {
                  const zero = { value: 0, unit: 'px' as const };
                  onChange('top', zero);
                  onChange('right', zero);
                  onChange('bottom', zero);
                  onChange('left', zero);
                }}
              />
              <PresetButton
                label="Zentriert"
                title="top:50%, left:50%"
                onClick={() => {
                  onChange('top', { value: 50, unit: '%' as const });
                  onChange('left', { value: 50, unit: '%' as const });
                  onChange('bottom', undefined);
                  onChange('right', undefined);
                }}
              />
              <PresetButton
                label="Oben"
                title="top:0, left:0, right:0"
                onClick={() => {
                  const zero = { value: 0, unit: 'px' as const };
                  onChange('top', zero);
                  onChange('left', zero);
                  onChange('right', zero);
                  onChange('bottom', undefined);
                }}
              />
              <PresetButton
                label="Unten"
                title="bottom:0, left:0, right:0"
                onClick={() => {
                  const zero = { value: 0, unit: 'px' as const };
                  onChange('bottom', zero);
                  onChange('left', zero);
                  onChange('right', zero);
                  onChange('top', undefined);
                }}
              />
              <PresetButton
                label="Reset"
                title="Alle Insets zurücksetzen"
                onClick={() => {
                  onChange('top', undefined);
                  onChange('right', undefined);
                  onChange('bottom', undefined);
                  onChange('left', undefined);
                  onChange('zIndex', undefined);
                }}
                danger
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ===== PRESET BUTTON =====

const PresetButton: React.FC<{
  label: string;
  title: string;
  onClick: () => void;
  danger?: boolean;
}> = ({ label, title, onClick, danger }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      padding: '3px 8px',
      backgroundColor: 'var(--admin-bg-input)',
      border: `1px solid ${danger ? '#ef444440' : 'var(--admin-border-strong)'}`,
      borderRadius: '3px',
      color: danger ? '#f87171' : 'var(--admin-text-icon)',
      fontSize: '11px',
      cursor: 'pointer',
      fontWeight: 500,
      transition: 'all 0.15s',
    }}
  >
    {label}
  </button>
);
