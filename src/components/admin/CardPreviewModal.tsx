// =====================================================
// CARD PREVIEW MODAL
// Responsive Vorschau-Modal mit Viewport-Switcher
// =====================================================

import React, { useState } from 'react';
import { X, Monitor, Tablet, Smartphone } from 'lucide-react';
import { GenericCardConfig } from '../../types/GenericCard';
import { GenericCard } from '../blocks/GenericCard';

interface CardPreviewModalProps {
  config: GenericCardConfig;
  onClose: () => void;
}

type Viewport = 'desktop' | 'tablet' | 'mobile';

export const CardPreviewModal: React.FC<CardPreviewModalProps> = ({ config, onClose }) => {
  const [viewport, setViewport] = useState<Viewport>('desktop');

  // Calculate width based on viewport
  const getViewportWidth = (): string => {
    switch (viewport) {
      case 'desktop':
        // Use maxWidth from grid config, default to 1200px
        return config.grid.maxWidth || '1200px';
      case 'tablet':
        return '1023px';
      case 'mobile':
        return '360px';
    }
  };

  const viewportButtons = [
    { id: 'desktop' as Viewport, icon: Monitor, label: 'Desktop' },
    { id: 'tablet' as Viewport, icon: Tablet, label: 'Tablet' },
    { id: 'mobile' as Viewport, icon: Smartphone, label: 'Mobil' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full h-[90vh] flex flex-col shadow-2xl max-w-[95vw]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Kartenvorschau</h2>
            
            {/* Viewport Switcher */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {viewportButtons.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setViewport(id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${
                    viewport === id
                      ? 'bg-white shadow-sm text-rose-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title={label}
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
              <GenericCard config={config} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {viewport === 'desktop' && 'Desktop-Ansicht: Maximalbreite des Kartengrids'}
            {viewport === 'tablet' && 'Tablet-Ansicht: 1023px Breite'}
            {viewport === 'mobile' && 'Mobile-Ansicht: 360px Breite (iPhone SE)'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
