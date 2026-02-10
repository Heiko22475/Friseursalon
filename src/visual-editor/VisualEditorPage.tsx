// =====================================================
// VISUAL EDITOR – HAUPTSEITE
// 3-Panel Layout: Navigator | Canvas | Properties
// Context Menu + Clipboard + DnD Integration
// Supports data source switching: Demo vs. Live (Supabase)
// =====================================================

import React, { useCallback, useState, useEffect } from 'react';
import { EditorProvider } from './state/EditorContext';
import { VEThemeProvider } from './theme/VEThemeBridge';
import { TopBar } from './shell/TopBar';
import { Navigator } from './shell/Navigator';
import { PropertiesPanel } from './shell/PropertiesPanel';
import { CanvasRenderer } from './renderer/CanvasRenderer';
import { useEditor } from './state/EditorContext';
import { ContextMenu } from './components/ContextMenu';
import type { ContextMenuData, ContextMenuAction } from './components/ContextMenu';
import type { VEElement, VEPage, VEBody } from './types/elements';
import { findElementById, findParent, getChildren } from './utils/elementHelpers';
import { VEErrorBoundary } from './components/VEErrorBoundary';
import { VESaveProvider } from './state/VESaveContext';
import { demoPages } from './data/demoPage';
import { supabase } from '../lib/supabase';
import './styles/editor.css';

// ===== DATA SOURCE TYPE =====
export type VEDataSource = 'demo' | 'live';

// ===== CONVERTER: Website JSON → VEPages =====
// Konvertiert die Website-JSON-Blöcke in das VE-Seitenformat
function convertWebsiteToVEPages(content: any): VEPage[] {
  if (!content || !content.pages || !Array.isArray(content.pages)) {
    return [];
  }

  return content.pages.map((page: any) => {
    // Build VE children from blocks
    const children: VEElement[] = (page.blocks || []).map((block: any, idx: number) => {
      // Create a Section for each block
      const blockChildren: VEElement[] = [];

      if (block.type === 'hero' && block.config) {
        // Hero block → Image + Text elements
        blockChildren.push({
          id: `${block.id}-img`,
          type: 'Image' as const,
          label: 'Hero Bild',
          content: {
            src: block.config.backgroundImage || '',
            alt: block.content?.title || 'Hero',
          },
          styles: {
            desktop: {
              width: { value: 100, unit: '%' as const },
              height: { value: 400, unit: 'px' as const },
              objectFit: 'cover',
            },
          },
        });
        if (block.config.texts) {
          block.config.texts.forEach((text: any) => {
            blockChildren.push({
              id: text.id || `${block.id}-text-${Math.random().toString(36).slice(2, 6)}`,
              type: 'Text' as const,
              label: text.content?.slice(0, 30) || 'Text',
              content: text.content || '',
              textStyle: 'h1' as const,
              styles: {
                desktop: {
                  color: text.color ? { kind: 'custom' as const, hex: text.color } : undefined,
                  textAlign: 'center' as const,
                  marginTop: { value: 8, unit: 'px' as const },
                },
              },
            });
          });
        }
      } else if (block.type === 'generic-card' && block.config) {
        // Generic card block → show section title + card items as text
        if (block.config.sectionStyle?.title) {
          blockChildren.push({
            id: `${block.id}-title`,
            type: 'Text' as const,
            label: block.config.sectionStyle.title,
            content: block.config.sectionStyle.title,
            textStyle: 'h2' as const,
            styles: {
              desktop: {
                textAlign: (block.config.sectionStyle?.headerAlign || 'center') as 'center' | 'left' | 'right',
                marginBottom: { value: 8, unit: 'px' as const },
              },
            },
          });
        }
        if (block.config.sectionStyle?.subtitle) {
          blockChildren.push({
            id: `${block.id}-subtitle`,
            type: 'Text' as const,
            label: 'Untertitel',
            content: block.config.sectionStyle.subtitle,
            textStyle: 'body' as const,
            styles: {
              desktop: {
                color: block.config.sectionStyle.subtitleColor || undefined,
                textAlign: 'center' as const,
                marginBottom: { value: 16, unit: 'px' as const },
              },
            },
          });
        }
        // Card items as container with text
        (block.config.items || []).forEach((item: any) => {
          const cardChildren: VEElement[] = [];
          if (item.image) {
            cardChildren.push({
              id: `${item.id}-img`,
              type: 'Image' as const,
              label: item.title || 'Bild',
              content: {
                src: item.image,
                alt: item.title || '',
              },
              styles: {
                desktop: {
                  width: { value: 100, unit: '%' as const },
                  height: { value: 200, unit: 'px' as const },
                  objectFit: 'cover',
                  borderRadius: { value: 8, unit: 'px' as const },
                },
              },
            });
          }
          if (item.title) {
            cardChildren.push({
              id: `${item.id}-title`,
              type: 'Text' as const,
              label: item.title,
              content: item.title,
              textStyle: 'h3' as const,
              styles: { desktop: {} },
            });
          }
          if (item.description) {
            cardChildren.push({
              id: `${item.id}-desc`,
              type: 'Text' as const,
              label: 'Beschreibung',
              content: item.description.replace(/<[^>]*>/g, ''),
              textStyle: 'body' as const,
              styles: { desktop: { color: { kind: 'custom' as const, hex: '#6b7280' } } },
            });
          }

          blockChildren.push({
            id: item.id || `card-${Math.random().toString(36).slice(2, 6)}`,
            type: 'Container' as const,
            label: item.title || 'Karte',
            styles: {
              desktop: {
                paddingTop: { value: 16, unit: 'px' as const },
                paddingRight: { value: 16, unit: 'px' as const },
                paddingBottom: { value: 16, unit: 'px' as const },
                paddingLeft: { value: 16, unit: 'px' as const },
                backgroundColor: block.config.cardStyle?.backgroundColor || undefined,
                borderRadius: { value: 8, unit: 'px' as const },
              },
            },
            children: cardChildren,
          });
        });
      } else if (block.type === 'static_content') {
        blockChildren.push({
          id: `${block.id}-text`,
          type: 'Text' as const,
          label: block.config?.type || 'Statischer Inhalt',
          content: `[${block.config?.type || 'content'}]`,
          textStyle: 'body' as const,
          styles: { desktop: { paddingTop: { value: 24, unit: 'px' as const }, paddingBottom: { value: 24, unit: 'px' as const } } },
        });
      }

      // Determine section background
      const sectionBg = block.config?.sectionStyle?.backgroundColor
        || (block.type === 'hero' ? { kind: 'custom' as const, hex: '#0f172a' } : undefined);

      return {
        id: block.id,
        type: 'Section' as const,
        label: block.config?.sectionStyle?.title || block.content?.title || `Block ${idx + 1}`,
        styles: {
          desktop: {
            display: 'flex' as const,
            flexDirection: 'column' as const,
            paddingTop: { value: 48, unit: 'px' as const },
            paddingBottom: { value: 48, unit: 'px' as const },
            paddingLeft: { value: 24, unit: 'px' as const },
            paddingRight: { value: 24, unit: 'px' as const },
            backgroundColor: sectionBg,
          },
        },
        children: blockChildren,
      } as VEElement;
    });

    const body: VEBody = {
      id: `body-${page.id}`,
      type: 'Body',
      label: 'Body',
      styles: {
        desktop: {
          backgroundColor: { kind: 'custom' as const, hex: '#ffffff' },
        },
      },
      children,
    };

    return {
      id: page.id,
      name: page.title || 'Seite',
      route: page.slug === 'home' ? '/' : `/${page.slug}`,
      body,
      isVisualEditor: true,
      isPublished: page.is_published ?? true,
    } as VEPage;
  });
}

// ===== INNER EDITOR (braucht Context) =====

const EditorInner: React.FC = () => {
  const { state, dispatch } = useEditor();
  const [contextMenu, setContextMenu] = useState<ContextMenuData | null>(null);

  // === Context Menu: Open ===
  const openContextMenu = useCallback((e: React.MouseEvent, element: VEElement) => {
    e.preventDefault();
    e.stopPropagation();

    const parent = findParent(state.page.body, element.id);
    const isBody = element.type === 'Body';
    const siblings = parent ? getChildren(parent) : [];
    const idx = siblings.findIndex(c => c.id === element.id);
    const isContainerType = ['Body', 'Section', 'Container'].includes(element.type);

    // Select the element
    dispatch({ type: 'SELECT_ELEMENT', id: element.id });

    setContextMenu({
      position: { x: e.clientX, y: e.clientY },
      element,
      parentElement: parent,
      canMoveUp: idx > 0,
      canMoveDown: idx >= 0 && idx < siblings.length - 1,
      canDelete: !isBody,
      canDuplicate: !isBody,
      canWrap: !isBody,
      hasClipboard: state.clipboard !== null,
      canPasteInto: isContainerType,
    });
  }, [state.page.body, state.clipboard, dispatch]);

  // === Context Menu: Canvas right-click handler ===
  const handleCanvasContextMenu = useCallback((e: React.MouseEvent) => {
    // Walk up from target to find the closest [data-ve-id]
    let target = e.target as HTMLElement;
    while (target && !target.getAttribute('data-ve-id')) {
      target = target.parentElement as HTMLElement;
    }
    if (!target) return;

    const veId = target.getAttribute('data-ve-id');
    if (!veId) return;

    const element = findElementById(state.page.body, veId);
    if (!element) return;

    openContextMenu(e, element);
  }, [state.page.body, openContextMenu]);

  // === Context Menu: Tree right-click ===
  const handleTreeContextMenu = useCallback((e: React.MouseEvent, element: VEElement) => {
    openContextMenu(e, element);
  }, [openContextMenu]);

  // === Context Menu: Action handler ===
  const handleContextAction = useCallback((action: ContextMenuAction) => {
    switch (action.type) {
      case 'select-parent':
        dispatch({ type: 'SELECT_ELEMENT', id: action.elementId });
        break;
      case 'copy':
        dispatch({ type: 'COPY_ELEMENT', id: action.elementId });
        break;
      case 'paste':
        dispatch({ type: 'PASTE_ELEMENT', targetId: action.elementId });
        break;
      case 'duplicate':
        dispatch({ type: 'DUPLICATE_ELEMENT', id: action.elementId });
        break;
      case 'delete':
        dispatch({ type: 'REMOVE_ELEMENT', id: action.elementId });
        break;
      case 'move-up':
      case 'move-down':
      case 'move-first':
      case 'move-last': {
        const parent = findParent(state.page.body, action.elementId);
        if (!parent) break;
        const siblings = getChildren(parent);
        const idx = siblings.findIndex(c => c.id === action.elementId);
        if (idx < 0) break;
        let newIdx: number;
        if (action.type === 'move-up') newIdx = idx - 1;
        else if (action.type === 'move-down') newIdx = idx + 1;
        else if (action.type === 'move-first') newIdx = 0;
        else newIdx = siblings.length - 1;
        dispatch({ type: 'MOVE_ELEMENT', elementId: action.elementId, newParentId: parent.id, newIndex: newIdx });
        break;
      }
      case 'wrap-in-container':
        dispatch({ type: 'WRAP_IN_CONTAINER', id: action.elementId });
        break;
      case 'unwrap':
        dispatch({ type: 'UNWRAP_CONTAINER', id: action.elementId });
        break;
      case 'reset-styles':
        dispatch({ type: 'RESET_STYLES', id: action.elementId });
        break;
      case 'toggle-visibility':
        dispatch({ type: 'TOGGLE_VISIBILITY', id: action.elementId });
        break;
    }
  }, [dispatch, state.page.body]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: '#13131b',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Top Bar */}
      <TopBar />

      {/* Main Area: Navigator + Canvas + Properties */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Navigator (left) */}
        <Navigator onTreeContextMenu={handleTreeContextMenu} />

        {/* Canvas (center) */}
        <div
          className="ve-canvas-scroll"
          onMouseDown={(e) => {
            // Only deselect when clicking the canvas background directly
            if (e.target === e.currentTarget) {
              dispatch({ type: 'SELECT_ELEMENT', id: null });
            }
          }}
          onContextMenu={handleCanvasContextMenu}
          style={{
            flex: 1,
            overflow: 'auto',
            backgroundColor: '#2a2a3a',
            padding: state.viewport === 'desktop' ? '0' : '24px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <CanvasRenderer
            page={state.page}
            viewport={state.viewport}
            selectedId={state.selectedId}
            hoveredId={state.hoveredId}
            onSelect={(id) => dispatch({ type: 'SELECT_ELEMENT', id })}
            onHover={(id) => dispatch({ type: 'HOVER_ELEMENT', id })}
          />
        </div>

        {/* Properties Panel (right) */}
        <PropertiesPanel />
      </div>

      {/* Context Menu (portal to body) */}
      {contextMenu && (
        <ContextMenu
          data={contextMenu}
          onAction={handleContextAction}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

// ===== EXPORTED PAGE =====

const VisualEditorPage: React.FC = () => {
  // Data source: 'demo' = static test page, 'live' = from Supabase
  const [dataSource, setDataSource] = useState<VEDataSource>(() => {
    return (localStorage.getItem('ve-data-source') as VEDataSource) || 'demo';
  });
  const [livePages, setLivePages] = useState<VEPage[] | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [originalContent, setOriginalContent] = useState<any>(null);
  const [customerList, setCustomerList] = useState<{ id: string; customer_id: string; site_name: string }[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>(() => {
    return localStorage.getItem('ve-selected-customer') || '';
  });

  // Load customer list on mount
  useEffect(() => {
    supabase.from('websites').select('id, customer_id, site_name').then(({ data }) => {
      if (data) setCustomerList(data.map(w => ({
        id: w.id,
        customer_id: (w as any).customer_id || '',
        site_name: (w as any).site_name || 'Unbenannt',
      })));
    });
  }, []);

  // Load live data when source or customer changes
  useEffect(() => {
    if (dataSource !== 'live' || !selectedCustomer) {
      setLivePages(null);
      return;
    }

    setLiveLoading(true);
    setLiveError(null);

    supabase
      .from('websites')
      .select('content')
      .eq('customer_id', selectedCustomer)
      .single()
      .then(({ data, error }) => {
        setLiveLoading(false);
        if (error || !data) {
          setLiveError(error?.message || 'Keine Daten gefunden');
          return;
        }
        setOriginalContent(data.content);
        const pages = convertWebsiteToVEPages(data.content);
        if (pages.length === 0) {
          setLiveError('Keine Seiten im JSON gefunden');
          return;
        }
        setLivePages(pages);
      });
  }, [dataSource, selectedCustomer]);

  // Persist selections
  useEffect(() => {
    localStorage.setItem('ve-data-source', dataSource);
  }, [dataSource]);
  useEffect(() => {
    if (selectedCustomer) localStorage.setItem('ve-selected-customer', selectedCustomer);
  }, [selectedCustomer]);

  const handleSourceChange = (source: VEDataSource) => {
    setDataSource(source);
    setLivePages(null);
    setLiveError(null);
    setOriginalContent(null);
  };

  // Determine which pages to use
  const pages = dataSource === 'demo' ? demoPages : livePages;
  const showEditor = pages && pages.length > 0;

  return (
    <VEErrorBoundary>
      <VEThemeProvider>
        {/* Data Source Selector Bar */}
        <div
          style={{
            backgroundColor: '#13131b',
            borderBottom: '1px solid #2d2d3d',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '13px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            zIndex: 100,
          }}
        >
          <span style={{ color: '#888', fontWeight: 500, marginRight: '4px' }}>Datenquelle:</span>

          {/* Demo Toggle */}
          <button
            onClick={() => handleSourceChange('demo')}
            style={{
              padding: '4px 12px',
              borderRadius: '6px',
              border: `1px solid ${dataSource === 'demo' ? '#7c5cfc' : '#3d3d4d'}`,
              backgroundColor: dataSource === 'demo' ? '#7c5cfc22' : 'transparent',
              color: dataSource === 'demo' ? '#a78bfa' : '#888',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: dataSource === 'demo' ? 600 : 400,
              transition: 'all 0.15s',
            }}
          >
            🧪 Demo / Testseite
          </button>

          {/* Live Toggle */}
          <button
            onClick={() => handleSourceChange('live')}
            style={{
              padding: '4px 12px',
              borderRadius: '6px',
              border: `1px solid ${dataSource === 'live' ? '#22c55e' : '#3d3d4d'}`,
              backgroundColor: dataSource === 'live' ? '#22c55e18' : 'transparent',
              color: dataSource === 'live' ? '#4ade80' : '#888',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: dataSource === 'live' ? 600 : 400,
              transition: 'all 0.15s',
            }}
          >
            🌐 Live-Website (Supabase)
          </button>

          {/* Customer Selector (only for live) */}
          {dataSource === 'live' && (
            <>
              <span style={{ color: '#555', margin: '0 4px' }}>|</span>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid #3d3d4d',
                  backgroundColor: '#1e1e2e',
                  color: '#ccc',
                  fontSize: '12px',
                  cursor: 'pointer',
                  minWidth: '200px',
                }}
              >
                <option value="">— Kunde wählen —</option>
                {customerList.map((c) => (
                  <option key={c.customer_id} value={c.customer_id}>
                    {c.site_name} ({c.customer_id})
                  </option>
                ))}
              </select>

              {liveLoading && (
                <span style={{ color: '#fbbf24', fontSize: '12px' }}>⏳ Lade...</span>
              )}
              {liveError && (
                <span style={{ color: '#f87171', fontSize: '12px' }}>❌ {liveError}</span>
              )}
              {livePages && (
                <span style={{ color: '#4ade80', fontSize: '12px' }}>
                  ✅ {livePages.length} Seite{livePages.length !== 1 ? 'n' : ''} geladen
                </span>
              )}
            </>
          )}
        </div>

        {/* Editor or Loading/Error State */}
        {showEditor ? (
          <VESaveProvider
            dataSource={dataSource}
            customerId={selectedCustomer}
            originalContent={originalContent}
          >
            <EditorProvider key={`${dataSource}-${selectedCustomer}`} initialPages={pages}>
              <EditorInner />
            </EditorProvider>
          </VESaveProvider>
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 'calc(100vh - 48px)',
              backgroundColor: '#13131b',
              color: '#888',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
          >
            {dataSource === 'live' && !selectedCustomer && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌐</div>
                <p style={{ fontSize: '16px', color: '#aaa' }}>Bitte wähle einen Kunden oben aus</p>
                <p style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>
                  Die Website-Daten werden aus der Supabase-Datenbank geladen.
                </p>
              </div>
            )}
            {dataSource === 'live' && selectedCustomer && liveLoading && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                <p style={{ fontSize: '16px', color: '#aaa' }}>Lade Website-Daten...</p>
              </div>
            )}
            {dataSource === 'live' && selectedCustomer && liveError && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
                <p style={{ fontSize: '16px', color: '#f87171' }}>{liveError}</p>
                <button
                  onClick={() => { setLivePages(null); setLiveError(null); setSelectedCustomer(selectedCustomer); }}
                  style={{
                    marginTop: '16px',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: '1px solid #3d3d4d',
                    backgroundColor: '#1e1e2e',
                    color: '#aaa',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  Erneut versuchen
                </button>
              </div>
            )}
          </div>
        )}
      </VEThemeProvider>
    </VEErrorBoundary>
  );
};

export default VisualEditorPage;
