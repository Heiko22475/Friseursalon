import React from 'react';
import { X, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

export type DialogType = 'info' | 'success' | 'warning' | 'error' | 'confirm';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'info' | 'warning' | 'success' | 'error';
  type?: DialogType; // New, more flexible type system
  onConfirm?: () => void;
  onCancel?: () => void;
  dontAskAgain?: boolean;
  onDontAskAgainChange?: (checked: boolean) => void;
  showCancel?: boolean;
  isDangerous?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Abbrechen',
  variant = 'info',
  type,
  onConfirm,
  onCancel,
  dontAskAgain = false,
  onDontAskAgainChange,
  showCancel = true,
  isDangerous = false,
}) => {
  if (!isOpen) return null;

  // Determine effective type
  const effectiveType = type || (variant === 'danger' ? 'error' : variant === 'warning' ? 'warning' : variant === 'success' ? 'success' : 'info');
  const isConfirmType = effectiveType === 'confirm' || onCancel !== undefined;

  const getIcon = () => {
    switch (effectiveType) {
      case 'success':
        return <CheckCircle className="w-10 h-10 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-10 h-10 text-amber-500" />;
      case 'error':
        return <XCircle className="w-10 h-10 text-red-500" />;
      case 'info':
        return <Info className="w-10 h-10 text-blue-500" />;
      case 'confirm':
        return isDangerous || variant === 'danger' ? (
          <AlertTriangle className="w-10 h-10 text-amber-500" />
        ) : (
          <Info className="w-10 h-10 text-blue-500" />
        );
    }
  };

  const getColors = () => {
    if (isDangerous || variant === 'danger') {
      return {
        titleColor: 'text-red-700',
        confirmBg: 'bg-red-600',
        confirmHover: 'hover:bg-red-700',
      };
    }

    switch (effectiveType) {
      case 'success':
        return {
          titleColor: 'text-green-700',
          confirmBg: 'bg-green-600',
          confirmHover: 'hover:bg-green-700',
        };
      case 'warning':
        return {
          titleColor: 'text-amber-700',
          confirmBg: 'bg-amber-600',
          confirmHover: 'hover:bg-amber-700',
        };
      case 'error':
        return {
          titleColor: 'text-red-700',
          confirmBg: 'bg-red-600',
          confirmHover: 'hover:bg-red-700',
        };
      default:
        return {
          titleColor: 'text-blue-700',
          confirmBg: 'bg-rose-500',
          confirmHover: 'hover:bg-rose-600',
        };
    }
  };

  const colors = getColors();

  const handleConfirm = () => {
    onConfirm?.();
    if (!onCancel) return; // If no onCancel, keep dialog open (caller must close)
    onCancel(); // Close dialog
  };

  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className={`text-lg font-bold ${colors.titleColor}`}>{title}</h2>
          {onCancel && (
            <button
              onClick={handleCancel}
              className="p-1 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">{getIcon()}</div>
            <div className="flex-1">
              {typeof message === 'string' ? (
                <p className="text-gray-700 whitespace-pre-wrap">{message}</p>
              ) : (
                message
              )}
            </div>
          </div>

          {onDontAskAgainChange && (
            <label className="flex items-center mt-4 select-none cursor-pointer">
              <input
                type="checkbox"
                checked={dontAskAgain}
                onChange={e => onDontAskAgainChange(e.target.checked)}
                className="mr-2 w-4 h-4"
              />
              <span className="text-sm text-gray-600">Nicht mehr fragen</span>
            </label>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-6">
          {showCancel && isConfirmType && onCancel && (
            <button
              onClick={handleCancel}
              className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium transition"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`px-6 py-2 rounded-lg text-white font-medium transition ${colors.confirmBg} ${colors.confirmHover}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook for easy usage
export const useConfirmDialog = () => {
  const [dialogState, setDialogState] = React.useState<{
    isOpen: boolean;
    type?: DialogType;
    variant?: 'danger' | 'info' | 'warning' | 'success' | 'error';
    title: string;
    message: string | React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
    isDangerous?: boolean;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const showDialog = (config: Omit<typeof dialogState, 'isOpen'>) => {
    setDialogState({ ...config, isOpen: true });
  };

  const hideDialog = () => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
  };

  const confirm = (
    title: string,
    message: string | React.ReactNode,
    onConfirm: () => void,
    options?: {
      confirmText?: string;
      cancelText?: string;
      isDangerous?: boolean;
    }
  ) => {
    return new Promise<boolean>((resolve) => {
      showDialog({
        type: 'confirm',
        title,
        message,
        onConfirm: () => {
          onConfirm();
          resolve(true);
        },
        showCancel: true,
        variant: options?.isDangerous ? 'danger' : 'info',
        ...options,
      });
    });
  };

  const alert = (
    title: string,
    message: string | React.ReactNode,
    variant: 'info' | 'success' | 'warning' | 'error' = 'info'
  ) => {
    return new Promise<void>((resolve) => {
      showDialog({
        variant,
        title,
        message,
        showCancel: false,
        confirmText: 'OK',
        onConfirm: () => resolve(),
      });
    });
  };

  const success = (title: string, message: string | React.ReactNode) => {
    return alert(title, message, 'success');
  };

  const error = (title: string, message: string | React.ReactNode) => {
    return alert(title, message, 'error');
  };

  const warning = (title: string, message: string | React.ReactNode) => {
    return alert(title, message, 'warning');
  };

  return {
    dialogState,
    showDialog,
    hideDialog,
    confirm,
    alert,
    success,
    error,
    warning,
    Dialog: () => (
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onCancel={hideDialog}
        onConfirm={dialogState.onConfirm}
        type={dialogState.type}
        variant={dialogState.variant}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        showCancel={dialogState.showCancel}
        isDangerous={dialogState.isDangerous}
      />
    ),
  };
};
