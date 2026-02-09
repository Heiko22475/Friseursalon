// =====================================================
// UNIFIED COLOR PICKER
// 3-Tab Color Picker: Semantic | Palette | Custom
// =====================================================

import { useState } from 'react';
import { ColorValue, ThemeTokens, SemanticTokenRef, PaletteTokenRef } from '../../../types/theme';
import { resolveColor } from '../../../utils/token-resolver';
import { evaluateContrast } from '../../../utils/color-utils';
import TextContrastPreview from './TextContrastPreview';

interface UnifiedColorPickerProps {
  value: ColorValue;
  onChange: (value: ColorValue) => void;
  theme: ThemeTokens;
  label?: string;
  showContrastCheck?: boolean;
  contrastBackground?: string;
  showTextContrasts?: boolean; // Show text contrast recommendations
}

type Tab = 'semantic' | 'palette' | 'custom';

const SEMANTIC_TOKENS: { ref: SemanticTokenRef; label: string }[] = [
  { ref: 'semantic.link', label: 'Link' },
  { ref: 'semantic.linkHover', label: 'Link Hover' },
  { ref: 'semantic.focusRing', label: 'Focus Ring' },
  { ref: 'semantic.pageBg', label: 'Page Background' },
  { ref: 'semantic.contentBg', label: 'Content Background' },
  { ref: 'semantic.cardBg', label: 'Card Background' },
  { ref: 'semantic.headingText', label: 'Heading Text' },
  { ref: 'semantic.bodyText', label: 'Body Text' },
  { ref: 'semantic.mutedText', label: 'Muted Text' },
  { ref: 'semantic.border', label: 'Border' },
  { ref: 'semantic.borderLight', label: 'Border Light' },
  { ref: 'semantic.buttonPrimaryBg', label: 'Button Primary Background' },
  { ref: 'semantic.buttonPrimaryText', label: 'Button Primary Text' },
  { ref: 'semantic.buttonSecondaryBg', label: 'Button Secondary Background' },
  { ref: 'semantic.buttonSecondaryText', label: 'Button Secondary Text' },
  { ref: 'semantic.success', label: 'Success' },
  { ref: 'semantic.warning', label: 'Warning' },
  { ref: 'semantic.error', label: 'Error' },
  { ref: 'semantic.info', label: 'Info' },
];



export default function UnifiedColorPicker({
  value,
  onChange,
  theme,
  label,
  showContrastCheck = false,
  contrastBackground,
  showTextContrasts = false,
}: UnifiedColorPickerProps) {
  const [activeTab, setActiveTab] = useState<Tab>(
    value.kind === 'custom' ? 'custom' : 
    value.ref.startsWith('semantic.') ? 'semantic' : 'palette'
  );

  const [customHex, setCustomHex] = useState<string>(
    value.kind === 'custom' ? value.hex : '#000000'
  );

  // Resolve current color for preview
  const resolvedColor = resolveColor(value, theme);

  // Contrast check
  let contrastInfo: { ratio: number; level: string; passes: boolean } | null = null;
  if (showContrastCheck && contrastBackground && resolvedColor) {
    const bgColor = resolveColor({ kind: 'tokenRef', ref: contrastBackground }, theme);
    if (bgColor) {
      contrastInfo = evaluateContrast(resolvedColor, bgColor);
    }
  }

  // Handle token selection
  const handleTokenSelect = (ref: string) => {
    onChange({ kind: 'tokenRef', ref });
  };

  // Handle custom hex change
  const handleCustomHexChange = (hex: string) => {
    setCustomHex(hex);
    if (hex.match(/^#[0-9A-Fa-f]{6}$/)) {
      onChange({ kind: 'custom', hex: hex.toUpperCase() });
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium" style={{ color: 'var(--admin-text-secondary)' }}>
          {label}
        </label>
      )}

      {/* Color Preview */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded border-2"
          style={{ backgroundColor: resolvedColor || '#000000', borderColor: 'var(--admin-border-strong)', boxShadow: 'var(--admin-shadow)' }}
        />
        <div className="flex-1">
          <div className="text-sm font-mono" style={{ color: 'var(--admin-text-secondary)' }}>
            {resolvedColor || 'N/A'}
          </div>
          {value.kind === 'tokenRef' && (
            <div className="text-xs truncate" style={{ color: 'var(--admin-text-muted)' }}>
              {value.ref}
            </div>
          )}
        </div>
      </div>

      {/* Contrast Warning */}
      {showContrastCheck && contrastInfo && !contrastInfo.passes && (
        <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>
            Kontrast {contrastInfo.level} (Ratio: {contrastInfo.ratio.toFixed(2)}:1) - Nicht WCAG konform
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--admin-border)' }}>
        <button
          onClick={() => setActiveTab('semantic')}
          className="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
          style={{
            borderColor: activeTab === 'semantic' ? 'var(--admin-accent)' : 'transparent',
            color: activeTab === 'semantic' ? 'var(--admin-accent-text)' : 'var(--admin-text-muted)'
          }}
        >
          Semantik
        </button>
        <button
          onClick={() => setActiveTab('palette')}
          className="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
          style={{
            borderColor: activeTab === 'palette' ? 'var(--admin-accent)' : 'transparent',
            color: activeTab === 'palette' ? 'var(--admin-accent-text)' : 'var(--admin-text-muted)'
          }}
        >
          Palette
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
          style={{
            borderColor: activeTab === 'custom' ? 'var(--admin-accent)' : 'transparent',
            color: activeTab === 'custom' ? 'var(--admin-accent-text)' : 'var(--admin-text-muted)'
          }}
        >
          Custom
        </button>
      </div>

      {/* Tab Content */}
      <div className="max-h-64 overflow-y-auto">
        {/* Semantic Tab */}
        {activeTab === 'semantic' && (
          <div className="space-y-1">
            {SEMANTIC_TOKENS.map((token) => {
              const tokenColor = resolveColor({ kind: 'tokenRef', ref: token.ref }, theme);
              const isSelected = value.kind === 'tokenRef' && value.ref === token.ref;
              
              return (
                <button
                  key={token.ref}
                  onClick={() => handleTokenSelect(token.ref)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors border"
                  style={{
                    backgroundColor: isSelected ? 'var(--admin-accent-bg)' : undefined,
                    borderColor: isSelected ? 'var(--admin-accent-light)' : 'transparent'
                  }}
                >
                  <div
                    className="w-8 h-8 rounded border flex-shrink-0"
                    style={{ backgroundColor: tokenColor || '#000000', borderColor: 'var(--admin-border-strong)' }}
                  />
                  <span className="flex-1 text-left">{token.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Palette Tab */}
        {activeTab === 'palette' && (
          <div className="space-y-4 pt-2">
             <div className="grid grid-cols-[1fr_repeat(3,2rem)] gap-3 px-1 mb-2 text-[10px] uppercase tracking-wider font-medium text-center" style={{ color: 'var(--admin-text-muted)' }}>
                <div className="text-left pl-2">Basis</div>
                <div>1</div>
                <div>2</div>
                <div>3</div>
             </div>
            {[1, 2, 3, 4, 5].map((primaryNum) => {
               const baseRef = `palette.primary${primaryNum}.base` as PaletteTokenRef;
               const baseColor = resolveColor({ kind: 'tokenRef', ref: baseRef }, theme);
               const isBaseSelected = value.kind === 'tokenRef' && value.ref === baseRef;

               return (
                 <div key={primaryNum} className="grid grid-cols-[1fr_repeat(3,2rem)] gap-3 items-center">
                   {/* Base Color (with label) */}
                   <button
                     onClick={() => handleTokenSelect(baseRef)}
                     className="flex items-center gap-3 px-2 py-1.5 rounded border transition-all w-full text-left"
                     style={{
                       backgroundColor: isBaseSelected ? 'var(--admin-accent-bg)' : 'var(--admin-bg-card)',
                       borderColor: isBaseSelected ? 'var(--admin-accent)' : 'var(--admin-border)',
                       boxShadow: isBaseSelected ? '0 0 0 1px var(--admin-accent)' : undefined
                     }}
                   >
                     <div
                       className="w-6 h-6 rounded border flex-shrink-0"
                       style={{ backgroundColor: baseColor || '#000000', borderColor: 'var(--admin-border)', boxShadow: 'var(--admin-shadow)' }}
                     />
                     <span className="text-xs font-medium truncate" style={{ color: 'var(--admin-text-secondary)' }}>Primary {primaryNum}</span>
                   </button>

                   {/* Accents (No Labels, just Boxes) */}
                   {[1, 2, 3].map((accentNum) => {
                     const accRef = `palette.primary${primaryNum}.accents.accent${accentNum}` as PaletteTokenRef;
                     const accColor = resolveColor({ kind: 'tokenRef', ref: accRef }, theme);
                     const isAccSelected = value.kind === 'tokenRef' && value.ref === accRef;

                     return (
                       <button
                         key={accentNum}
                         onClick={() => handleTokenSelect(accRef)}
                         title={`Primary ${primaryNum} - Accent ${accentNum}`}
                         className={`w-8 h-8 rounded border transition-all ${
                           isAccSelected 
                            ? 'z-10 scale-105' 
                            : 'hover:scale-105'
                         }`}
                         style={{
                           backgroundColor: accColor || '#000000',
                           borderColor: isAccSelected ? 'var(--admin-accent)' : 'var(--admin-border)',
                           boxShadow: isAccSelected ? '0 0 0 2px var(--admin-accent-light)' : 'var(--admin-shadow)'
                         }}
                       />
                     );
                   })}
                 </div>
               );
            })}
          </div>
        )}

        {/* Custom Tab */}
        {activeTab === 'custom' && (
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text-secondary)' }}>
                Hex Color
              </label>
              <input
                type="text"
                value={customHex}
                onChange={(e) => handleCustomHexChange(e.target.value)}
                placeholder="#000000"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent font-mono text-sm"
                style={{ borderColor: 'var(--admin-border-strong)', boxShadow: 'var(--admin-shadow)', backgroundColor: 'var(--admin-bg-input)', color: 'var(--admin-text)', '--tw-ring-color': 'var(--admin-accent)' } as React.CSSProperties}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text-secondary)' }}>
                Color Picker
              </label>
              <input
                type="color"
                value={customHex}
                onChange={(e) => handleCustomHexChange(e.target.value)}
                className="w-full h-12 rounded border cursor-pointer"
                style={{ borderColor: 'var(--admin-border-strong)' }}
              />
            </div>
            
            {/* Text Contrast Recommendations */}
            {showTextContrasts && resolvedColor && (
              <div className="pt-3 border-t" style={{ borderColor: 'var(--admin-border)' }}>
                <TextContrastPreview
                  bgColor={resolvedColor}
                  selectedColor={value.kind === 'custom' ? value.hex : undefined}
                  onSelectContrast={(_weight, color) => {
                    handleCustomHexChange(color);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
