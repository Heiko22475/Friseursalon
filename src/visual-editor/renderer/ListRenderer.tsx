// =====================================================
// VISUAL EDITOR – LIST RENDERER
// Rendert ein VEList-Element (ol/ul) mit ListItem-Kindern
// =====================================================

import React from 'react';
import type { VEList, VEListItem as VEListItemType } from '../types/elements';
import type { VEViewport } from '../types/styles';
import { resolveStyles } from '../utils/styleResolver';
import { useEditor } from '../state/EditorContext';

interface ListRendererProps {
  element: VEList;
  viewport: VEViewport;
  isSelected: boolean;
  isHovered?: boolean;
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
  selectedId: string | null;
  hoveredId?: string | null;
}

// ===== LIST ITEM RENDERER =====

const ListItemRenderer: React.FC<{
  element: VEListItemType;
  viewport: VEViewport;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
}> = ({ element, viewport, isSelected, isHovered, onSelect, onHover }) => {
  const { state, dispatch } = useEditor();
  const resolvedStyles = resolveStyles(element.styles, viewport, element);
  const isEditing = state.editingId === element.id;

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'START_INLINE_EDIT', id: element.id });
  };

  const handleBlur = (e: React.FocusEvent<HTMLLIElement>) => {
    if (isEditing) {
      const newText = e.currentTarget.textContent || '';
      dispatch({ type: 'UPDATE_CONTENT', id: element.id, updates: { content: { text: newText } } as any });
      dispatch({ type: 'STOP_INLINE_EDIT' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
  };

  return (
    <li
      data-ve-id={element.id}
      data-ve-type={element.type}
      onClick={(e) => { e.stopPropagation(); onSelect(element.id); }}
      onMouseEnter={(e) => { e.stopPropagation(); onHover?.(element.id); }}
      onDoubleClick={handleDoubleClick}
      onBlur={handleBlur}
      onKeyDown={isEditing ? handleKeyDown : undefined}
      contentEditable={isEditing}
      suppressContentEditableWarning
      className={`${isSelected ? 've-selected' : ''} ${isHovered ? 've-hovered' : ''}`}
      style={{
        outline: isEditing ? '1px solid #3b82f6' : 'none',
        cursor: isEditing ? 'text' : 'pointer',
        borderRadius: '2px',
        ...resolvedStyles,
      }}
      dangerouslySetInnerHTML={!isEditing ? { __html: element.content.text } : undefined}
    >
      {isEditing ? element.content.text : undefined}
    </li>
  );
};

// ===== LIST RENDERER =====

export const ListRenderer: React.FC<ListRendererProps> = ({
  element,
  viewport,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  selectedId,
  hoveredId,
}) => {
  const resolvedStyles = resolveStyles(element.styles, viewport, element);
  const { listType } = element.content;
  const Tag = listType === 'ordered' ? 'ol' : 'ul';

  const children = element.children || [];

  return (
    <Tag
      data-ve-id={element.id}
      data-ve-type={element.type}
      onClick={(e) => { e.stopPropagation(); onSelect(element.id); }}
      onMouseEnter={(e) => { e.stopPropagation(); onHover?.(element.id); }}
      className={`${isSelected ? 've-selected' : ''} ${isHovered ? 've-hovered' : ''}`}
      style={{
        margin: 0,
        listStylePosition: 'outside',
        ...resolvedStyles,
      }}
    >
      {children.map((child) => {
        if (child.type !== 'ListItem') return null;
        return (
          <ListItemRenderer
            key={child.id}
            element={child as VEListItemType}
            viewport={viewport}
            isSelected={selectedId === child.id}
            isHovered={hoveredId === child.id}
            onSelect={onSelect}
            onHover={onHover}
          />
        );
      })}
    </Tag>
  );
};
