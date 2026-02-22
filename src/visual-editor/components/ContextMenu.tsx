// =====================================================
// VISUAL EDITOR – CONTEXT MENU
// Rechtsklick-Menü auf Canvas-Elemente
//
// Aktionen:
//   • Auswählen / Eltern auswählen
//   • Kopieren / Einfügen / Duplizieren
//   • Verschieben (hoch / runter)
//   • In Container einwickeln
//   • Element löschen
//   • Styles zurücksetzen
// =====================================================

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Copy,
  Clipboard,
  Trash2,
  ChevronUp,
  ChevronDown,
  ArrowUpToLine,
  SquareDashedBottom,
  RotateCcw,
  ExternalLink,
  Eye,
  EyeOff,
  ChevronsUp,
  CopyCheck,
} from 'lucide-react';
import type { VEElement } from '../types/elements';
import { useAdminTheme } from '../../contexts/AdminThemeContext';

// ===== TYPES =====

export interface ContextMenuPosition {
  x: number;
  y: number;
}

export interface ContextMenuData {
  position: ContextMenuPosition;
  element: VEElement;
  parentElement: VEElement | null;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canDelete: boolean;
  canDuplicate: boolean;
  canWrap: boolean;
  /** clipboard hat Inhalt */
  hasClipboard: boolean;
  /** Kann in dieses Element eingefügt werden (Container) */
  canPasteInto: boolean;
  /** This element is inside a card that is a direct child of a Cards element */
  isCardInCards: boolean;
  /** The ID of the card container (direct child of Cards) – set when isCardInCards is true */
  cardContainerId?: string;
}

export interface ContextMenuAction {
  type:
    | 'select-parent'
    | 'duplicate'
    | 'copy'
    | 'paste'
    | 'delete'
    | 'move-up'
    | 'move-down'
    | 'move-first'
    | 'move-last'
    | 'wrap-in-container'
    | 'unwrap'
    | 'reset-styles'
    | 'toggle-visibility'
    | 'apply-to-sibling-cards';
  elementId: string;
}

// ===== MENU ITEM =====

interface MenuItemProps {
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ label, icon, shortcut, danger, disabled, onClick }) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onClick();
      }}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        padding: '6px 12px',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '4px',
        cursor: disabled ? 'default' : 'pointer',
        color: disabled ? 'var(--admin-text-secondary)' : danger ? '#ef4444' : 'var(--admin-text)',
        fontSize: '12px',
        fontFamily: 'inherit',
        textAlign: 'left',
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color 0.1s',
      }}
      onMouseEnter={(e) => {
        if (!disabled) (e.currentTarget.style.backgroundColor = 'var(--admin-border)');
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <span style={{
        display: 'flex',
        alignItems: 'center',
        width: '16px',
        justifyContent: 'center',
        flexShrink: 0,
        color: disabled ? 'var(--admin-text-secondary)' : danger ? '#ef4444' : 'var(--admin-text-icon)',
      }}>
        {icon}
      </span>
      <span style={{ flex: 1 }}>{label}</span>
      {shortcut && (
        <span style={{
          fontSize: '11px',
          color: 'var(--admin-text-secondary)',
          fontFamily: 'monospace',
          letterSpacing: '0.02em',
        }}>
          {shortcut}
        </span>
      )}
    </button>
  );
};

const Divider: React.FC = () => (
  <div style={{
    height: '1px',
    backgroundColor: 'var(--admin-bg-input)',
    margin: '4px 8px',
  }} />
);

// ===== CONTEXT MENU COMPONENT =====

interface ContextMenuProps {
  data: ContextMenuData;
  onAction: (action: ContextMenuAction) => void;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ data, onAction, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPos, setAdjustedPos] = useState(data.position);
  const { theme } = useAdminTheme();

  const fire = useCallback((type: ContextMenuAction['type']) => {
    onAction({ type, elementId: data.element.id });
    onClose();
  }, [data.element.id, onAction, onClose]);

  // Position adjustment so menu doesn't go offscreen
  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    let { x, y } = data.position;

    if (x + rect.width > window.innerWidth - 8) {
      x = window.innerWidth - rect.width - 8;
    }
    if (y + rect.height > window.innerHeight - 8) {
      y = window.innerHeight - rect.height - 8;
    }
    if (x < 8) x = 8;
    if (y < 8) y = 8;

    if (x !== data.position.x || y !== data.position.y) {
      setAdjustedPos({ x, y });
    }
  }, [data.position]);

  // Close on outside click / Escape
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    // Delayed to avoid instant close from the contextmenu event
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('keydown', handleKey);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const isContainer = ['Body', 'Section', 'Container'].includes(data.element.type);
  const isBody = data.element.type === 'Body';

  return createPortal(
    <div className={`admin-theme-${theme}`} style={{ display: 'contents' }}>
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: adjustedPos.y,
        left: adjustedPos.x,
        zIndex: 10000,
        minWidth: '220px',
        backgroundColor: 'var(--admin-bg-surface)',
        border: '1px solid var(--admin-border-strong)',
        borderRadius: '8px',
        padding: '4px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.45), 0 4px 12px rgba(0,0,0,0.25)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Header: Element info */}
      <div style={{
        padding: '6px 12px 4px',
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--admin-text-secondary)',
        borderBottom: '1px solid var(--admin-border)',
        marginBottom: '4px',
      }}>
        {data.element.type}{data.element.label ? ` – ${data.element.label}` : ''}
      </div>

      {/* Select Parent */}
      {data.parentElement && (
        <>
          <MenuItem
            label={`Eltern: ${data.parentElement.label || data.parentElement.type}`}
            icon={<ChevronsUp size={14} />}
            onClick={() => {
              onAction({ type: 'select-parent', elementId: data.parentElement!.id });
              onClose();
            }}
          />
          <Divider />
        </>
      )}

      {/* Copy / Paste / Duplicate */}
      <MenuItem
        label="Kopieren"
        icon={<Copy size={14} />}
        shortcut="Ctrl+C"
        disabled={isBody}
        onClick={() => fire('copy')}
      />
      <MenuItem
        label="Einfügen"
        icon={<Clipboard size={14} />}
        shortcut="Ctrl+V"
        disabled={!data.hasClipboard || (!isContainer && !data.canPasteInto)}
        onClick={() => fire('paste')}
      />
      <MenuItem
        label="Duplizieren"
        icon={<Copy size={14} />}
        shortcut="Ctrl+D"
        disabled={!data.canDuplicate}
        onClick={() => fire('duplicate')}
      />

      <Divider />

      {/* Move */}
      <MenuItem
        label="Nach oben"
        icon={<ChevronUp size={14} />}
        disabled={!data.canMoveUp}
        onClick={() => fire('move-up')}
      />
      <MenuItem
        label="Nach unten"
        icon={<ChevronDown size={14} />}
        disabled={!data.canMoveDown}
        onClick={() => fire('move-down')}
      />
      <MenuItem
        label="An den Anfang"
        icon={<ArrowUpToLine size={14} />}
        disabled={!data.canMoveUp}
        onClick={() => fire('move-first')}
      />

      <Divider />

      {/* Structure */}
      <MenuItem
        label="In Container einwickeln"
        icon={<SquareDashedBottom size={14} />}
        disabled={!data.canWrap}
        onClick={() => fire('wrap-in-container')}
      />
      {isContainer && data.element.type !== 'Body' && (
        <MenuItem
          label="Container auflösen"
          icon={<ExternalLink size={14} />}
          onClick={() => fire('unwrap')}
        />
      )}

      <Divider />

      {/* Styles Reset */}
      <MenuItem
        label="Styles zurücksetzen"
        icon={<RotateCcw size={14} />}
        onClick={() => fire('reset-styles')}
      />

      {/* Visibility toggle (via display:none) */}
      <MenuItem
        label={data.element.styles?.desktop?.display === 'none' ? 'Einblenden' : 'Ausblenden'}
        icon={data.element.styles?.desktop?.display === 'none' ? <Eye size={14} /> : <EyeOff size={14} />}
        disabled={isBody}
        onClick={() => fire('toggle-visibility')}
      />

      {/* Apply card styles to all sibling cards */}
      {data.isCardInCards && data.cardContainerId && (
        <>
          <Divider />
          <MenuItem
            label="Auf alle Karten anwenden"
            icon={<CopyCheck size={14} />}
            onClick={() => {
              onAction({ type: 'apply-to-sibling-cards', elementId: data.cardContainerId! });
              onClose();
            }}
          />
        </>
      )}

      <Divider />

      {/* Delete */}
      <MenuItem
        label="Löschen"
        icon={<Trash2 size={14} />}
        shortcut="Del"
        danger
        disabled={!data.canDelete}
        onClick={() => fire('delete')}
      />
    </div>
    </div>,
    document.body
  );
};
