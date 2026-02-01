// =====================================================
// TEXT CONTRAST PREVIEW
// Shows recommended text colors for a background
// =====================================================

import { generateTextContrasts } from '../../../utils/text-contrast-generator';
import { Check } from 'lucide-react';

interface TextContrastPreviewProps {
  bgColor: string;
  onSelectContrast?: (weight: 'high' | 'medium' | 'low', color: string) => void;
  selectedColor?: string;
}

export default function TextContrastPreview({ 
  bgColor, 
  onSelectContrast,
  selectedColor 
}: TextContrastPreviewProps) {
  const contrasts = generateTextContrasts(bgColor);
  
  const getWCAGBadge = (ratio: number) => {
    if (ratio >= 7) {
      return <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-medium">AAA</span>;
    } else if (ratio >= 4.5) {
      return <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">AA</span>;
    } else {
      return <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded font-medium">{ratio.toFixed(1)}:1</span>;
    }
  };
  
  const contrastOptions = [
    {
      key: 'high' as const,
      color: contrasts.high,
      ratio: contrasts.contrast_ratios.high,
      title: 'High Contrast',
      description: 'Überschriften & wichtige Texte',
    },
    {
      key: 'medium' as const,
      color: contrasts.medium,
      ratio: contrasts.contrast_ratios.medium,
      title: 'Medium Contrast',
      description: 'Body-Text & Standard-Inhalte',
    },
    {
      key: 'low' as const,
      color: contrasts.low,
      ratio: contrasts.contrast_ratios.low,
      title: 'Low Contrast',
      description: 'Gedämpfte & sekundäre Texte',
    },
  ];
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Empfohlene Textfarben</h4>
        <span className="text-xs text-gray-500">Hintergrund: {bgColor}</span>
      </div>
      
      <div 
        className="rounded-lg border-2 border-gray-300 p-4 space-y-2" 
        style={{ backgroundColor: bgColor }}
      >
        {contrastOptions.map(({ key, color, ratio, title, description }) => {
          const isSelected = selectedColor === color;
          
          return (
            <button
              key={key}
              onClick={() => onSelectContrast?.(key, color)}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                isSelected 
                  ? 'ring-2 ring-rose-500 ring-offset-2' 
                  : 'hover:bg-white/10 hover:backdrop-blur-sm'
              }`}
              style={{ 
                backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.1)' : 'transparent' 
              }}
            >
              <div className="flex items-start justify-between">
                <div style={{ color }} className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-semibold ${key === 'high' ? 'text-base' : key === 'medium' ? 'text-sm' : 'text-sm'}`}>
                      {title}
                    </span>
                    {getWCAGBadge(ratio)}
                    {isSelected && (
                      <Check className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                  <div className="text-xs opacity-90 mb-2">
                    {description}
                  </div>
                  <div className="text-xs font-mono opacity-75">
                    {color} · {ratio.toFixed(1)}:1
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="text-xs text-gray-500 space-y-1">
        <p>• <strong>AAA:</strong> Kontrast ≥ 7:1 (WCAG Level AAA)</p>
        <p>• <strong>AA:</strong> Kontrast ≥ 4.5:1 (WCAG Level AA)</p>
        <p>• Klicken Sie auf eine Option, um sie zu übernehmen</p>
      </div>
    </div>
  );
}
