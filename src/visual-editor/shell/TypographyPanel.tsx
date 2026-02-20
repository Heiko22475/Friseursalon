// =====================================================
// VISUAL EDITOR – TYPOGRAPHY PANEL (Combined)
// Combined panel for Navigator: Font Tokens + Typography Tokens
// Shown in the left flyout when "Typografie" tab is active
// =====================================================

import React, { useState } from 'react';
import { FontTokenPanel } from './FontTokenPanel';
import { TypographyTokenPanel } from './TypographyTokenPanel';

type SubTab = 'fonts' | 'tokens';

export const TypographyPanel: React.FC = () => {
  const [subTab, setSubTab] = useState<SubTab>('tokens');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Sub-tab switcher */}
      <div
        style={{
          display: 'flex',
          gap: '2px',
          padding: '8px 8px 0',
          borderBottom: '1px solid #2d2d3d',
        }}
      >
        {([
          { key: 'tokens' as SubTab, label: 'Typo Tokens' },
          { key: 'fonts' as SubTab, label: 'Fonts' },
        ]).map(({ key, label }) => {
          const isActive = subTab === key;
          return (
            <button
              key={key}
              onClick={() => setSubTab(key)}
              style={{
                flex: 1,
                padding: '6px 8px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '4px 4px 0 0',
                border: 'none',
                borderBottom: isActive ? '2px solid #60a5fa' : '2px solid transparent',
                backgroundColor: isActive ? '#2563eb15' : 'transparent',
                color: isActive ? '#60a5fa' : '#6b7280',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Panel content */}
      {subTab === 'fonts' && <FontTokenPanel />}
      {subTab === 'tokens' && <TypographyTokenPanel />}
    </div>
  );
};
