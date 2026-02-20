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
import type { VEElement, VEPage } from './types/elements';
import { findElementById, findParent, getChildren } from './utils/elementHelpers';
import { VEErrorBoundary } from './components/VEErrorBoundary';
import { VESaveProvider } from './state/VESaveContext';
import { VEWebsiteContextBridge } from './renderer/VEWebsiteContextBridge';
import { demoPages } from './data/demoPage';
import { supabase } from '../lib/supabase';
import { convertWebsiteToVE } from './converters/websiteToVE';
import type { GlobalStyles } from './types/styles';
import type { FontTokenMap, TypographyTokenMap } from './types/typographyTokens';
import './styles/editor.css';

// ===== DATA SOURCE TYPE =====
export type VEDataSource = 'demo' | 'live';

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

    // Walk up ancestors to find if this element is inside a card (direct child of Cards)
    let isCardInCards = false;
    let cardContainerId: string | undefined;
    if (!isBody) {
      // Check if this element itself is a direct child of Cards
      if (parent && parent.type === 'Cards') {
        const cardSiblings = getChildren(parent);
        if (cardSiblings.length > 1) {
          isCardInCards = true;
          cardContainerId = element.id;
        }
      } else {
        // Walk up further: maybe this element is nested inside a card
        let walker: VEElement | null = parent;
        while (walker && walker.type !== 'Body') {
          const walkerParent = findParent(state.page.body, walker.id);
          if (walkerParent && walkerParent.type === 'Cards') {
            const cardSiblings = getChildren(walkerParent);
            if (cardSiblings.length > 1) {
              isCardInCards = true;
              cardContainerId = walker.id;
            }
            break;
          }
          walker = walkerParent;
        }
      }
    }

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
      isCardInCards,
      cardContainerId,
    });
  }, [state.page.body, state.clipboard, dispatch]);

  // === Context Menu: Canvas right-click handler ===
  const handleCanvasContextMenu = useCallback((e: React.MouseEvent) => {
    // Walk up from target to find the closest [data-ve-id]
    let walker = e.target as HTMLElement;
    while (walker && !walker.getAttribute('data-ve-id')) {
      walker = walker.parentElement as HTMLElement;
    }
    if (!walker) return;

    const veId = walker.getAttribute('data-ve-id');
    if (!veId) return;

    const element = findElementById(state.page.body, veId);
    if (!element) return;

    openContextMenu(e, element);
  }, [state.page.body, state.clipboard, dispatch, openContextMenu]);

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
      case 'apply-to-sibling-cards':
        dispatch({ type: 'APPLY_TO_SIBLING_CARDS', sourceCardId: action.elementId });
        break;
    }
  }, [dispatch, state.page.body]);

  return (
    <div
      className="ve-editor"
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        //backgroundColor: 'blue',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Top Bar */}
      <TopBar />

      {/* Main Area: Navigator + Canvas + Properties */}
      <div className="ve-main" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
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
  const [liveGlobalStyles, setLiveGlobalStyles] = useState<GlobalStyles>({});
  const [liveFontTokens, setLiveFontTokens] = useState<FontTokenMap>({});
  const [liveTypographyTokens, setLiveTypographyTokens] = useState<TypographyTokenMap>({});
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [originalContent, setOriginalContent] = useState<any>(null);
  const [customerList, setCustomerList] = useState<{ id: string; customer_id: string; site_name: string }[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>(() => {
    return localStorage.getItem('ve-selected-customer') || '';
  });

  // Load customer list on mount and when switching to live mode
  const loadCustomerList = useCallback(() => {
    supabase.from('websites').select('id, customer_id, site_name').then(({ data }) => {
      if (data) setCustomerList(data.map(w => ({
        id: w.id,
        customer_id: (w as any).customer_id || '',
        site_name: (w as any).site_name || 'Unbenannt',
      })));
    });
  }, []);

  useEffect(() => {
    loadCustomerList();
  }, [loadCustomerList]);

  // Load live data when source or customer changes
  useEffect(() => {
    if (dataSource !== 'live' || !selectedCustomer) {
      setLivePages(null);
      setOriginalContent(null);
      return;
    }

    // Reset previous data immediately so EditorProvider doesn't mount with stale pages
    setLivePages(null);
    setOriginalContent(null);
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
        try {
          const result = convertWebsiteToVE(data.content);
          if (result.pages.length === 0) {
            setLiveError('Keine Seiten im JSON gefunden');
            return;
          }
          setLivePages(result.pages);
          setLiveGlobalStyles(result.globalStyles);
          setLiveFontTokens(result.fontTokens);
          setLiveTypographyTokens(result.typographyTokens);
        } catch (conversionError: any) {
          console.error('[VE] Fehler beim Konvertieren der Website-Daten:', conversionError);
          setLiveError(`Konvertierungsfehler: ${conversionError.message || 'Unbekannt'}`);
        }
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
    // Refresh customer list when switching to live mode (picks up newly imported customers)
    if (source === 'live') {
      loadCustomerList();
    }
  };

  // Determine which pages/styles to use
  const pages = dataSource === 'demo' ? demoPages : livePages;
  const globalStyles = dataSource === 'demo' ? {} : liveGlobalStyles;
  const fontTokens = dataSource === 'demo' ? {} : liveFontTokens;
  const typographyTokens = dataSource === 'demo' ? {} : liveTypographyTokens;
  const showEditor = pages && pages.length > 0;

  return (
    <VEErrorBoundary>
      <VEThemeProvider>
        <div className="ve-root" style={{ width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Data Source Selector Bar */}
        <div
          className="ve-datasource-bar"
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
          <VEWebsiteContextBridge customerId={dataSource === 'live' ? selectedCustomer : ''}>
            <VESaveProvider
              dataSource={dataSource}
              customerId={selectedCustomer}
              originalContent={originalContent}
            >
              <EditorProvider key={`${dataSource}-${selectedCustomer}`} initialPages={pages} initialGlobalStyles={globalStyles} initialFontTokens={fontTokens} initialTypographyTokens={typographyTokens}>
                <EditorInner />
              </EditorProvider>
            </VESaveProvider>
          </VEWebsiteContextBridge>
        ) : (
          <div
            className="ve-empty-state"
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
        </div>
      </VEThemeProvider>
    </VEErrorBoundary>
  );
};

export default VisualEditorPage;
