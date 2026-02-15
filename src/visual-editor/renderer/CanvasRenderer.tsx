// =====================================================
// VISUAL EDITOR – CANVAS RENDERER
// Hauptkomponente: rendert die gesamte Page im Canvas
// =====================================================

import React, { useMemo } from 'react';
import type { VEPage } from '../types/elements';
import type { VEViewport } from '../types/styles';
import { BodyRenderer } from './BodyRenderer';
import { useEditor } from '../state/EditorContext';
import { mergeStylesWithClasses, resolveElementStylesWithClasses, stylesToCSS } from '../utils/styleResolver';
import { findElementById } from '../utils/elementHelpers';

interface CanvasRendererProps {
  page: VEPage;
  viewport: VEViewport;
  selectedId: string | null;
  hoveredId?: string | null;
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
}

const viewportWidths: Record<VEViewport, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

/**
 * Converts React.CSSProperties to a CSS declaration string.
 */
function cssObjToString(css: React.CSSProperties): string {
  return Object.entries(css)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => {
      // camelCase → kebab-case
      const prop = k.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
      return `${prop}: ${v}`;
    })
    .join('; ');
}

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({ page, viewport, selectedId, hoveredId, onSelect, onHover }) => {
  const { state } = useEditor();
  const { activeState, globalStyles } = state;

  // When a pseudo-state is active, generate inline CSS that overrides
  // the selected element's styles so the canvas shows the hover/focus/active preview.
  const pseudoPreviewCSS = useMemo(() => {
    if (!activeState || !selectedId) return '';

    const el = findElementById(page.body, selectedId);
    if (!el) return '';

    // Resolve class + inline styles, then read pseudo from that
    const resolved = mergeStylesWithClasses(el.classNames, el.styles, globalStyles, viewport);
    const fullStyles = resolveElementStylesWithClasses(el.classNames, el.styles, globalStyles);
    const psDef = fullStyles.pseudoStyles?.[activeState];
    if (!psDef) return '';

    const pseudoVP = psDef[viewport] || {};
    const combined = { ...resolved, ...pseudoVP };
    const combinedCSS = stylesToCSS(combined);
    const declarations = cssObjToString(combinedCSS);

    if (!declarations) return '';

    // Use !important to override inline styles set by the renderer
    const importantDeclarations = declarations
      .split('; ')
      .map(d => d + ' !important')
      .join('; ');

    return `[data-ve-id="${selectedId}"] { ${importantDeclarations} }`;
  }, [activeState, selectedId, page.body, viewport, globalStyles]);

  return (
    <div
      className="ve-canvas"
      style={{
        width: viewportWidths[viewport],
        maxWidth: '100%',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        minHeight: '100%',
        transition: 'width 0.3s ease',
        position: 'relative',
      }}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Pseudo-state style preview overlay */}
      {pseudoPreviewCSS && (
        <style dangerouslySetInnerHTML={{ __html: pseudoPreviewCSS }} />
      )}
      <BodyRenderer
        element={page.body}
        viewport={viewport}
        selectedId={selectedId}
        hoveredId={hoveredId ?? null}
        onSelect={onSelect}
        onHover={onHover}
      />
    </div>
  );
};
