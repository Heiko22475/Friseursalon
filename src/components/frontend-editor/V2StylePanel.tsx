// =====================================================
// V2 STYLE PANEL
// Rechter Drawer für Frontend-Style-Editing.
// Zeigt Tabs: Typografie | Spacing | Hintergrund | Border
// Unterstützt Class vs. Inline Scope, Viewport-Switcher
// und Undo/Redo.
// =====================================================

import React, { useCallback, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Undo2, Redo2,
  Monitor, Tablet, Smartphone,
  Type as TypeIcon, Move, Paintbrush, Square,
  Link2, Unlink,
} from 'lucide-react';
import { useV2Edit, type EditScope } from './V2EditContext';
import { useWebsite } from '../../contexts/WebsiteContext';
import { v2PropsToVE, vePropsToV2 } from '../../visual-editor/converters/v2Converter';
import type { StyleProperties } from '../../visual-editor/types/styles';

// Lazy-import the existing property sections
import { TypographySection } from '../../visual-editor/properties/TypographySection';
import { BackgroundSection } from '../../visual-editor/properties/BackgroundSection';
import { BorderSection } from '../../visual-editor/properties/BorderSection';
import { SpacingBox } from '../../visual-editor/components/SpacingBox';

// ===== TYPES =====

type TabId = 'typo' | 'spacing' | 'bg' | 'border';

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  /** Which element tags show this tab */
  showFor: string[];
}

const TABS: TabConfig[] = [
  { id: 'typo',    label: 'Typo',        icon: <TypeIcon className="w-3.5 h-3.5" />,   showFor: ['text', 'button', 'link'] },
  { id: 'spacing', label: 'Abstände',    icon: <Move className="w-3.5 h-3.5" />,       showFor: ['text', 'container', 'section', 'button', 'link', 'image', 'icon', 'nav', 'body', 'divider', 'spacer'] },
  { id: 'bg',      label: 'Hintergrund', icon: <Paintbrush className="w-3.5 h-3.5" />, showFor: ['text', 'container', 'section', 'button', 'link', 'nav', 'body'] },
  { id: 'border',  label: 'Rand',        icon: <Square className="w-3.5 h-3.5" />,     showFor: ['container', 'section', 'button', 'image', 'nav'] },
];

// ===== HELPERS =====

/** Tag-Label für Anzeige */
function tagLabel(tag: string): string {
  const map: Record<string, string> = {
    text: 'Text',
    container: 'Container',
    section: 'Abschnitt',
    button: 'Button',
    link: 'Link',
    image: 'Bild',
    icon: 'Icon',
    nav: 'Navigation',
    body: 'Body',
    divider: 'Trennlinie',
    spacer: 'Abstand',
  };
  return map[tag] || tag;
}

/**
 * Deep-find an element by id in a v2 element tree.
 */
function findElementById(root: any, id: string): any | null {
  if (!root) return null;
  if (root.id === id) return root;
  if (root.children) {
    for (const child of root.children) {
      const found = findElementById(child, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Deep-update element's inline styles in the body tree.
 * Returns new tree (immutable) or null if element not found.
 */
function updateElementStyles(root: any, targetId: string, newStyles: Record<string, any>): any {
  if (!root) return null;
  if (root.id === targetId) {
    return { ...root, styles: newStyles };
  }
  if (root.children) {
    const newChildren = root.children.map((child: any) => {
      const updated = updateElementStyles(child, targetId, newStyles);
      return updated || child;
    });
    if (newChildren.some((c: any, i: number) => c !== root.children[i])) {
      return { ...root, children: newChildren };
    }
  }
  return null;
}

/**
 * Count elements using a given class name in the tree.
 */
function countClassUsage(root: any, className: string): number {
  if (!root) return 0;
  let count = 0;
  if (root.class && Array.isArray(root.class) && root.class.includes(className)) {
    count++;
  }
  if (root.children) {
    for (const child of root.children) {
      count += countClassUsage(child, className);
    }
  }
  return count;
}

/**
 * Get merged v2 styles for a specific viewport.
 * Takes class definitions + inline, picks the right breakpoint.
 */
function getV2StylesForViewport(
  classes: string[] | undefined,
  inlineStyles: Record<string, any> | undefined,
  allStyles: Record<string, any>,
  viewport: 'desktop' | 'tablet' | 'mobile',
  scope: EditScope,
): Record<string, any> {
  // If scope = class, get styles from the first class definition
  if (scope === 'class' && classes && classes.length > 0) {
    const className = classes[0];
    const classDef = allStyles[className] || {};
    if (viewport === 'desktop') {
      // Return desktop props (everything that isn't @tablet/@mobile/:pseudo)
      const result: Record<string, any> = {};
      for (const [k, v] of Object.entries(classDef)) {
        if (!k.startsWith('@') && !k.startsWith(':') && k !== '_extends') {
          result[k] = v;
        }
      }
      return result;
    }
    return classDef[`@${viewport}`] || {};
  }

  // Scope = inline: get this element's inline styles
  if (!inlineStyles) return {};
  if (viewport === 'desktop') {
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(inlineStyles)) {
      if (!k.startsWith('@') && !k.startsWith(':') && k !== '_extends') {
        result[k] = v;
      }
    }
    return result;
  }
  return inlineStyles[`@${viewport}`] || {};
}

// ===== COMPONENT =====

interface V2StylePanelProps {
  pageId: string;
}

export const V2StylePanel: React.FC<V2StylePanelProps> = ({ pageId }) => {
  const {
    selectedElement,
    isPanelOpen,
    closePanel,
    editScope,
    setEditScope,
    editViewport,
    setEditViewport,
    pushCommand,
    undo,
    redo,
    canUndo,
    canRedo,
    undoLabel,
    redoLabel,
  } = useV2Edit();

  const { websiteRecord, updatePage, updateWebsite } = useWebsite();
  const [activeTab, setActiveTab] = React.useState<TabId>('typo');

  // Get all styles from content
  const allStyles = useMemo(() => {
    return websiteRecord?.content?.styles || {};
  }, [websiteRecord?.content?.styles]);

  // Get page body
  const pageBody = useMemo(() => {
    const page = websiteRecord?.content?.pages?.find((p: any) => p.id === pageId);
    return page?.body || null;
  }, [websiteRecord?.content?.pages, pageId]);

  // Count elements sharing the active class
  const activeClassName = selectedElement?.classes?.[0] || null;
  const classUsageCount = useMemo(() => {
    if (!activeClassName || !pageBody) return 0;
    // Count across all pages
    let total = 0;
    for (const page of (websiteRecord?.content?.pages || [])) {
      if (page.body) {
        total += countClassUsage(page.body, activeClassName);
      }
    }
    return total;
  }, [activeClassName, websiteRecord?.content?.pages, pageBody]);

  // Get merged styles for current scope + viewport, converted to VE format
  // For inline scope, read LIVE from body tree (not cached selectedElement.inlineStyles)
  const currentVEStyles = useMemo<Partial<StyleProperties>>(() => {
    if (!selectedElement) return {};

    let liveInlineStyles = selectedElement.inlineStyles;

    // For inline scope, always read the latest styles from the body tree
    if (editScope === 'inline' && pageBody) {
      const liveElement = findElementById(pageBody, selectedElement.id);
      if (liveElement) {
        liveInlineStyles = liveElement.styles;
      }
    }

    const v2Styles = getV2StylesForViewport(
      selectedElement.classes,
      liveInlineStyles,
      allStyles,
      editViewport,
      editScope,
    );
    return v2PropsToVE(v2Styles);
  }, [selectedElement, allStyles, editViewport, editScope, pageBody]);

  // Which tabs to show for this element tag
  const visibleTabs = useMemo(() => {
    if (!selectedElement) return [];
    return TABS.filter(t => t.showFor.includes(selectedElement.tag));
  }, [selectedElement?.tag]);

  // Auto-select first visible tab
  useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.find(t => t.id === activeTab)) {
      setActiveTab(visibleTabs[0].id);
    }
  }, [visibleTabs, activeTab]);

  // ─── STYLE CHANGE HANDLER ────────────────────────────

  const handleStyleChange = useCallback((key: keyof StyleProperties, value: any) => {
    if (!selectedElement || !websiteRecord) return;

    const cleanValue = value === '' ? undefined : value;
    const changedProps: Partial<StyleProperties> = { [key]: cleanValue };
    const v2ChangedProps = vePropsToV2(changedProps);

    // Build command label
    const label = `${key}: ${JSON.stringify(cleanValue)?.slice(0, 30) || '–'}`;

    if (editScope === 'class' && activeClassName) {
      // ── CLASS SCOPE: update content.styles[className] ──
      const currentStyles = { ...allStyles };
      const classDef = { ...(currentStyles[activeClassName] || {}) };
      const prevClassDef = { ...classDef };

      if (editViewport === 'desktop') {
        Object.assign(classDef, v2ChangedProps);
      } else {
        const bpKey = `@${editViewport}`;
        classDef[bpKey] = { ...(classDef[bpKey] || {}), ...v2ChangedProps };
      }

      currentStyles[activeClassName] = classDef;

      // Push undo command
      pushCommand({
        id: `${Date.now()}-${key}`,
        label,
        scope: 'class',
        prevState: prevClassDef,
        nextState: classDef,
        path: `styles.${activeClassName}`,
      });

      // Save: update styles via WebsiteContext (optimistic + Supabase)
      saveContent(currentStyles);

    } else {
      // ── INLINE SCOPE: update element.styles in body tree ──
      const page = websiteRecord.content.pages?.find((p: any) => p.id === pageId);
      if (!page?.body) return;

      const element = findElementById(page.body, selectedElement.id);
      if (!element) return;

      const prevStyles = { ...(element.styles || {}) };
      const newStyles = { ...prevStyles };

      if (editViewport === 'desktop') {
        Object.assign(newStyles, v2ChangedProps);
      } else {
        const bpKey = `@${editViewport}`;
        newStyles[bpKey] = { ...(newStyles[bpKey] || {}), ...v2ChangedProps };
      }

      pushCommand({
        id: `${Date.now()}-${key}`,
        label,
        scope: 'inline',
        prevState: prevStyles,
        nextState: newStyles,
        path: `element.${selectedElement.id}.styles`,
      });

      const updatedBody = updateElementStyles(page.body, selectedElement.id, newStyles);
      if (updatedBody) {
        updatePage(pageId, { body: updatedBody });
      }
    }
  }, [selectedElement, websiteRecord, editScope, editViewport, activeClassName, allStyles, pageId, pushCommand, updatePage]);

  // ─── SAVE CONTENT (for class-level changes) ───────────

  const saveContent = useCallback(async (newStyles: Record<string, any>) => {
    if (!websiteRecord) return;
    try {
      // Use updateWebsite which does optimistic state update + Supabase save
      await updateWebsite({ styles: newStyles });
    } catch (err) {
      console.error('Failed to save class styles:', err);
    }
  }, [websiteRecord, updateWebsite]);

  // ─── UNDO/REDO HANDLERS ──────────────────────────────

  const handleUndo = useCallback(async () => {
    const cmd = undo();
    if (!cmd || !websiteRecord) return;

    if (cmd.scope === 'class') {
      const className = cmd.path.replace('styles.', '');
      const currentStyles = { ...websiteRecord.content.styles || {} };
      currentStyles[className] = cmd.prevState;
      saveContent(currentStyles);
    } else {
      const page = websiteRecord.content.pages?.find((p: any) => p.id === pageId);
      if (!page?.body) return;
      const elId = cmd.path.split('.')[1];
      const updatedBody = updateElementStyles(page.body, elId, cmd.prevState);
      if (updatedBody) {
        updatePage(pageId, { body: updatedBody });
      }
    }
  }, [undo, websiteRecord, pageId, saveContent, updatePage]);

  const handleRedo = useCallback(async () => {
    const cmd = redo();
    if (!cmd || !websiteRecord) return;

    if (cmd.scope === 'class') {
      const className = cmd.path.replace('styles.', '');
      const currentStyles = { ...websiteRecord.content.styles || {} };
      currentStyles[className] = cmd.nextState;
      saveContent(currentStyles);
    } else {
      const page = websiteRecord.content.pages?.find((p: any) => p.id === pageId);
      if (!page?.body) return;
      const elId = cmd.path.split('.')[1];
      const updatedBody = updateElementStyles(page.body, elId, cmd.nextState);
      if (updatedBody) {
        updatePage(pageId, { body: updatedBody });
      }
    }
  }, [redo, websiteRecord, pageId, saveContent, updatePage]);

  // ─── KEYBOARD SHORTCUTS ──────────────────────────────

  useEffect(() => {
    if (!isPanelOpen) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        closePanel();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isPanelOpen, handleUndo, handleRedo, closePanel]);

  // ─── RENDER ──────────────────────────────────────────

  if (!isPanelOpen || !selectedElement) return null;

  const hasClasses = selectedElement.classes.length > 0;

  const panel = (
    <div
      className="fixed top-0 right-0 bottom-0 z-[9990] flex"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Backdrop (click to close) */}
      <div
        className="fixed inset-0 bg-black/10 -z-10"
        onClick={closePanel}
      />

      {/* Panel */}
      <div
        className="w-80 h-full bg-[#1e1e2e] text-gray-200 shadow-2xl overflow-hidden flex flex-col ml-auto animate-slide-in-right"
        style={{ borderLeft: '1px solid #2d2d3d' }}
      >
        {/* ── Header ───────────────────────────── */}
        <div className="flex items-center justify-between px-3 py-2.5 bg-[#16162a] border-b border-[#2d2d3d]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
              {tagLabel(selectedElement.tag)}
            </span>
            <span className="text-xs text-gray-400 truncate">
              {selectedElement.label || selectedElement.id.slice(0, 8)}
            </span>
          </div>
          <button
            onClick={closePanel}
            className="p-1 hover:bg-white/10 rounded transition"
            title="Schließen (Esc)"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* ── Scope Toggle (Class vs. Inline) ─── */}
        {hasClasses && (
          <div className="px-3 py-2 border-b border-[#2d2d3d] bg-[#1a1a2e]">
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setEditScope('class')}
                className={`flex items-center gap-1 px-2 py-1 rounded transition ${
                  editScope === 'class'
                    ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/40'
                    : 'text-gray-400 hover:bg-white/5'
                }`}
                title={`Alle ${classUsageCount} Elemente mit Klasse "${activeClassName}" ändern`}
              >
                <Link2 className="w-3 h-3" />
                <span>{activeClassName}</span>
                <span className="text-[10px] opacity-70">×{classUsageCount}</span>
              </button>
              <button
                onClick={() => setEditScope('inline')}
                className={`flex items-center gap-1 px-2 py-1 rounded transition ${
                  editScope === 'inline'
                    ? 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/40'
                    : 'text-gray-400 hover:bg-white/5'
                }`}
                title="Nur dieses Element ändern (Inline Override)"
              >
                <Unlink className="w-3 h-3" />
                <span>Nur hier</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Viewport Switcher ───────────────── */}
        <div className="flex items-center justify-center gap-1 px-3 py-1.5 border-b border-[#2d2d3d]">
          {([
            { vp: 'desktop' as const, icon: <Monitor className="w-3.5 h-3.5" />, label: 'Desktop' },
            { vp: 'tablet' as const, icon: <Tablet className="w-3.5 h-3.5" />, label: 'Tablet' },
            { vp: 'mobile' as const, icon: <Smartphone className="w-3.5 h-3.5" />, label: 'Mobil' },
          ]).map(({ vp, icon, label }) => (
            <button
              key={vp}
              onClick={() => setEditViewport(vp)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition ${
                editViewport === vp
                  ? 'bg-white/10 text-white'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
              title={label}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab Bar ─────────────────────────── */}
        <div className="flex border-b border-[#2d2d3d]">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs transition border-b-2 ${
                activeTab === tab.id
                  ? 'border-rose-500 text-rose-400 bg-rose-500/5'
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              {tab.icon}
              <span className="hidden xl:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Section Content ─────────────────── */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {/* Scope indicator */}
          {editScope === 'inline' && hasClasses && (
            <div className="mb-3 p-2 bg-orange-500/10 border border-orange-500/20 rounded text-xs text-orange-400 flex items-center gap-1.5">
              <Unlink className="w-3 h-3 flex-shrink-0" />
              <span>Inline Override – betrifft nur dieses Element</span>
            </div>
          )}

          {activeTab === 'typo' && (
            <TypographySection
              styles={currentVEStyles}
              onChange={handleStyleChange}
            />
          )}

          {activeTab === 'spacing' && (
            <SpacingBox
              styles={currentVEStyles}
              onChange={handleStyleChange}
            />
          )}

          {activeTab === 'bg' && (
            <BackgroundSection
              styles={currentVEStyles}
              onChange={handleStyleChange}
              proMode={false}
            />
          )}

          {activeTab === 'border' && (
            <BorderSection
              styles={currentVEStyles}
              onChange={handleStyleChange}
            />
          )}
        </div>

        {/* ── Undo/Redo Footer ────────────────── */}
        <div className="flex items-center gap-2 px-3 py-2 border-t border-[#2d2d3d] bg-[#16162a]">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded transition disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white hover:bg-white/10"
            title={undoLabel ? `Rückgängig: ${undoLabel}` : 'Rückgängig'}
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rückgängig</span>
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded transition disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white hover:bg-white/10"
            title={redoLabel ? `Wiederholen: ${redoLabel}` : 'Wiederholen'}
          >
            <Redo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Wiederholen</span>
          </button>
          <div className="ml-auto text-[10px] text-gray-600">
            Ctrl+Z / Ctrl+Y
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(panel, document.body);
};
