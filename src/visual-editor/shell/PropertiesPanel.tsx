// =====================================================
// VISUAL EDITOR – PROPERTIES PANEL
// Rechte Seite: Styling + Content Properties (~370px)
// Phase 2: Voll integrierte Sections mit Theme-Support
// =====================================================

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Trash2, Copy, Monitor, Tablet, Smartphone, Eye, EyeOff, Zap, ArrowLeft } from 'lucide-react';
import { useEditor } from '../state/EditorContext';
import type { StyleProperties } from '../types/styles';
import { mergeStyles, mergeStylesWithClasses, resolveTypographyToken } from '../utils/styleResolver';
import { ClassSelector } from '../components/ClassSelector';

// Section Components
import { LayoutSection, FlexChildSection, GridChildSection } from '../properties/LayoutSection';
import { SizeSection } from '../properties/SizeSection';
import { TypographySection } from '../properties/TypographySection';
import { BackgroundSection } from '../properties/BackgroundSection';
import { BorderSection } from '../properties/BorderSection';
import { EffectsSection } from '../properties/EffectsSection';
import { PositionSection } from '../properties/PositionSection';
import { TransformSection } from '../properties/TransformSection';
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
    <div style={{ borderBottom: '1px solid var(--admin-border)' }}>
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
          color: 'var(--admin-text)',
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
  Divider: 'var(--admin-text-secondary)',
  Spacer: 'var(--admin-text-muted)',
  Icon: '#a78bfa',
  List: '#22d3ee',
  ListItem: '#67e8f9',
};

// ===== PROPERTIES PANEL =====

export const PropertiesPanel: React.FC = () => {
  const { state, dispatch, selectedElement } = useEditor();
  // Single-accordion: only one section open at a time
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (key: string) => {
    setOpenSection(prev => prev === key ? null : key);
  };

  // Keep the last opened section when switching elements
  // (removed reset to null — user stays in the same section)

  if (!selectedElement) {
    return (
      <div
        style={{
          width: '370px',
          backgroundColor: 'var(--admin-bg-card)',
          borderLeft: '1px solid var(--admin-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--admin-text-icon)',
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

  const baseMerged = mergeStylesWithClasses(selectedElement.classNames, selectedElement.styles, state.globalStyles, state.viewport);

  // When editing a class, show class styles for that viewport
  const editingClass = state.editingClass;
  const editingClassDef = editingClass ? state.globalStyles[editingClass] : null;

  // When editing a pseudo-state, show base styles merged with pseudo overrides
  const activeState = state.activeState;

  // Determine which styles to show in the panel
  const merged = (() => {
    if (editingClassDef) {
      // Editing a class: show the class definition styles
      const classMerged = mergeStyles(editingClassDef, state.viewport);
      if (!activeState) return classMerged;
      const ps = editingClassDef.pseudoStyles?.[activeState];
      if (!ps) return classMerged;
      const vpStyles = ps[state.viewport] || {};
      return { ...classMerged, ...vpStyles };
    }
    // Normal: element with class+inline resolved
    if (!activeState) return baseMerged;
    const ps = selectedElement.styles?.pseudoStyles?.[activeState];
    if (!ps) return baseMerged;
    const vpStyles = ps[state.viewport] || {};
    return { ...baseMerged, ...vpStyles };
  })();

  // Check element types
  const isCards = selectedElement.type === 'Cards';
  const proMode = state.proMode;

  // Detect parent display mode for flex-child / grid-child sections
  const parentElement = selectedElement.type !== 'Body'
    ? findParent(state.page.body, selectedElement.id)
    : null;
  const parentMerged = parentElement ? mergeStyles(parentElement.styles, state.viewport) : {};
  const parentIsFlex = parentMerged.display === 'flex' || parentMerged.display === 'inline-flex';
  const parentIsGrid = parentMerged.display === 'grid';

  const updateStyle = (key: keyof StyleProperties, value: any) => {
    // When editing a class, redirect to class style updates
    if (editingClass) {
      if (activeState) {
        dispatch({
          type: 'UPDATE_CLASS_PSEUDO_STYLES',
          name: editingClass,
          pseudoState: activeState,
          viewport: state.viewport,
          styles: { [key]: value === '' ? undefined : value },
        });
      } else {
        dispatch({
          type: 'UPDATE_CLASS_STYLES',
          name: editingClass,
          viewport: state.viewport,
          styles: { [key]: value === '' ? undefined : value },
        });
      }
      return;
    }
    if (activeState) {
      dispatch({
        type: 'UPDATE_PSEUDO_STYLES',
        id: selectedElement.id,
        pseudoState: activeState,
        viewport: state.viewport,
        styles: { [key]: value === '' ? undefined : value },
      });
    } else {
      dispatch({
        type: 'UPDATE_STYLES',
        id: selectedElement.id,
        viewport: state.viewport,
        styles: { [key]: value === '' ? undefined : value },
      });
    }
  };

  /** Debounced variant for slider / rapid changes (fewer undo entries) */
  const updateStyleBatch = (key: keyof StyleProperties, value: any) => {
    // When editing a class, use non-batched (class has no batch action)
    if (editingClass) {
      updateStyle(key, value);
      return;
    }
    if (activeState) {
      dispatch({
        type: 'UPDATE_PSEUDO_STYLES',
        id: selectedElement.id,
        pseudoState: activeState,
        viewport: state.viewport,
        styles: { [key]: value === '' ? undefined : value },
      });
    } else {
      dispatch({
        type: 'UPDATE_STYLES_BATCH',
        id: selectedElement.id,
        viewport: state.viewport,
        styles: { [key]: value === '' ? undefined : value },
      });
    }
  };

  // Determine which sections are relevant for the element type
  const isTextLike = selectedElement.type === 'Text' || selectedElement.type === 'Button';
  const isContainer = ['Body', 'Section', 'Container', 'Cards', 'Navbar', 'List'].includes(selectedElement.type);
  const hasContent = ['Text', 'Image', 'Button', 'Divider', 'Spacer', 'Icon'].includes(selectedElement.type);
  const isNavbar = selectedElement.type === 'Navbar';
  const isHeaderFooter = selectedElement.type === 'Header' || selectedElement.type === 'Footer';
  const isWebsiteBlock = selectedElement.type === 'WebsiteBlock';
  /** Elements whose size is derived from content, not from width/height styles */
  const isIntrinsicSize = ['Icon', 'Divider', 'Spacer'].includes(selectedElement.type);
  const isIcon = selectedElement.type === 'Icon';
  const typeColor = TYPE_COLORS[selectedElement.type] || 'var(--admin-text-icon)';

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
      className="ve-properties"
      style={{
        width: '370px',
        backgroundColor: 'var(--admin-bg-card)',
        borderLeft: '1px solid var(--admin-border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Element Header */}
      <div
        className="ve-properties-header"
        style={{
          padding: '12px',
          borderBottom: '1px solid var(--admin-border)',
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
              fontSize: '11px',
              fontWeight: 600,
              color: typeColor,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {selectedElement.type}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-text)' }}>
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
                color: selectedElement.type === 'Body' ? 'var(--admin-border-strong)' : 'var(--admin-text-icon)',
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
                color: selectedElement.type === 'Body' ? 'var(--admin-border-strong)' : '#ef4444',
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
        <div className="ve-properties-viewport" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
          {state.viewport === 'desktop' && <Monitor size={12} style={{ color: 'var(--admin-text-icon)' }} />}
          {state.viewport === 'tablet' && <Tablet size={12} style={{ color: 'var(--admin-text-icon)' }} />}
          {state.viewport === 'mobile' && <Smartphone size={12} style={{ color: 'var(--admin-text-icon)' }} />}
          <span style={{ fontSize: '11px', color: 'var(--admin-text-icon)' }}>
            {state.viewport === 'desktop' ? 'Desktop' : state.viewport === 'tablet' ? 'Tablet' : 'Mobile'} Styles
          </span>
          {state.viewport !== 'desktop' && (
            <span style={{ fontSize: '11px', color: 'var(--admin-text-secondary)', marginLeft: '4px' }}>
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

        {/* Pro Mode Toggle */}
        <div className="ve-properties-promode" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_PRO_MODE' })}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              backgroundColor: proMode ? '#f59e0b20' : '#3d3d4d40',
              border: `1px solid ${proMode ? '#f59e0b50' : 'var(--admin-border-strong)'}`,
              borderRadius: '4px',
              cursor: 'pointer',
              color: proMode ? '#fbbf24' : 'var(--admin-text-muted)',
              fontSize: '11px',
              fontWeight: 600,
              width: '100%',
              transition: 'all 0.15s',
            }}
            title={proMode ? 'Profi-Modus deaktivieren' : 'Profi-Modus aktivieren – erweiterte CSS-Properties'}
          >
            <Zap size={12} />
            {proMode ? 'PRO aktiv – Erweiterte Properties' : 'PRO – Erweiterte Properties anzeigen'}
          </button>
        </div>

        {/* Pseudo-State Toggle: Normal / Hover / Focus / Active */}
        {selectedElement.type !== 'Body' && (
          <div className="ve-properties-pseudostates" style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
            {([null, 'hover', 'focus', 'active'] as const).map(s => {
              const isActive = activeState === s;
              const label = s === null ? 'Normal' : s === 'hover' ? 'Hover' : s === 'focus' ? 'Focus' : 'Active';
              const stateColor = s === null ? '#3b82f6' : s === 'hover' ? '#f59e0b' : s === 'focus' ? '#8b5cf6' : '#ef4444';
              // Show dot if this pseudo-state has values
              const hasPseudoValues = s !== null && selectedElement.styles?.pseudoStyles?.[s]
                && Object.keys(selectedElement.styles.pseudoStyles[s]?.desktop || {}).length > 0;
              return (
                <button
                  key={label}
                  onClick={() => dispatch({ type: 'SET_ACTIVE_STATE', state: s })}
                  style={{
                    flex: 1,
                    padding: '4px 6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: `1px solid ${isActive ? stateColor + '80' : 'var(--admin-border)'}`,
                    backgroundColor: isActive ? stateColor + '20' : 'transparent',
                    color: isActive ? stateColor : 'var(--admin-text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    position: 'relative',
                  }}
                >
                  {label}
                  {hasPseudoValues && (
                    <span style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      backgroundColor: stateColor,
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Active state indicator banner */}
        {activeState && (
          <div style={{
            marginTop: '6px',
            padding: '4px 8px',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: activeState === 'hover' ? '#f59e0b' : activeState === 'focus' ? '#8b5cf6' : '#ef4444',
            backgroundColor: (activeState === 'hover' ? '#f59e0b' : activeState === 'focus' ? '#8b5cf6' : '#ef4444') + '15',
            borderRadius: '4px',
            textAlign: 'center',
          }}>
            Bearbeite :{activeState} Styles
          </div>
        )}
      </div>

      {/* Class Selector */}
      <ClassSelector element={selectedElement} />

      {/* Class Editing Banner */}
      {editingClass && editingClassDef && (
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: '#7c5cfc15',
            borderBottom: '1px solid #7c5cfc40',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <button
            onClick={() => dispatch({ type: 'SET_EDITING_CLASS', name: null })}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#a78bfa',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Zurück zum Element"
          >
            <ArrowLeft size={14} />
          </button>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#a78bfa', fontFamily: 'monospace' }}>
            .{editingClass}
          </span>
          <span style={{ fontSize: '11px', color: '#8b7ebf', marginLeft: 'auto' }}>
            Klasse bearbeiten
          </span>
        </div>
      )}

      {/* Scrollable Properties */}
      <div className="ve-props-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingRight: '6px' }}>

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
            <LayoutSection styles={merged} onChange={updateStyle} proMode={proMode} />
          </AccordionSection>
        )}

        {/* Flex Child (shown when parent is flex, Pro only) */}
        {proMode && parentIsFlex && !isHeaderFooter && !isWebsiteBlock && (
          <AccordionSection
            title="Flex Kind"
            isOpen={openSection === 'flex-child'}
            onToggle={() => toggleSection('flex-child')}
            hasValues={!!(merged.flexGrow || merged.flexShrink || merged.flexBasis || merged.alignSelf || merged.order)}
          >
            <FlexChildSection styles={merged} onChange={updateStyle} />
          </AccordionSection>
        )}

        {/* Grid Child (shown when parent is grid, Pro only) */}
        {proMode && parentIsGrid && !isHeaderFooter && !isWebsiteBlock && (
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

        {/* Size (not for Icon/Divider/Spacer – their size is intrinsic from content) */}
        {!isHeaderFooter && !isWebsiteBlock && !isIntrinsicSize && (
        <AccordionSection title="Größe" isOpen={openSection === 'size'} onToggle={() => toggleSection('size')} hasValues={hasSizeValues}>
          <SizeSection styles={merged} onChange={updateStyleBatch} proMode={proMode} />
        </AccordionSection>
        )}

        {/* Typography (only for text-like elements or containers that can have text) */}
        {(isTextLike || isContainer) && !isHeaderFooter && !isWebsiteBlock && (
          <AccordionSection title="Typografie" isOpen={openSection === 'typography'} onToggle={() => toggleSection('typography')} hasValues={hasTypoValues}>
            <TypographySection
              styles={merged}
              onChange={updateStyle}
              tokenStyles={(() => {
                // When editing a class, use class _typo
                if (editingClass && editingClassDef?._typo) {
                  const token = state.typographyTokens[editingClassDef._typo];
                  if (token) return resolveTypographyToken(token, state.fontTokens, state.viewport);
                }
                // When editing element directly, find _typo from element's classes
                if (!editingClass && selectedElement.classNames) {
                  for (const cn of selectedElement.classNames) {
                    const def = state.globalStyles[cn];
                    if (def?._typo) {
                      const token = state.typographyTokens[def._typo];
                      if (token) return resolveTypographyToken(token, state.fontTokens, state.viewport);
                    }
                  }
                }
                return undefined;
              })()}
              tokenLabel={(() => {
                if (editingClass && editingClassDef?._typo) return state.typographyTokens[editingClassDef._typo]?.label;
                if (!editingClass && selectedElement.classNames) {
                  for (const cn of selectedElement.classNames) {
                    const def = state.globalStyles[cn];
                    if (def?._typo) return state.typographyTokens[def._typo]?.label;
                  }
                }
                return undefined;
              })()}
              tokenKey={(() => {
                if (editingClass && editingClassDef?._typo) return editingClassDef._typo;
                if (!editingClass && selectedElement.classNames) {
                  for (const cn of selectedElement.classNames) {
                    const def = state.globalStyles[cn];
                    if (def?._typo) return def._typo;
                  }
                }
                return undefined;
              })()}
              typographyTokens={Object.keys(state.typographyTokens).length > 0 ? state.typographyTokens : undefined}
              onTypoTokenChange={Object.keys(state.typographyTokens).length > 0 ? (key) => {
                if (editingClass) {
                  // Editing a class: set _typo directly on the class
                  dispatch({
                    type: 'SET_CLASS_TYPO',
                    className: editingClass,
                    typoKey: key,
                  });
                } else {
                  // Editing element directly: find or create a class to attach _typo to
                  const elClasses = selectedElement.classNames || [];
                  // Find an existing class that already has _typo
                  let targetClass = elClasses.find(cn => state.globalStyles[cn]?._typo);
                  if (!targetClass && elClasses.length > 0) {
                    // Use the first class
                    targetClass = elClasses[0];
                  }
                  if (targetClass) {
                    dispatch({
                      type: 'SET_CLASS_TYPO',
                      className: targetClass,
                      typoKey: key,
                    });
                  } else {
                    // No class on element: auto-create one
                    const autoName = `${selectedElement.type.toLowerCase()}-typo-${selectedElement.id.slice(-4)}`;
                    dispatch({ type: 'CREATE_CLASS', name: autoName });
                    dispatch({ type: 'ASSIGN_CLASS', elementId: selectedElement.id, className: autoName });
                    dispatch({ type: 'SET_CLASS_TYPO', className: autoName, typoKey: key });
                  }
                }
              } : undefined}
              onTypoTokenPreview={Object.keys(state.typographyTokens).length > 0 ? (key) => {
                if (key === undefined) {
                  dispatch({ type: 'CLEAR_TYPO_PREVIEW' });
                  return;
                }
                // Determine target class (no auto-create for preview)
                let targetClass: string | undefined;
                if (editingClass) {
                  targetClass = editingClass;
                } else {
                  const elClasses = selectedElement.classNames || [];
                  targetClass = elClasses.find(cn => state.globalStyles[cn]?._typo)
                    ?? elClasses.find(cn => state.globalStyles[cn])
                    ?? elClasses[0];
                }
                if (targetClass) {
                  dispatch({ type: 'SET_TYPO_PREVIEW', className: targetClass, key });
                }
              } : undefined}
            />
          </AccordionSection>
        )}

        {/* Background (not for Icon – container bg is in content) */}
        {!isHeaderFooter && !isWebsiteBlock && !isIcon && (
        <AccordionSection title="Hintergrund" isOpen={openSection === 'background'} onToggle={() => toggleSection('background')} hasValues={hasBgValues}>
          <BackgroundSection styles={merged} onChange={updateStyle} proMode={proMode} />
        </AccordionSection>
        )}

        {/* Border */}
        {!isHeaderFooter && !isWebsiteBlock && (
        <AccordionSection title="Rahmen" isOpen={openSection === 'border'} onToggle={() => toggleSection('border')} hasValues={hasBorderValues}>
          <BorderSection styles={merged} onChange={updateStyle} />
        </AccordionSection>
        )}

        {/* Position (Pro only) */}
        {proMode && !isHeaderFooter && !isWebsiteBlock && (
        <AccordionSection title="Position" isOpen={openSection === 'position'} onToggle={() => toggleSection('position')} hasValues={hasPositionValues}>
          <PositionSection styles={merged} onChange={updateStyle} />
        </AccordionSection>
        )}

        {/* Transform (Pro only) */}
        {proMode && !isHeaderFooter && !isWebsiteBlock && (
        <AccordionSection title="Transform" isOpen={openSection === 'transform'} onToggle={() => toggleSection('transform')} hasValues={!!(merged.transform || merged.transformOrigin)}>
          <TransformSection styles={merged} onChange={updateStyle} />
        </AccordionSection>
        )}

        {/* Effects (Shadow, Overflow, Cursor) */}
        {!isHeaderFooter && !isWebsiteBlock && (
        <AccordionSection title="Effekte" isOpen={openSection === 'effects'} onToggle={() => toggleSection('effects')} hasValues={hasEffectValues}>
          <EffectsSection styles={merged} onChange={updateStyle} proMode={proMode} />
        </AccordionSection>
        )}
      </div>
    </div>
  );
};
