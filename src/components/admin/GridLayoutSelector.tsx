import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export type GridLayout = '50-50' | '60-40' | '40-60' | '70-30' | '30-70' | '25-75' | '75-25' | '66-33' | '33-66' | '33-33-33' | '25-25-25-25';

interface GridLayoutOption {
  value: GridLayout;
  label: string;
  columns: number[];
}

const LAYOUT_OPTIONS: GridLayoutOption[] = [
  { value: '50-50', label: '2-spaltig: 50:50 (Gleichmäßig)', columns: [50, 50] },
  { value: '60-40', label: '2-spaltig: 60:40 (Golden Ratio)', columns: [60, 40] },
  { value: '40-60', label: '2-spaltig: 40:60 (Umgekehrt)', columns: [40, 60] },
  { value: '70-30', label: '2-spaltig: 70:30 (Content + Sidebar)', columns: [70, 30] },
  { value: '30-70', label: '2-spaltig: 30:70 (Sidebar + Content)', columns: [30, 70] },
  { value: '25-75', label: '2-spaltig: 25:75 (Schmal + Breit)', columns: [25, 75] },
  { value: '75-25', label: '2-spaltig: 75:25 (Breit + Schmal)', columns: [75, 25] },
  { value: '66-33', label: '2-spaltig: 66:33 (Zwei Drittel)', columns: [66, 34] },
  { value: '33-66', label: '2-spaltig: 33:66 (Ein Drittel)', columns: [34, 66] },
  { value: '33-33-33', label: '3-spaltig: 33:33:33', columns: [33, 33, 34] },
  { value: '25-25-25-25', label: '4-spaltig: 25:25:25:25', columns: [25, 25, 25, 25] },
];

interface GridLayoutSelectorProps {
  value: GridLayout;
  onChange: (layout: GridLayout) => void;
  className?: string;
}

export const GridLayoutSelector: React.FC<GridLayoutSelectorProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = LAYOUT_OPTIONS.find((opt) => opt.value === value) || LAYOUT_OPTIONS[0];

  const handleSelect = (layout: GridLayout) => {
    onChange(layout);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Selected Value Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition flex items-center justify-between"
        style={{ backgroundColor: 'var(--admin-bg-card)', borderColor: 'var(--admin-border-strong)' }}
      >
        <div className="flex items-center gap-3 flex-1">
          <GridPreview columns={selectedOption.columns} size="small" />
          <span className="font-medium" style={{ color: 'var(--admin-text-heading)' }}>{selectedOption.label}</span>
        </div>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          style={{ color: 'var(--admin-text-muted)' }}
        />
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute top-full left-0 right-0 mt-2 border-2 rounded-lg z-20 max-h-80 overflow-y-auto" style={{ backgroundColor: 'var(--admin-bg-card)', borderColor: 'var(--admin-border-strong)', boxShadow: 'var(--admin-shadow-lg)' }}>
            {LAYOUT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className="w-full px-4 py-3 flex items-center gap-3 transition"
                style={option.value === value ? { backgroundColor: 'var(--admin-accent-bg)' } : undefined}
                onMouseEnter={e => { if (option.value !== value) e.currentTarget.style.backgroundColor = 'var(--admin-bg-hover)'; }}
                onMouseLeave={e => { if (option.value !== value) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <GridPreview columns={option.columns} size="large" />
                <span className="font-medium" style={{ color: 'var(--admin-text-heading)' }}>{option.label}</span>
                {option.value === value && (
                  <span className="ml-auto font-bold" style={{ color: 'var(--admin-accent)' }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

interface GridPreviewProps {
  columns: number[];
  size?: 'small' | 'large';
}

const GridPreview: React.FC<GridPreviewProps> = ({ columns, size = 'large' }) => {
  const containerWidth = size === 'small' ? 60 : 100;
  const height = size === 'small' ? 24 : 32;

  return (
    <div
      className="flex gap-1 items-stretch"
      style={{ width: `${containerWidth}px`, height: `${height}px` }}
    >
      {columns.map((width, index) => (
        <div
          key={index}
          className="bg-gradient-to-br from-rose-400 to-rose-500 rounded"
          style={{
            flex: `0 0 ${width}%`,
          }}
        ></div>
      ))}
    </div>
  );
};

// Helper function to get column count from layout
export const getColumnCount = (layout: GridLayout): number => {
  const option = LAYOUT_OPTIONS.find((opt) => opt.value === layout);
  return option ? option.columns.length : 2;
};

// Helper function to get Tailwind grid class
export const getGridClass = (layout: GridLayout): string => {
  switch (layout) {
    case '50-50':
      return 'grid-cols-2';
    case '60-40':
      return 'grid-cols-[3fr_2fr]';
    case '40-60':
      return 'grid-cols-[2fr_3fr]';
    case '70-30':
      return 'grid-cols-[7fr_3fr]';
    case '30-70':
      return 'grid-cols-[3fr_7fr]';
    case '25-75':
      return 'grid-cols-[1fr_3fr]';
    case '75-25':
      return 'grid-cols-[3fr_1fr]';
    case '66-33':
      return 'grid-cols-[2fr_1fr]';
    case '33-66':
      return 'grid-cols-[1fr_2fr]';
    case '33-33-33':
      return 'grid-cols-3';
    case '25-25-25-25':
      return 'grid-cols-4';
    default:
      return 'grid-cols-2';
  }
};
