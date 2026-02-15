// =====================================================
// VISUAL EDITOR – CLASS SELECTOR
// Tag-input component for assigning/removing classes
// Appears at the top of PropertiesPanel when an element is selected.
// =====================================================

import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Pencil } from 'lucide-react';
import { useEditor } from '../state/EditorContext';
import type { VEElement } from '../types/elements';

interface ClassSelectorProps {
  element: VEElement;
}

/**
 * Tag-input for managing class assignments on the selected element.
 * - Shows assigned classes as chips
 * - Dropdown for assigning existing classes or creating new ones
 * - Click on chip → edit that class (SET_EDITING_CLASS)
 * - × on chip → remove class from element
 */
export const ClassSelector: React.FC<ClassSelectorProps> = ({ element }) => {
  const { state, dispatch } = useEditor();
  const { globalStyles, editingClass } = state;
  const classNames = element.classNames || [];

  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Available classes (not already assigned)
  const availableClasses = Object.keys(globalStyles).filter(
    (cn) => !classNames.includes(cn)
  );

  // Filtered by input
  const filtered = inputValue
    ? availableClasses.filter((cn) =>
        cn.toLowerCase().includes(inputValue.toLowerCase())
      )
    : availableClasses;

  // Track how many elements use each class (for info display)
  // Not deeply computed here for perf; could be memoized later.

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsAdding(false);
        setShowDropdown(false);
        setInputValue('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleAssign = (cn: string) => {
    dispatch({ type: 'ASSIGN_CLASS', elementId: element.id, className: cn });
    setInputValue('');
    setShowDropdown(false);
    setIsAdding(false);
  };

  const handleCreate = () => {
    const name = inputValue.trim().replace(/\s+/g, '-').toLowerCase();
    if (!name) return;
    if (globalStyles[name]) {
      // Already exists → just assign
      handleAssign(name);
      return;
    }
    dispatch({ type: 'CREATE_CLASS', name });
    dispatch({ type: 'ASSIGN_CLASS', elementId: element.id, className: name });
    setInputValue('');
    setShowDropdown(false);
    setIsAdding(false);
  };

  const handleRemove = (cn: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'REMOVE_CLASS', elementId: element.id, className: cn });
    if (editingClass === cn) {
      dispatch({ type: 'SET_EDITING_CLASS', name: null });
    }
  };

  const handleEditClass = (cn: string) => {
    dispatch({ type: 'SET_EDITING_CLASS', name: editingClass === cn ? null : cn });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered.length > 0 && inputValue) {
        handleAssign(filtered[0]);
      } else if (inputValue) {
        handleCreate();
      }
    }
    if (e.key === 'Escape') {
      setIsAdding(false);
      setShowDropdown(false);
      setInputValue('');
    }
  };

  return (
    <div ref={containerRef} style={{ padding: '8px 12px', borderBottom: '1px solid #2d2d3d' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          marginBottom: classNames.length > 0 || isAdding ? '6px' : '0',
        }}
      >
        <span style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
          Klassen
        </span>
        <button
          onClick={() => {
            setIsAdding(true);
            setShowDropdown(true);
          }}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#60a5fa',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Klasse hinzufügen"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Class chips */}
      {classNames.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: isAdding ? '6px' : '0' }}>
          {classNames.map((cn) => {
            const isActive = editingClass === cn;
            const exists = !!globalStyles[cn];
            return (
              <div
                key={cn}
                onClick={() => handleEditClass(cn)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  backgroundColor: isActive ? '#7c5cfc33' : '#2d2d3d',
                  border: `1px solid ${isActive ? '#7c5cfc' : exists ? '#3d3d5d' : '#f8717133'}`,
                  color: isActive ? '#a78bfa' : exists ? '#d1d5db' : '#f87171',
                  transition: 'all 0.15s',
                }}
                title={isActive ? 'Klasse bearbeiten (aktiv)' : exists ? `Klasse "${cn}" bearbeiten` : `Klasse "${cn}" nicht definiert`}
              >
                <span style={{ color: '#888' }}>.</span>
                {cn}
                {isActive && <Pencil size={10} style={{ color: '#a78bfa' }} />}
                <button
                  onClick={(e) => handleRemove(cn, e)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#888',
                    padding: '0',
                    display: 'flex',
                    alignItems: 'center',
                    marginLeft: '2px',
                  }}
                  title="Klasse entfernen"
                >
                  <X size={10} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add class input */}
      {isAdding && (
        <div style={{ position: 'relative' }}>
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            placeholder="Klasse suchen / erstellen…"
            style={{
              width: '100%',
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #3d3d5d',
              backgroundColor: '#16161e',
              color: '#d1d5db',
              fontSize: '12px',
              fontFamily: 'monospace',
              outline: 'none',
            }}
          />
          {showDropdown && (filtered.length > 0 || inputValue) && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '2px',
                backgroundColor: '#1e1e2e',
                border: '1px solid #3d3d5d',
                borderRadius: '6px',
                maxHeight: '160px',
                overflowY: 'auto',
                zIndex: 100,
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              }}
            >
              {filtered.map((cn) => (
                <button
                  key={cn}
                  onClick={() => handleAssign(cn)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '6px 10px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#d1d5db',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2d2d3d')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span style={{ color: '#888' }}>.</span>{cn}
                </button>
              ))}
              {inputValue && !globalStyles[inputValue.trim().replace(/\s+/g, '-').toLowerCase()] && (
                <button
                  onClick={handleCreate}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '6px 10px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#4ade80',
                    fontSize: '12px',
                    borderTop: filtered.length > 0 ? '1px solid #2d2d3d' : 'none',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2d2d3d')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  + Neue Klasse „{inputValue.trim().replace(/\s+/g, '-').toLowerCase()}" erstellen
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
