// =====================================================
// EDIT MODE TOGGLE
// Floating Button zum Aktivieren/Deaktivieren des Edit-Modus
// Nur für Admins sichtbar
// =====================================================

import React from 'react';
import { Edit2, Check, X, Info } from 'lucide-react';
import { useEditMode } from '../../contexts/EditModeContext';

export const EditModeToggle: React.FC = () => {
  const { isEditMode, toggleEditMode, isAdmin } = useEditMode();

  // Only show for admins
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      {/* Info Tooltip (when edit mode is active) */}
      {isEditMode && (
        <div className="bg-white rounded-lg shadow-xl p-4 max-w-xs border-2 border-rose-500 animate-fadeIn">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900 text-sm mb-1">
                ✏️ Edit-Modus aktiv
              </p>
              <p className="text-xs text-gray-600">
                Klicken Sie auf beliebige Texte, um sie direkt zu bearbeiten.
              </p>
            </div>
            <button
              onClick={toggleEditMode}
              className="ml-2 text-gray-400 hover:text-gray-600"
              title="Edit-Modus deaktivieren"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={toggleEditMode}
        className={`
          group flex items-center gap-2 px-5 py-3 rounded-full shadow-2xl
          transition-all duration-300 font-medium text-sm
          hover:scale-105 active:scale-95
          ${isEditMode 
            ? 'bg-rose-500 text-white hover:bg-rose-600 ring-4 ring-rose-200' 
            : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-300 hover:border-rose-400'
          }
        `}
        title={isEditMode ? 'Edit-Modus deaktivieren' : 'Edit-Modus aktivieren'}
      >
        {isEditMode ? (
          <>
            <Check className="w-5 h-5" />
            <span>Edit-Modus aktiv</span>
          </>
        ) : (
          <>
            <Edit2 className="w-5 h-5" />
            <span>Edit-Modus</span>
          </>
        )}
      </button>
    </div>
  );
};
