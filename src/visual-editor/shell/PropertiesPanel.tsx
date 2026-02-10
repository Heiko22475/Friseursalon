// =====================================================
// VISUAL EDITOR – PROPERTIES PANEL
// Rechte Seite: Styling + Content Properties (~320px)
// Phase 2: Voll integrierte Sections mit Theme-Support
// =====================================================

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Trash2, Copy, Monitor, Tablet, Smartphone } from 'lucide-react';
import { useEditor } from '../state/EditorContext';
import type { StyleProperties } from '../types/styles';
import { mergeStyles } from '../utils/styleResolver';

// Section Components
import { LayoutSection } from '../properties/LayoutSection';
import { SizeSection } from '../properties/SizeSection';
import { TypographySection } from '../properties/TypographySection';
import { BackgroundSection } from '../properties/BackgroundSection';
import { BorderSection } from '../properties/BorderSection';
import { EffectsSection } from '../properties/EffectsSection';
import { ContentSection } from '../properties/ContentSection';
import { SpacingBox } from '../components/SpacingBox';
import { FooterProperties } from '../properties/FooterProperties';
import { HeaderProperties } from '../properties/HeaderProperties';
import { CardsProperties } from '../properties/CardsProperties';
import { WebsiteBlockProperties } from './WebsiteBlockProperties';
import type { VEFooter, VEHeader, VECards, VEWebsiteBlock } from '../types/elements';

// ===== ACCORDION SECTION =====

interface AccordionSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  /** Show dot indicator when section has values set */
  hasValues?: boolean;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({ title, children, defaultOpen = false, hasValues }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{ borderBottom: '1px solid #2d2d3d' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '10px 12px',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#d1d5db',
          fontSize: '12px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        {title}
        {hasValues && (
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            marginLeft: 'auto',
          }} />
        )}
      </button>
      {open && (
        <div style={{ padding: '4px 12px 12px' }}>
          {children}
        </div>
      )}
    </div>
  );
};

// ===== ELEMENT TYPE TAG COLORS =====

const TYPE_COLORS: Record<string, string> = {
  Body: '#6366f1',
  Section: '#8b5cf6',
  Container: '#a855f7',
  Text: '#3b82f6',
  Image: '#10b981',
  Button: '#f59e0b',
  Cards: '#ec4899',
  Header: '#14b8a6',
  Footer: '#f97316',
  WebsiteBlock: '#0ea5e9',
};

// ===== PROPERTIES PANEL =====

export const PropertiesPanel: React.FC = () => {
  const { state, dispatch, selectedElement } = useEditor();

  if (!selectedElement) {
    return (
      <div
        style={{
          width: '320px',
          backgroundColor: '#1e1e2e',
          borderLeft: '1px solid #2d2d3d',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          fontSize: '13px',
          flexShrink: 0,
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '24px' }}>⬅</span>
        Wähle ein Element aus
      </div>
    );
  }

  const merged = mergeStyles(selectedElement.styles, state.viewport);

  const updateStyle = (key: keyof StyleProperties, value: any) => {
    dispatch({
      type: 'UPDATE_STYLES',
      id: selectedElement.id,
      viewport: state.viewport,
      styles: { [key]: value === '' ? undefined : value },
    });
  };

  /** Debounced variant for slider / rapid changes (fewer undo entries) */
  const updateStyleBatch = (key: keyof StyleProperties, value: any) => {
    dispatch({
      type: 'UPDATE_STYLES_BATCH',
      id: selectedElement.id,
      viewport: state.viewport,
      styles: { [key]: value === '' ? undefined : value },
    });
  };

  // Determine which sections are relevant for the element type
  const isTextLike = selectedElement.type === 'Text' || selectedElement.type === 'Button';
  const isContainer = ['Body', 'Section', 'Container'].includes(selectedElement.type);
  const hasContent = ['Text', 'Image', 'Button'].includes(selectedElement.type);
  const isHeaderFooter = selectedElement.type === 'Header' || selectedElement.type === 'Footer';
  const isCards = selectedElement.type === 'Cards';
  const isWebsiteBlock = selectedElement.type === 'WebsiteBlock';
  const typeColor = TYPE_COLORS[selectedElement.type] || '#6b7280';

  // Check which sections have values
  const hasLayoutValues = !!(merged.display || merged.flexDirection || merged.justifyContent || merged.alignItems);
  const hasSpacingValues = !!(merged.paddingTop || merged.paddingBottom || merged.paddingLeft || merged.paddingRight || merged.marginTop || merged.marginBottom);
  const hasSizeValues = !!(merged.width || merged.height || merged.maxWidth || merged.minWidth);
  const hasTypoValues = !!(merged.fontFamily || merged.fontSize || merged.fontWeight || merged.color);
  const hasBgValues = !!(merged.backgroundColor || merged.backgroundImage);
  const hasBorderValues = !!(merged.borderWidth || merged.borderColor || merged.borderRadius);
  const hasEffectValues = !!(merged.boxShadow || merged.position);

  return (
    <div
      style={{
        width: '320px',
        backgroundColor: '#1e1e2e',
        borderLeft: '1px solid #2d2d3d',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Element Header */}
      <div
        style={{
          padding: '12px',
          borderBottom: '1px solid #2d2d3d',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Type badge */}
            <span style={{
              padding: '2px 8px',
              backgroundColor: typeColor + '20',
              border: `1px solid ${typeColor}40`,
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 600,
              color: typeColor,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {selectedElement.type}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#d1d5db' }}>
              {selectedElement.label || ''}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '2px' }}>
            <button
              onClick={() => dispatch({ type: 'DUPLICATE_ELEMENT', id: selectedElement.id })}
              disabled={selectedElement.type === 'Body'}
              title="Duplizieren (Ctrl+D)"
              style={{
                padding: '4px',
                backgroundColor: 'transparent',
                border: 'none',
                color: selectedElement.type === 'Body' ? '#3d3d4d' : '#9ca3af',
                cursor: selectedElement.type === 'Body' ? 'default' : 'pointer',
                borderRadius: '4px',
                display: 'flex',
              }}
            >
              <Copy size={14} />
            </button>
            <button
              onClick={() => dispatch({ type: 'REMOVE_ELEMENT', id: selectedElement.id })}
              disabled={selectedElement.type === 'Body'}
              title="Löschen (Del)"
              style={{
                padding: '4px',
                backgroundColor: 'transparent',
                border: 'none',
                color: selectedElement.type === 'Body' ? '#3d3d4d' : '#ef4444',
                cursor: selectedElement.type === 'Body' ? 'default' : 'pointer',
                borderRadius: '4px',
                display: 'flex',
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Viewport indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
          {state.viewport === 'desktop' && <Monitor size={12} style={{ color: '#6b7280' }} />}
          {state.viewport === 'tablet' && <Tablet size={12} style={{ color: '#6b7280' }} />}
          {state.viewport === 'mobile' && <Smartphone size={12} style={{ color: '#6b7280' }} />}
          <span style={{ fontSize: '11px', color: '#6b7280' }}>
            {state.viewport === 'desktop' ? 'Desktop' : state.viewport === 'tablet' ? 'Tablet' : 'Mobile'} Styles
          </span>
          {state.viewport !== 'desktop' && (
            <span style={{ fontSize: '10px', color: '#4a4a5a', marginLeft: '4px' }}>
              (erbt von Desktop)
            </span>
          )}
        </div>
      </div>

      {/* Scrollable Properties */}
      <div style={{ flex: 1, overflow: 'auto' }}>

        {/* WebsiteBlock: full config editor */}
        {isWebsiteBlock && (
          <WebsiteBlockProperties element={selectedElement as VEWebsiteBlock} />
        )}

        {/* Header/Footer: dedicated config panels */}
        {selectedElement.type === 'Footer' && (
          <AccordionSection title="Footer Konfiguration" defaultOpen>
            <FooterProperties element={selectedElement as VEFooter} />
          </AccordionSection>
        )}

        {selectedElement.type === 'Header' && (
          <AccordionSection title="Header Konfiguration" defaultOpen>
            <HeaderProperties element={selectedElement as VEHeader} />
          </AccordionSection>
        )}

        {isCards && (
          <AccordionSection title="Karten Konfiguration" defaultOpen>
            <CardsProperties element={selectedElement as VECards} />
          </AccordionSection>
        )}

        {/* Content (element-specific) */}
        {hasContent && !isWebsiteBlock && (
          <AccordionSection title="Inhalt" defaultOpen>
            <ContentSection element={selectedElement} />
          </AccordionSection>
        )}

        {/* Layout */}
        {isContainer && !isHeaderFooter && !isCards && !isWebsiteBlock && (
          <AccordionSection title="Layout" defaultOpen={isContainer} hasValues={hasLayoutValues}>
            <LayoutSection styles={merged} onChange={updateStyle} />
          </AccordionSection>
        )}

        {/* Spacing (Box Model) */}
        {!isHeaderFooter && !isWebsiteBlock && (
        <AccordionSection title="Spacing" hasValues={hasSpacingValues}>
          <SpacingBox styles={merged} onChange={updateStyleBatch} />
        </AccordionSection>
        )}

        {/* Size */}
        {!isHeaderFooter && !isWebsiteBlock && (
        <AccordionSection title="Größe" hasValues={hasSizeValues}>
          <SizeSection styles={merged} onChange={updateStyleBatch} />
        </AccordionSection>
        )}

        {/* Typography (only for text-like elements or containers that can have text) */}
        {(isTextLike || isContainer) && !isHeaderFooter && !isWebsiteBlock && (
          <AccordionSection title="Typografie" defaultOpen={isTextLike} hasValues={hasTypoValues}>
            <TypographySection styles={merged} onChange={updateStyle} />
          </AccordionSection>
        )}

        {/* Background */}
        {!isHeaderFooter && !isWebsiteBlock && (
        <AccordionSection title="Hintergrund" hasValues={hasBgValues}>
          <BackgroundSection styles={merged} onChange={updateStyle} />
        </AccordionSection>
        )}

        {/* Border */}
        {!isHeaderFooter && !isWebsiteBlock && (
        <AccordionSection title="Rahmen" hasValues={hasBorderValues}>
          <BorderSection styles={merged} onChange={updateStyle} />
        </AccordionSection>
        )}

        {/* Effects (Shadow, Position, Cursor) */}
        {!isHeaderFooter && !isWebsiteBlock && (
        <AccordionSection title="Effekte" hasValues={hasEffectValues}>
          <EffectsSection styles={merged} onChange={updateStyle} />
        </AccordionSection>
        )}
      </div>
    </div>
  );
};
