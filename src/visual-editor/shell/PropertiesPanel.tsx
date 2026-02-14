// =====================================================
// VISUAL EDITOR – PROPERTIES PANEL
// Rechte Seite: Styling + Content Properties (~370px)
// Phase 2: Voll integrierte Sections mit Theme-Support
// =====================================================

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Trash2, Copy, Monitor, Tablet, Smartphone, Eye, EyeOff } from 'lucide-react';
import { useEditor } from '../state/EditorContext';
import type { StyleProperties } from '../types/styles';
import { mergeStyles } from '../utils/styleResolver';

// Section Components
import { LayoutSection, FlexChildSection, GridChildSection } from '../properties/LayoutSection';
import { SizeSection } from '../properties/SizeSection';
import { TypographySection } from '../properties/TypographySection';
import { BackgroundSection } from '../properties/BackgroundSection';
import { BorderSection } from '../properties/BorderSection';
import { EffectsSection } from '../properties/EffectsSection';
import { PositionSection } from '../properties/PositionSection';
import { ContentSection } from '../properties/ContentSection';
import { SpacingBox } from '../components/SpacingBox';
import { FooterProperties } from '../properties/FooterProperties';
import { HeaderProperties } from '../properties/HeaderProperties';
import { CardsProperties } from '../properties/CardsProperties';
import { NavbarProperties } from '../properties/NavbarProperties';
import { WebsiteBlockProperties } from './WebsiteBlockProperties';
import { findParent } from '../utils/elementHelpers';
import type { VEFooter, VEHeader, VECards, VENavbar, VEWebsiteBlock } from '../types/elements';

// ===== ACCORDION SECTION =====

interface AccordionSectionProps {
  title: string;
  children: React.ReactNode;
  /** Show dot indicator when section has values set */
  hasValues?: boolean;
  /** Controlled: is this section open? */
  isOpen?: boolean;
  /** Controlled: toggle callback */
  onToggle?: () => void;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({ title, children, hasValues, isOpen, onToggle }) => {
  const open = isOpen ?? false;

  return (
    <div style={{ borderBottom: '1px solid #2d2d3d' }}>
      <button
        onClick={onToggle}
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
  Navbar: '#06b6d4',
  Header: '#14b8a6',
  Footer: '#f97316',
  WebsiteBlock: '#0ea5e9',
};

// ===== PROPERTIES PANEL =====

export const PropertiesPanel: React.FC = () => {
  const { state, dispatch, selectedElement } = useEditor();
  // Single-accordion: only one section open at a time
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (key: string) => {
    setOpenSection(prev => prev === key ? null : key);
  };

  // Reset open section when element changes
  useEffect(() => {
    setOpenSection(null);
  }, [state.selectedId]);

  if (!selectedElement) {
    return (
      <div
        style={{
          width: '370px',
          backgroundColor: '#1e1e2e',
          borderLeft: '1px solid #2d2d3d',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#b0b7c3',
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

  // Check element types
  const isCards = selectedElement.type === 'Cards';

  // Detect parent display mode for flex-child / grid-child sections
  const parentElement = selectedElement.type !== 'Body'
    ? findParent(state.page.body, selectedElement.id)
    : null;
  const parentMerged = parentElement ? mergeStyles(parentElement.styles, state.viewport) : {};
  const parentIsFlex = parentMerged.display === 'flex' || parentMerged.display === 'inline-flex';
  const parentIsGrid = parentMerged.display === 'grid';

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
  const isContainer = ['Body', 'Section', 'Container', 'Cards', 'Navbar'].includes(selectedElement.type);
  const hasContent = ['Text', 'Image', 'Button'].includes(selectedElement.type);
  const isNavbar = selectedElement.type === 'Navbar';
  const isHeaderFooter = selectedElement.type === 'Header' || selectedElement.type === 'Footer';
  const isWebsiteBlock = selectedElement.type === 'WebsiteBlock';
  const typeColor = TYPE_COLORS[selectedElement.type] || '#b0b7c3';

  // Check which sections have values
  const hasLayoutValues = !!(merged.display || merged.flexDirection || merged.justifyContent || merged.alignItems);
  const hasSpacingValues = !!(merged.paddingTop || merged.paddingBottom || merged.paddingLeft || merged.paddingRight || merged.marginTop || merged.marginBottom);
  const hasSizeValues = !!(merged.width || merged.height || merged.maxWidth || merged.minWidth);
  const hasTypoValues = !!(merged.fontFamily || merged.fontSize || merged.fontWeight || merged.color);
  const hasBgValues = !!(merged.backgroundColor || merged.backgroundImage);
  const hasBorderValues = !!(merged.borderWidth || merged.borderColor || merged.borderRadius);
  const hasPositionValues = !!(merged.position || merged.top || merged.right || merged.bottom || merged.left || merged.zIndex);
  const hasEffectValues = !!(merged.boxShadow || merged.overflow || merged.opacity !== undefined);

  // Viewport visibility: check if display is 'none' on current viewport
  const isHiddenOnViewport = (() => {
    const vp = state.viewport;
    const styles = selectedElement.styles;
    if (vp === 'desktop') return styles?.desktop?.display === 'none';
    if (vp === 'tablet') return styles?.tablet?.display === 'none';
    return styles?.mobile?.display === 'none';
  })();

  return (
    <div
      style={{
        width: '370px',
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
                color: selectedElement.type === 'Body' ? '#3d3d4d' : '#b0b7c3',
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
          {state.viewport === 'desktop' && <Monitor size={12} style={{ color: '#b0b7c3' }} />}
          {state.viewport === 'tablet' && <Tablet size={12} style={{ color: '#b0b7c3' }} />}
          {state.viewport === 'mobile' && <Smartphone size={12} style={{ color: '#b0b7c3' }} />}
          <span style={{ fontSize: '11px', color: '#b0b7c3' }}>
            {state.viewport === 'desktop' ? 'Desktop' : state.viewport === 'tablet' ? 'Tablet' : 'Mobile'} Styles
          </span>
          {state.viewport !== 'desktop' && (
            <span style={{ fontSize: '10px', color: '#9ca3af', marginLeft: '4px' }}>
              (erbt von Desktop)
            </span>
          )}
        </div>

        {/* Viewport Visibility Toggle */}
        {selectedElement.type !== 'Body' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
            <button
              onClick={() => {
                dispatch({
                  type: 'UPDATE_STYLES',
                  id: selectedElement.id,
                  viewport: state.viewport,
                  styles: { display: isHiddenOnViewport ? undefined : 'none' as any },
                });
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px',
                backgroundColor: isHiddenOnViewport ? '#ef444420' : '#10b98120',
                border: `1px solid ${isHiddenOnViewport ? '#ef444440' : '#10b98140'}`,
                borderRadius: '4px',
                cursor: 'pointer',
                color: isHiddenOnViewport ? '#f87171' : '#34d399',
                fontSize: '11px',
                fontWeight: 500,
                width: '100%',
              }}
              title={isHiddenOnViewport
                ? `Auf ${state.viewport === 'desktop' ? 'Desktop' : state.viewport === 'tablet' ? 'Tablet' : 'Mobile'} einblenden`
                : `Auf ${state.viewport === 'desktop' ? 'Desktop' : state.viewport === 'tablet' ? 'Tablet' : 'Mobile'} ausblenden`
              }
            >
              {isHiddenOnViewport ? <EyeOff size={12} /> : <Eye size={12} />}
              {isHiddenOnViewport
                ? `Ausgeblendet auf ${state.viewport === 'desktop' ? 'Desktop' : state.viewport === 'tablet' ? 'Tablet' : 'Mobile'}`
                : `Sichtbar auf ${state.viewport === 'desktop' ? 'Desktop' : state.viewport === 'tablet' ? 'Tablet' : 'Mobile'}`
              }
            </button>
          </div>
        )}
      </div>

      {/* Scrollable Properties */}
      <div style={{ flex: 1, overflow: 'auto' }}>

        {/* WebsiteBlock: full config editor */}
        {isWebsiteBlock && (
          <WebsiteBlockProperties element={selectedElement as VEWebsiteBlock} />
        )}

        {/* Header/Footer: dedicated config panels */}
        {selectedElement.type === 'Footer' && (
          <AccordionSection title="Footer Konfiguration" isOpen={openSection === 'footer-config'} onToggle={() => toggleSection('footer-config')}>
            <FooterProperties element={selectedElement as VEFooter} />
          </AccordionSection>
        )}

        {selectedElement.type === 'Header' && (
          <AccordionSection title="Header Konfiguration (Legacy)" isOpen={openSection === 'header-config'} onToggle={() => toggleSection('header-config')}>
            <HeaderProperties element={selectedElement as VEHeader} />
          </AccordionSection>
        )}

        {isNavbar && (
          <AccordionSection title="Navbar Konfiguration" isOpen={openSection === 'navbar-config'} onToggle={() => toggleSection('navbar-config')}>
            <NavbarProperties element={selectedElement as VENavbar} />
          </AccordionSection>
        )}

        {isCards && (
          <AccordionSection title="Karten Konfiguration" isOpen={openSection === 'cards-config'} onToggle={() => toggleSection('cards-config')}>
            <CardsProperties element={selectedElement as VECards} />
          </AccordionSection>
        )}

        {/* Content (element-specific) */}
        {hasContent && !isWebsiteBlock && (
          <AccordionSection title="Inhalt" isOpen={openSection === 'content'} onToggle={() => toggleSection('content')}>
            <ContentSection element={selectedElement} />
          </AccordionSection>
        )}

        {/* Layout */}
        {isContainer && !isHeaderFooter && !isWebsiteBlock && (
          <AccordionSection title="Layout" isOpen={openSection === 'layout'} onToggle={() => toggleSection('layout')} hasValues={hasLayoutValues}>
            <LayoutSection styles={merged} onChange={updateStyle} />
          </AccordionSection>
        )}

        {/* Flex Child (shown when parent is flex) */}
        {parentIsFlex && !isHeaderFooter && !isWebsiteBlock && (
          <AccordionSection
            title="Flex Kind"
            isOpen={openSection === 'flex-child'}
            onToggle={() => toggleSection('flex-child')}
            hasValues={!!(merged.flexGrow || merged.flexShrink || merged.flexBasis || merged.alignSelf || merged.order)}
          >
            <FlexChildSection styles={merged} onChange={updateStyle} />
          </AccordionSection>
        )}

        {/* Grid Child (shown when parent is grid) */}
        {parentIsGrid && !isHeaderFooter && !isWebsiteBlock && (
          <AccordionSection
            title="Grid Kind"
            isOpen={openSection === 'grid-child'}
            onToggle={() => toggleSection('grid-child')}
            hasValues={!!(merged.gridColumn || merged.gridRow || merged.alignSelf || merged.justifySelf)}
          >
            <GridChildSection styles={merged} onChange={updateStyle} />
          </AccordionSection>
        )}

        {/* Spacing (Box Model) */}
        {!isHeaderFooter && !isWebsiteBlock && (
        <AccordionSection title="Spacing" isOpen={openSection === 'spacing'} onToggle={() => toggleSection('spacing')} hasValues={hasSpacingValues}>
          <SpacingBox styles={merged} onChange={updateStyleBatch} />
        </AccordionSection>
        )}

        {/* Size */}
        {!isHeaderFooter && !isWebsiteBlock && (
        <AccordionSection title="Größe" isOpen={openSection === 'size'} onToggle={() => toggleSection('size')} hasValues={hasSizeValues}>
          <SizeSection styles={merged} onChange={updateStyleBatch} />
        </AccordionSection>
        )}

        {/* Typography (only for text-like elements or containers that can have text) */}
        {(isTextLike || isContainer) && !isHeaderFooter && !isWebsiteBlock && (
          <AccordionSection title="Typografie" isOpen={openSection === 'typography'} onToggle={() => toggleSection('typography')} hasValues={hasTypoValues}>
            <TypographySection styles={merged} onChange={updateStyle} />
          </AccordionSection>
        )}

        {/* Background */}
        {!isHeaderFooter && !isWebsiteBlock && (
        <AccordionSection title="Hintergrund" isOpen={openSection === 'background'} onToggle={() => toggleSection('background')} hasValues={hasBgValues}>
          <BackgroundSection styles={merged} onChange={updateStyle} />
        </AccordionSection>
        )}

        {/* Border */}
        {!isHeaderFooter && !isWebsiteBlock && (
        <AccordionSection title="Rahmen" isOpen={openSection === 'border'} onToggle={() => toggleSection('border')} hasValues={hasBorderValues}>
          <BorderSection styles={merged} onChange={updateStyle} />
        </AccordionSection>
        )}

        {/* Position */}
        {!isHeaderFooter && !isWebsiteBlock && (
        <AccordionSection title="Position" isOpen={openSection === 'position'} onToggle={() => toggleSection('position')} hasValues={hasPositionValues}>
          <PositionSection styles={merged} onChange={updateStyle} />
        </AccordionSection>
        )}

        {/* Effects (Shadow, Overflow, Cursor) */}
        {!isHeaderFooter && !isWebsiteBlock && (
        <AccordionSection title="Effekte" isOpen={openSection === 'effects'} onToggle={() => toggleSection('effects')} hasValues={hasEffectValues}>
          <EffectsSection styles={merged} onChange={updateStyle} />
        </AccordionSection>
        )}
      </div>
    </div>
  );
};
