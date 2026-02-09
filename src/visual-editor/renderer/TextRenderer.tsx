// =====================================================
// VISUAL EDITOR – TEXT RENDERER
// Rendert ein VEText-Element im Canvas
// =====================================================

import React from 'react';
import type { VEText, TextStylePreset } from '../types/elements';
import type { VEViewport } from '../types/styles';
import { resolveStyles } from '../utils/styleResolver';

interface TextRendererProps {
  element: VEText;
  viewport: VEViewport;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

/** Default-Styles pro TextStylePreset */
const presetDefaults: Record<TextStylePreset, React.CSSProperties> = {
  h1: { fontSize: '48px', fontWeight: 700, lineHeight: 1.2, margin: 0 },
  h2: { fontSize: '36px', fontWeight: 700, lineHeight: 1.3, margin: 0 },
  h3: { fontSize: '28px', fontWeight: 600, lineHeight: 1.3, margin: 0 },
  h4: { fontSize: '24px', fontWeight: 600, lineHeight: 1.4, margin: 0 },
  h5: { fontSize: '20px', fontWeight: 600, lineHeight: 1.4, margin: 0 },
  h6: { fontSize: '18px', fontWeight: 600, lineHeight: 1.4, margin: 0 },
  body: { fontSize: '16px', fontWeight: 400, lineHeight: 1.6, margin: 0 },
  'body-sm': { fontSize: '14px', fontWeight: 400, lineHeight: 1.5, margin: 0 },
  caption: { fontSize: '12px', fontWeight: 400, lineHeight: 1.4, margin: 0 },
  price: { fontSize: '24px', fontWeight: 700, lineHeight: 1.2, margin: 0 },
  label: { fontSize: '14px', fontWeight: 600, lineHeight: 1.4, textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: 0 },
};

/** HTML-Tag pro Preset */
const presetTag: Record<TextStylePreset, string> = {
  h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5', h6: 'h6',
  body: 'p', 'body-sm': 'p', caption: 'span', price: 'span', label: 'span',
};

export const TextRenderer: React.FC<TextRendererProps> = ({ element, viewport, isSelected, onSelect }) => {
  const resolvedStyles = resolveStyles(element.styles, viewport);
  const preset = element.textStyle || 'body';
  const defaults = presetDefaults[preset];
  const tag = presetTag[preset];

  const combinedStyles: React.CSSProperties = {
    ...defaults,
    ...resolvedStyles,
  };

  return React.createElement(tag, {
    'data-ve-id': element.id,
    'data-ve-type': element.type,
    style: combinedStyles,
    onClick: (e: React.MouseEvent) => { e.stopPropagation(); onSelect(element.id); },
    className: isSelected ? 've-selected' : '',
    dangerouslySetInnerHTML: { __html: element.content },
  });
};
