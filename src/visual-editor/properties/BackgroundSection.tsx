// =====================================================
// VISUAL EDITOR – BACKGROUND SECTION (Phase 2 Upgrade)
// Background Color, Image, Gradient Builder
// =====================================================

import React, { useCallback } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { StyleProperties } from '../types/styles';
import { VEColorPicker } from '../components/VEColorPicker';
import { VEMediaPicker } from '../components/VEMediaPicker';

interface BackgroundSectionProps {
  styles: Partial<StyleProperties>;
  onChange: (key: keyof StyleProperties, value: any) => void;
  /** Pro-Modus: zeigt Gradient-Builder */
  proMode?: boolean;
}

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
    <label style={{ width: '60px', flexShrink: 0, fontSize: '11px', color: 'var(--admin-text-icon)' }}>{label}</label>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

export const BackgroundSection: React.FC<BackgroundSectionProps> = ({ styles, onChange, proMode = false }) => {
  const hasImage = !!styles.backgroundImage;
  const gradient = styles.backgroundGradient;
  const hasGradient = !!gradient;

  // ===== GRADIENT HELPERS =====

  const setGradient = useCallback((g: StyleProperties['backgroundGradient']) => {
    onChange('backgroundGradient', g);
  }, [onChange]);

  const addGradient = useCallback(() => {
    setGradient({
      type: 'linear',
      angle: 180,
      stops: [
        { color: '#3b82f6', position: 0 },
        { color: '#8b5cf6', position: 100 },
      ],
    });
  }, [setGradient]);

  const updateStop = useCallback((index: number, patch: Partial<{ color: string; position: number }>) => {
    if (!gradient) return;
    const newStops = [...gradient.stops];
    newStops[index] = { ...newStops[index], ...patch };
    setGradient({ ...gradient, stops: newStops });
  }, [gradient, setGradient]);

  const addStop = useCallback(() => {
    if (!gradient) return;
    const lastPos = gradient.stops[gradient.stops.length - 1]?.position ?? 100;
    const newPos = Math.min(100, lastPos);
    setGradient({ ...gradient, stops: [...gradient.stops, { color: '#ffffff', position: newPos }] });
  }, [gradient, setGradient]);

  const removeStop = useCallback((index: number) => {
    if (!gradient || gradient.stops.length <= 2) return;
    setGradient({ ...gradient, stops: gradient.stops.filter((_, i) => i !== index) });
  }, [gradient, setGradient]);

  return (
    <div>
      {/* Background Color */}
      <VEColorPicker
        label="Farbe"
        value={styles.backgroundColor}
        onChange={(v) => onChange('backgroundColor', v)}
      />

      {/* Background Image – VEMediaPicker */}
      <label style={{ fontSize: '11px', color: 'var(--admin-text-icon)', display: 'block', marginBottom: '4px', marginTop: '8px' }}>
        Hintergrundbild
      </label>
      <VEMediaPicker
        value={styles.backgroundImage || undefined}
        onChange={(url) => {
          onChange('backgroundImage', url || undefined);
          if (!url) {
            // Bild entfernt → auch Optionen zurücksetzen
            onChange('backgroundSize', undefined);
            onChange('backgroundPosition', undefined);
            onChange('backgroundRepeat', undefined);
          }
        }}
        label="Hintergrund"
      />

      {/* Image options (only when image is set) */}
      {hasImage && (
        <>
          <Row label="Size">
            <select
              value={styles.backgroundSize || ''}
              onChange={(e) => onChange('backgroundSize', e.target.value || undefined)}
              style={{
                width: '100%',
                padding: '4px 6px',
                backgroundColor: 'var(--admin-bg-input)',
                border: '1px solid var(--admin-border-strong)',
                borderRadius: '4px',
                color: 'var(--admin-text)',
                fontSize: '12px',
              }}
            >
              <option value="">–</option>
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
              <option value="auto">Auto</option>
              <option value="100% 100%">Stretch</option>
            </select>
          </Row>

          <Row label="Position">
            <select
              value={styles.backgroundPosition || ''}
              onChange={(e) => onChange('backgroundPosition', e.target.value || undefined)}
              style={{
                width: '100%',
                padding: '4px 6px',
                backgroundColor: 'var(--admin-bg-input)',
                border: '1px solid var(--admin-border-strong)',
                borderRadius: '4px',
                color: 'var(--admin-text)',
                fontSize: '12px',
              }}
            >
              <option value="">–</option>
              <option value="center">Center</option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
              <option value="left center">Left</option>
              <option value="right center">Right</option>
              <option value="top left">Top Left</option>
              <option value="top right">Top Right</option>
              <option value="bottom left">Bottom Left</option>
              <option value="bottom right">Bottom Right</option>
            </select>
          </Row>

          <Row label="Repeat">
            <select
              value={styles.backgroundRepeat || ''}
              onChange={(e) => onChange('backgroundRepeat', e.target.value || undefined)}
              style={{
                width: '100%',
                padding: '4px 6px',
                backgroundColor: 'var(--admin-bg-input)',
                border: '1px solid var(--admin-border-strong)',
                borderRadius: '4px',
                color: 'var(--admin-text)',
                fontSize: '12px',
              }}
            >
              <option value="">–</option>
              <option value="no-repeat">Nicht wiederholen</option>
              <option value="repeat">Wiederholen</option>
              <option value="repeat-x">Horizontal</option>
              <option value="repeat-y">Vertikal</option>
            </select>
          </Row>
        </>
      )}

      {/* ===== GRADIENT BUILDER (Pro only) ===== */}
      {proMode && (
        <div style={{ marginTop: '8px', borderTop: '1px solid var(--admin-border)', paddingTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontSize: '11px', color: 'var(--admin-text-icon)', fontWeight: 500 }}>Verlauf</label>
            {!hasGradient ? (
              <button
                onClick={addGradient}
                style={{
                  padding: '3px 8px',
                  backgroundColor: 'var(--admin-bg-input)',
                  border: '1px dashed var(--admin-border-strong)',
                  borderRadius: '3px',
                  color: 'var(--admin-text-icon)',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <Plus size={10} /> Hinzufügen
              </button>
            ) : (
              <button
                onClick={() => setGradient(undefined)}
                style={{
                  padding: '3px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  display: 'flex',
                }}
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>

          {hasGradient && gradient && (
            <>
              {/* Preview */}
              <div style={{
                height: '32px',
                borderRadius: '4px',
                border: '1px solid var(--admin-border-strong)',
                marginBottom: '8px',
                background: gradient.type === 'linear'
                  ? `linear-gradient(${gradient.angle ?? 180}deg, ${gradient.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`
                  : `radial-gradient(circle, ${gradient.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`,
              }} />

              {/* Type toggle */}
              <div style={{ display: 'flex', gap: '2px', marginBottom: '6px' }}>
                {(['linear', 'radial'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setGradient({ ...gradient, type: t })}
                    style={{
                      flex: 1,
                      padding: '3px 6px',
                      backgroundColor: gradient.type === t ? '#3b82f6' : 'var(--admin-border)',
                      border: `1px solid ${gradient.type === t ? '#3b82f6' : 'var(--admin-border-strong)'}`,
                      borderRadius: '3px',
                      color: gradient.type === t ? '#fff' : 'var(--admin-text-icon)',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: 500,
                      textTransform: 'capitalize',
                    }}
                  >
                    {t === 'linear' ? 'Linear' : 'Radial'}
                  </button>
                ))}
              </div>

              {/* Angle (linear only) */}
              {gradient.type === 'linear' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--admin-text-icon)', width: '36px' }}>Winkel</label>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={gradient.angle ?? 180}
                    onChange={(e) => setGradient({ ...gradient, angle: Number(e.target.value) })}
                    style={{ flex: 1, height: '3px', accentColor: '#3b82f6', cursor: 'pointer' }}
                  />
                  <input
                    type="number"
                    min={0}
                    max={360}
                    value={gradient.angle ?? 180}
                    onChange={(e) => setGradient({ ...gradient, angle: Number(e.target.value) || 0 })}
                    style={{
                      width: '42px',
                      padding: '3px 4px',
                      backgroundColor: 'var(--admin-bg-input)',
                      border: '1px solid var(--admin-border-strong)',
                      borderRadius: '3px',
                      color: 'var(--admin-text)',
                      fontSize: '11px',
                      textAlign: 'right',
                    }}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--admin-text-icon)' }}>°</span>
                </div>
              )}

              {/* Angle presets */}
              {gradient.type === 'linear' && (
                <div style={{ display: 'flex', gap: '2px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
                    <button
                      key={a}
                      onClick={() => setGradient({ ...gradient, angle: a })}
                      style={{
                        padding: '2px 6px',
                        backgroundColor: gradient.angle === a ? '#3b82f6' : 'var(--admin-border)',
                        border: `1px solid ${gradient.angle === a ? '#3b82f6' : 'var(--admin-border-strong)'}`,
                        borderRadius: '3px',
                        color: gradient.angle === a ? '#fff' : 'var(--admin-text-icon)',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      {a}°
                    </button>
                  ))}
                </div>
              )}

              {/* Color Stops */}
              <label style={{ fontSize: '11px', color: 'var(--admin-text-icon)', display: 'block', marginBottom: '4px' }}>Farbstufen</label>
              {gradient.stops.map((stop, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <input
                    type="color"
                    value={stop.color}
                    onChange={(e) => updateStop(i, { color: e.target.value })}
                    style={{ width: '24px', height: '20px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', padding: 0 }}
                  />
                  <input
                    type="text"
                    value={stop.color}
                    onChange={(e) => updateStop(i, { color: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '3px 6px',
                      backgroundColor: 'var(--admin-bg-input)',
                      border: '1px solid var(--admin-border-strong)',
                      borderRadius: '3px',
                      color: 'var(--admin-text)',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                    }}
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={stop.position}
                    onChange={(e) => updateStop(i, { position: Number(e.target.value) || 0 })}
                    style={{
                      width: '38px',
                      padding: '3px 4px',
                      backgroundColor: 'var(--admin-bg-input)',
                      border: '1px solid var(--admin-border-strong)',
                      borderRadius: '3px',
                      color: 'var(--admin-text)',
                      fontSize: '11px',
                      textAlign: 'right',
                    }}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--admin-text-icon)' }}>%</span>
                  {gradient.stops.length > 2 && (
                    <button
                      onClick={() => removeStop(i)}
                      style={{
                        padding: '1px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        display: 'flex',
                      }}
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addStop}
                style={{
                  width: '100%',
                  padding: '4px',
                  backgroundColor: 'var(--admin-bg-input)',
                  border: '1px dashed var(--admin-border-strong)',
                  borderRadius: '3px',
                  color: 'var(--admin-text-icon)',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  marginTop: '2px',
                }}
              >
                <Plus size={9} /> Farbstopp
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
