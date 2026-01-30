import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'info' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
  dontAskAgain?: boolean;
  onDontAskAgainChange?: (checked: boolean) => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Abbrechen',
  variant = 'info',
  onConfirm,
  onCancel,
  dontAskAgain = false,
  onDontAskAgainChange,
}) => {
  if (!isOpen) return null;

  let color = '';
  if (variant === 'danger') color = 'text-red-700';
  if (variant === 'warning') color = 'text-yellow-700';
  if (variant === 'info') color = 'text-blue-700';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 animate-fade-in">
        <h2 className={`text-lg font-bold mb-2 ${color}`}>{title}</h2>
        <p className="mb-4 text-gray-700">{message}</p>
        {onDontAskAgainChange && (
          <label className="flex items-center mb-4 select-none">
            <input
              type="checkbox"
              checked={dontAskAgain}
              onChange={e => onDontAskAgainChange(e.target.checked)}
              className="mr-2"
            />
            Nicht mehr fragen
          </label>
        )}
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded text-white ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : variant === 'warning'
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
