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

const PALETTE_TOKENS: { ref: PaletteTokenRef; label: string }[] = [
  { ref: 'palette.primary1.base', label: 'Primary 1' },
  { ref: 'palette.primary1.accents.accent1', label: 'Primary 1 - Accent 1' },
  { ref: 'palette.primary1.accents.accent2', label: 'Primary 1 - Accent 2' },
  { ref: 'palette.primary1.accents.accent3', label: 'Primary 1 - Accent 3' },
  { ref: 'palette.primary2.base', label: 'Primary 2' },
  { ref: 'palette.primary2.accents.accent1', label: 'Primary 2 - Accent 1' },
  { ref: 'palette.primary2.accents.accent2', label: 'Primary 2 - Accent 2' },
  { ref: 'palette.primary2.accents.accent3', label: 'Primary 2 - Accent 3' },
  { ref: 'palette.primary3.base', label: 'Primary 3' },
  { ref: 'palette.primary3.accents.accent1', label: 'Primary 3 - Accent 1' },
  { ref: 'palette.primary3.accents.accent2', label: 'Primary 3 - Accent 2' },
  { ref: 'palette.primary3.accents.accent3', label: 'Primary 3 - Accent 3' },
  { ref: 'palette.primary4.base', label: 'Primary 4' },
  { ref: 'palette.primary4.accents.accent1', label: 'Primary 4 - Accent 1' },
  { ref: 'palette.primary4.accents.accent2', label: 'Primary 4 - Accent 2' },
  { ref: 'palette.primary4.accents.accent3', label: 'Primary 4 - Accent 3' },
  { ref: 'palette.primary5.base', label: 'Primary 5' },
  { ref: 'palette.primary5.accents.accent1', label: 'Primary 5 - Accent 1' },
  { ref: 'palette.primary5.accents.accent2', label: 'Primary 5 - Accent 2' },
  { ref: 'palette.primary5.accents.accent3', label: 'Primary 5 - Accent 3' },
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
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Color Preview */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded border-2 border-gray-300 shadow-sm"
          style={{ backgroundColor: resolvedColor || '#000000' }}
        />
        <div className="flex-1">
          <div className="text-sm font-mono text-gray-600">
            {resolvedColor || 'N/A'}
          </div>
          {value.kind === 'tokenRef' && (
            <div className="text-xs text-gray-500 truncate">
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
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('semantic')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'semantic'
              ? 'border-rose-500 text-rose-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Semantik
        </button>
        <button
          onClick={() => setActiveTab('palette')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'palette'
              ? 'border-rose-500 text-rose-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Palette
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'custom'
              ? 'border-rose-500 text-rose-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
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
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                    isSelected
                      ? 'bg-rose-50 border border-rose-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded border border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: tokenColor || '#000000' }}
                  />
                  <span className="flex-1 text-left">{token.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Palette Tab */}
        {activeTab === 'palette' && (
          <div className="space-y-1">
            {PALETTE_TOKENS.map((token) => {
              const tokenColor = resolveColor({ kind: 'tokenRef', ref: token.ref }, theme);
              const isSelected = value.kind === 'tokenRef' && value.ref === token.ref;
              
              return (
                <button
                  key={token.ref}
                  onClick={() => handleTokenSelect(token.ref)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                    isSelected
                      ? 'bg-rose-50 border border-rose-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded border border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: tokenColor || '#000000' }}
                  />
                  <span className="flex-1 text-left">{token.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Custom Tab */}
        {activeTab === 'custom' && (
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hex Color
              </label>
              <input
                type="text"
                value={customHex}
                onChange={(e) => handleCustomHexChange(e.target.value)}
                placeholder="#000000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Picker
              </label>
              <input
                type="color"
                value={customHex}
                onChange={(e) => handleCustomHexChange(e.target.value)}
                className="w-full h-12 rounded border border-gray-300 cursor-pointer"
              />
            </div>
            
            {/* Text Contrast Recommendations */}
            {showTextContrasts && resolvedColor && (
              <div className="pt-3 border-t border-gray-200">
                <TextContrastPreview
                  bgColor={resolvedColor}
                  selectedColor={value.kind === 'custom' ? value.hex : undefined}
                  onSelectContrast={(weight, color) => {
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
