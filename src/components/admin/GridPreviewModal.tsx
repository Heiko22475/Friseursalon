// =====================================================
// GRID PREVIEW MODAL
// Responsive Vorschau-Modal mit Viewport-Switcher für Grids
// =====================================================

import React, { useState } from 'react';
import { X, Monitor, Tablet, Smartphone } from 'lucide-react';
import type { GridLayout } from './GridLayoutSelector';

interface GridPreviewModalProps {
  children: React.ReactNode;
  columnCount: number;
  layoutType: string;
  config: {
    gap: number;
    padding_top: number;
    padding_bottom: number;
    margin_left: number;
    margin_right: number;
  };
  backgroundColor?: string;
  getGridTemplateColumns: (layout: GridLayout) => string;
  onClose: () => void;
}

type Viewport = 'desktop' | 'tablet' | 'mobile';

export const GridPreviewModal: React.FC<GridPreviewModalProps> = ({
  children,
  columnCount,
  layoutType,
  config,
  backgroundColor,
  getGridTemplateColumns,
  onClose,
}) => {
  const [viewport, setViewport] = useState<Viewport>('desktop');

  // Calculate width and grid columns based on viewport
  const getViewportWidth = (): string => {
    switch (viewport) {
      case 'desktop':
        return '1200px';
      case 'tablet':
        return '768px';
      case 'mobile':
        return '375px';
    }
  };

  const getGridColumns = (): string => {
    switch (viewport) {
      case 'desktop':
        return getGridTemplateColumns(layoutType as GridLayout);
      case 'tablet':
        return columnCount > 2 ? '1fr 1fr' : '1fr 1fr';
      case 'mobile':
        return '1fr';
    }
  };

  const viewportButtons = [
    { id: 'desktop' as Viewport, icon: Monitor, label: 'Desktop', width: '> 1024px' },
    { id: 'tablet' as Viewport, icon: Tablet, label: 'Tablet', width: '768px - 1023px' },
    { id: 'mobile' as Viewport, icon: Smartphone, label: 'Mobil', width: '< 768px' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full h-[90vh] flex flex-col shadow-2xl max-w-[95vw]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Grid Vorschau</h2>
            
            {/* Viewport Switcher */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {viewportButtons.map(({ id, icon: Icon, label, width }) => (
                <button
                  key={id}
                  onClick={() => setViewport(id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${
                    viewport === id
                      ? 'bg-white shadow-sm text-rose-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title={`${label} (${width})`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>

            {/* Width Display */}
            <div className="text-sm text-gray-500">
              Breite: <span className="font-mono font-medium">{getViewportWidth()}</span>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto bg-gray-50 p-8">
          <div className="flex justify-center">
            <div
              style={{
                width: getViewportWidth(),
                maxWidth: '100%',
                transition: 'width 0.3s ease',
              }}
            >
              <div
                style={{
                  paddingTop: `${config.padding_top}px`,
                  paddingBottom: `${config.padding_bottom}px`,
                  paddingLeft: `${config.margin_left}px`,
                  paddingRight: `${config.margin_right}px`,
                  backgroundColor: backgroundColor || undefined,
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gap: `${config.gap}px`,
                    gridTemplateColumns: getGridColumns(),
                    transition: 'grid-template-columns 0.3s ease',
                  }}
                >
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Layout Info */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="text-gray-600">
                <span className="font-semibold">Layout:</span> {layoutType}
              </div>
              <div className="text-gray-600">
                <span className="font-semibold">Spalten:</span>{' '}
                {viewport === 'desktop'
                  ? `${columnCount} (Desktop)`
                  : viewport === 'tablet'
                  ? columnCount > 2
                    ? '2 (Tablet)'
                    : '2 (Tablet)'
                  : '1 (Mobil)'}
              </div>
              <div className="text-gray-600">
                <span className="font-semibold">Gap:</span> {config.gap}px
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Verwenden Sie die Viewport-Buttons, um das responsive Verhalten zu testen
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
