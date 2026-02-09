// =====================================================
// VISUAL EDITOR – ELEMENTS TREE
// Hierarchischer Baum aller Elemente (Navigator Panel)
// =====================================================

import React, { useState } from 'react';
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
} from 'lucide-react';
import type { VEElement, VEElementType } from '../types/elements';
import { getChildren } from '../utils/elementHelpers';
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
  ComponentInstance: <Puzzle size={14} />,
};

// ===== TREE NODE =====

interface TreeNodeProps {
  element: VEElement;
  depth: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ element, depth }) => {
  const { state, dispatch } = useEditor();
  const [collapsed, setCollapsed] = useState(false);
  const children = getChildren(element);
  const hasChildren = children.length > 0;
  const isSelected = state.selectedId === element.id;

  return (
    <div>
      {/* Node Row */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          dispatch({ type: 'SELECT_ELEMENT', id: element.id });
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          paddingLeft: `${depth * 16 + 8}px`,
          cursor: 'pointer',
          backgroundColor: isSelected ? '#2563eb22' : 'transparent',
          borderLeft: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
          color: '#d1d5db',
          fontSize: '13px',
          userSelect: 'none',
          transition: 'background-color 0.1s',
        }}
        onMouseEnter={(e) => {
          if (!isSelected) (e.currentTarget.style.backgroundColor = '#ffffff08');
        }}
        onMouseLeave={(e) => {
          if (!isSelected) (e.currentTarget.style.backgroundColor = 'transparent');
        }}
      >
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

        {/* Label */}
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontWeight: isSelected ? 600 : 400,
            color: isSelected ? '#60a5fa' : '#d1d5db',
          }}
        >
          {element.label || element.type}
        </span>
      </div>

      {/* Children */}
      {hasChildren && !collapsed && (
        <div>
          {children.map(child => (
            <TreeNode key={child.id} element={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

// ===== ELEMENTS TREE =====

export const ElementsTree: React.FC = () => {
  const { state } = useEditor();

  return (
    <div
      style={{
        overflow: 'auto',
        flex: 1,
      }}
    >
      <TreeNode element={state.page.body} depth={0} />
    </div>
  );
};
