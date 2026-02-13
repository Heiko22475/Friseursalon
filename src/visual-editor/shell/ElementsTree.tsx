// =====================================================
// VISUAL EDITOR – ELEMENTS TREE
// Hierarchischer Baum mit Drag & Drop Reordering
//
// DnD-Verhalten:
//   • Drag auf ein Element → Indikator oben / Mitte / unten
//     - Obere 25% → Drop vor diesem Element
//     - Mitte 50%  → Drop als Kind (wenn Container)
//     - Untere 25% → Drop nach diesem Element
//   • Body kann nicht gedraggt werden
//   • Sections nur direkt in Body
//   • Validierung gemäß canContain()
// =====================================================

import React, { useState, useRef, useCallback } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Layout,
  Rows3,
  Square,
  Type,
  Image,
  MousePointerClick,
  LayoutGrid,
  Puzzle,
  GripVertical,
  PanelTop,
  PanelBottom,
  Navigation,
} from 'lucide-react';
import type { VEElement, VEElementType } from '../types/elements';
import { getChildren, isContainer, canContain, findParent } from '../utils/elementHelpers';
import { useEditor } from '../state/EditorContext';

// ===== ICONS =====

const typeIcons: Record<VEElementType, React.ReactNode> = {
  Body: <Layout size={14} />,
  Section: <Rows3 size={14} />,
  Container: <Square size={14} />,
  Text: <Type size={14} />,
  Image: <Image size={14} />,
  Button: <MousePointerClick size={14} />,
  Cards: <LayoutGrid size={14} />,
  Navbar: <Navigation size={14} />,
  Header: <PanelTop size={14} />,
  Footer: <PanelBottom size={14} />,
  ComponentInstance: <Puzzle size={14} />,
  WebsiteBlock: <Rows3 size={14} />,
};

// ===== DROP POSITION =====

type DropPosition = 'before' | 'inside' | 'after' | null;

interface DropTarget {
  elementId: string;
  position: DropPosition;
}

// ===== TREE NODE =====

interface TreeNodeProps {
  element: VEElement;
  depth: number;
  draggedId: string | null;
  dropTarget: DropTarget | null;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDropTargetChange: (target: DropTarget | null) => void;
  onDrop: (draggedId: string, targetId: string, position: DropPosition) => void;
  onContextMenu: (e: React.MouseEvent, element: VEElement) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  element,
  depth,
  draggedId,
  dropTarget,
  onDragStart,
  onDragEnd,
  onDropTargetChange,
  onDrop,
  onContextMenu,
}) => {
  const { state, dispatch } = useEditor();
  const [collapsed, setCollapsed] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const rowRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const children = getChildren(element);
  const hasChildren = children.length > 0;
  const isSelected = state.selectedId === element.id;
  const isBody = element.type === 'Body';
  const isDragging = draggedId === element.id;
  const isContainerType = isContainer(element.type);

  // Start renaming on double-click
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBody) return; // Body can't be renamed
    setRenameValue(element.label || element.type);
    setIsRenaming(true);
    // Focus input after render
    setTimeout(() => renameInputRef.current?.select(), 0);
  };

  const commitRename = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== (element.label || element.type)) {
      dispatch({
        type: 'UPDATE_CONTENT',
        id: element.id,
        updates: { label: trimmed },
      });
    }
    setIsRenaming(false);
  };

  const cancelRename = () => {
    setIsRenaming(false);
  };

  // Determine drop indicator
  const isDropTarget = dropTarget?.elementId === element.id;
  const dropPos = isDropTarget ? dropTarget.position : null;

  // Drag handlers
  const handleDragStart = (e: React.DragEvent) => {
    if (isBody) { e.preventDefault(); return; }
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', element.id);
    onDragStart(element.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!draggedId || draggedId === element.id) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = rowRef.current?.getBoundingClientRect();
    if (!rect) return;

    const y = e.clientY - rect.top;
    const height = rect.height;
    const ratio = y / height;

    let position: DropPosition;
    if (isBody) {
      // Body: always drop inside
      position = 'inside';
    } else if (isContainerType) {
      // Containers: 25% before, 50% inside, 25% after
      if (ratio < 0.25) position = 'before';
      else if (ratio > 0.75) position = 'after';
      else position = 'inside';
    } else {
      // Leaf nodes: 50% before, 50% after
      if (ratio < 0.5) position = 'before';
      else position = 'after';
    }

    onDropTargetChange({ elementId: element.id, position });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedId && dropTarget) {
      onDrop(draggedId, dropTarget.elementId, dropTarget.position);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if actually leaving this element
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (rowRef.current && !rowRef.current.contains(relatedTarget)) {
      if (dropTarget?.elementId === element.id) {
        onDropTargetChange(null);
      }
    }
  };

  // Drop indicator styles
  const getDropIndicatorStyle = (): React.CSSProperties | null => {
    if (!isDropTarget || !dropPos) return null;

    if (dropPos === 'before') {
      return {
        position: 'absolute' as const,
        top: 0,
        left: `${depth * 16 + 8}px`,
        right: '8px',
        height: '2px',
        backgroundColor: '#3b82f6',
        borderRadius: '1px',
        zIndex: 10,
      };
    }
    if (dropPos === 'after') {
      return {
        position: 'absolute' as const,
        bottom: 0,
        left: `${depth * 16 + 8}px`,
        right: '8px',
        height: '2px',
        backgroundColor: '#3b82f6',
        borderRadius: '1px',
        zIndex: 10,
      };
    }
    // 'inside'
    return null;
  };

  const dropIndicator = getDropIndicatorStyle();
  const isDropInside = isDropTarget && dropPos === 'inside';

  return (
    <div>
      {/* Node Row */}
      <div
        ref={rowRef}
        draggable={!isBody}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDragEnd={onDragEnd}
        onClick={(e) => {
          e.stopPropagation();
          dispatch({ type: 'SELECT_ELEMENT', id: element.id });
        }}
        onDoubleClick={handleDoubleClick}
        onContextMenu={(e) => onContextMenu(e, element)}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          padding: '4px 8px',
          paddingLeft: `${depth * 16 + 4}px`,
          cursor: isBody ? 'default' : 'grab',
          backgroundColor: isDropInside
            ? '#2563eb22'
            : isSelected
            ? '#2563eb22'
            : 'transparent',
          borderLeft: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
          borderTop: isDropInside ? '1px dashed #3b82f640' : '1px solid transparent',
          borderBottom: isDropInside ? '1px dashed #3b82f640' : '1px solid transparent',
          color: '#d1d5db',
          fontSize: '13px',
          userSelect: 'none',
          transition: 'background-color 0.1s',
          opacity: isDragging ? 0.4 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isSelected && !isDragging && !isDropInside) {
            (e.currentTarget.style.backgroundColor = '#ffffff08');
          }
          dispatch({ type: 'HOVER_ELEMENT', id: element.id });
        }}
        onMouseLeave={(e) => {
          if (!isSelected && !isDropInside) {
            (e.currentTarget.style.backgroundColor = 'transparent');
          }
          dispatch({ type: 'HOVER_ELEMENT', id: null });
        }}
      >
        {/* Drop Indicator line */}
        {dropIndicator && <div style={dropIndicator} />}

        {/* Drag Handle */}
        {!isBody && (
          <span style={{
            display: 'flex',
            alignItems: 'center',
            color: '#4a4a5a',
            flexShrink: 0,
            cursor: 'grab',
          }}>
            <GripVertical size={12} />
          </span>
        )}

        {/* Collapse Toggle */}
        <span
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) setCollapsed(!collapsed);
          }}
          style={{
            width: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6b7280',
            flexShrink: 0,
          }}
        >
          {hasChildren ? (
            collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />
          ) : null}
        </span>

        {/* Icon */}
        <span style={{ color: isSelected ? '#60a5fa' : '#9ca3af', flexShrink: 0, display: 'flex' }}>
          {typeIcons[element.type]}
        </span>

        {/* Label (or rename input) */}
        {isRenaming ? (
          <input
            ref={renameInputRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); commitRename(); }
              if (e.key === 'Escape') { e.preventDefault(); cancelRename(); }
              e.stopPropagation(); // prevent VE keyboard shortcuts
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              flex: 1,
              minWidth: 0,
              padding: '0 4px',
              backgroundColor: '#2d2d3d',
              border: '1px solid #3b82f6',
              borderRadius: '3px',
              color: '#d1d5db',
              fontSize: '12px',
              outline: 'none',
              height: '20px',
            }}
          />
        ) : (
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontWeight: isSelected ? 600 : 400,
              color: isSelected ? '#60a5fa' : '#d1d5db',
              flex: 1,
            }}
          >
            {element.label || element.type}
          </span>
        )}
      </div>

      {/* Children */}
      {hasChildren && !collapsed && (
        <div>
          {children.map(child => (
            <TreeNode
              key={child.id}
              element={child}
              depth={depth + 1}
              draggedId={draggedId}
              dropTarget={dropTarget}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDropTargetChange={onDropTargetChange}
              onDrop={onDrop}
              onContextMenu={onContextMenu}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ===== ELEMENTS TREE =====

interface ElementsTreeProps {
  onContextMenu?: (e: React.MouseEvent, element: VEElement) => void;
}

export const ElementsTree: React.FC<ElementsTreeProps> = ({ onContextMenu }) => {
  const { state, dispatch } = useEditor();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  const handleDragStart = useCallback((id: string) => setDraggedId(id), []);
  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback((srcId: string, targetId: string, position: DropPosition) => {
    if (!position) return;

    const draggedEl = findElementById(state.page.body, srcId);
    const targetEl = findElementById(state.page.body, targetId);
    if (!draggedEl || !targetEl) return;

    if (position === 'inside') {
      // Drop as child of target
      if (!isContainer(targetEl.type)) return;
      if (!canContain(targetEl.type, draggedEl.type)) return;
      dispatch({ type: 'MOVE_ELEMENT', elementId: srcId, newParentId: targetId });
    } else {
      // Drop before/after target → find parent and index
      const parent = findParent(state.page.body, targetId);
      if (!parent) return;
      if (!canContain(parent.type, draggedEl.type)) return;

      const siblings = getChildren(parent);
      const targetIdx = siblings.findIndex(c => c.id === targetId);
      const newIndex = position === 'before' ? targetIdx : targetIdx + 1;

      dispatch({ type: 'MOVE_ELEMENT', elementId: srcId, newParentId: parent.id, newIndex });
    }

    setDraggedId(null);
    setDropTarget(null);
  }, [state.page.body, dispatch]);

  // Need to import findElementById
  const findElementById = (root: VEElement, id: string): VEElement | null => {
    if (root.id === id) return root;
    for (const child of getChildren(root)) {
      const found = findElementById(child, id);
      if (found) return found;
    }
    return null;
  };

  const handleContextMenu = useCallback((e: React.MouseEvent, element: VEElement) => {
    onContextMenu?.(e, element);
  }, [onContextMenu]);

  return (
    <div
      style={{
        overflow: 'auto',
        flex: 1,
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      <TreeNode
        element={state.page.body}
        depth={0}
        draggedId={draggedId}
        dropTarget={dropTarget}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDropTargetChange={setDropTarget}
        onDrop={handleDrop}
        onContextMenu={handleContextMenu}
      />
    </div>
  );
};
