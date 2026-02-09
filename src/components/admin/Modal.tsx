import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string; // e.g., 'max-w-2xl', 'max-w-4xl', or custom like 'w-[1024px]'
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 transition-opacity"
        style={{ backgroundColor: 'var(--admin-overlay)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative rounded-xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto border`}
          style={{ backgroundColor: 'var(--admin-bg-card)', borderColor: 'var(--admin-border-strong)', boxShadow: 'var(--admin-shadow-lg)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 border-b px-6 py-4 flex items-center justify-between rounded-t-xl z-10" style={{ backgroundColor: 'var(--admin-bg-card)', borderColor: 'var(--admin-border-strong)' }}>
            <h2 className="text-xl font-bold" style={{ color: 'var(--admin-text-heading)' }}>{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition"
              style={{ color: 'var(--admin-text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--admin-text)'; e.currentTarget.style.backgroundColor = 'var(--admin-bg-input)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--admin-text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
              aria-label="Schließen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4" style={{ color: 'var(--admin-text)' }}>{children}</div>
        </div>
      </div>
    </div>
  );
};
