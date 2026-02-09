// =====================================================
// THEME PREVIEW
// Live preview of theme colors applied to UI elements
// =====================================================

import { ThemeTokens } from '../../../types/theme';
import { resolveColor } from '../../../utils/token-resolver';

interface ThemePreviewProps {
  theme: ThemeTokens;
}

export default function ThemePreview({ theme }: ThemePreviewProps) {
  // Resolve colors
  const pageBg = resolveColor({ kind: 'tokenRef', ref: 'semantic.pageBg' }, theme);
  const contentBg = resolveColor({ kind: 'tokenRef', ref: 'semantic.contentBg' }, theme);
  const cardBg = resolveColor({ kind: 'tokenRef', ref: 'semantic.cardBg' }, theme);
  const headingText = resolveColor({ kind: 'tokenRef', ref: 'semantic.headingText' }, theme);
  const bodyText = resolveColor({ kind: 'tokenRef', ref: 'semantic.bodyText' }, theme);
  const mutedText = resolveColor({ kind: 'tokenRef', ref: 'semantic.mutedText' }, theme);
  const link = resolveColor({ kind: 'tokenRef', ref: 'semantic.link' }, theme);
  const linkHover = resolveColor({ kind: 'tokenRef', ref: 'semantic.linkHover' }, theme);
  const border = resolveColor({ kind: 'tokenRef', ref: 'semantic.border' }, theme);
  const borderLight = resolveColor({ kind: 'tokenRef', ref: 'semantic.borderLight' }, theme);
  const buttonPrimaryBg = resolveColor({ kind: 'tokenRef', ref: 'semantic.buttonPrimaryBg' }, theme);
  const buttonPrimaryText = resolveColor({ kind: 'tokenRef', ref: 'semantic.buttonPrimaryText' }, theme);
  const buttonSecondaryBg = resolveColor({ kind: 'tokenRef', ref: 'semantic.buttonSecondaryBg' }, theme);
  const buttonSecondaryText = resolveColor({ kind: 'tokenRef', ref: 'semantic.buttonSecondaryText' }, theme);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold" style={{ color: 'var(--admin-text-heading)' }}>Theme-Vorschau</h3>

      {/* Page Layout */}
      <div
        className="p-6 rounded-lg border-2"
        style={{
          backgroundColor: pageBg || '#FFFFFF',
          borderColor: border || '#E5E7EB',
        }}
      >
        <div
          className="p-6 rounded-lg space-y-6"
          style={{
            backgroundColor: contentBg || '#F9FAFB',
            color: bodyText || '#000000',
          }}
        >
          {/* Typography */}
          <div className="space-y-3">
            <h1
              className="text-3xl font-bold"
              style={{ color: headingText || '#000000' }}
            >
              Überschrift H1
            </h1>
            <h2
              className="text-2xl font-semibold"
              style={{ color: headingText || '#000000' }}
            >
              Überschrift H2
            </h2>
            <p style={{ color: bodyText || '#000000' }}>
              Dies ist ein Beispieltext im Body-Style. Er zeigt, wie der{' '}
              <a
                href="#"
                className="underline hover:no-underline transition-colors"
                style={{ color: link || '#3B82F6' }}
                onMouseEnter={(e) => {
                  if (linkHover) e.currentTarget.style.color = linkHover;
                }}
                onMouseLeave={(e) => {
                  if (link) e.currentTarget.style.color = link;
                }}
              >
                Link-Style
              </a>{' '}
              aussieht.
            </p>
            <p
              className="text-sm"
              style={{ color: mutedText || '#6B7280' }}
            >
              Gedämpfter Text für weniger wichtige Informationen.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 rounded-lg space-y-2"
                style={{
                  backgroundColor: cardBg || '#FFFFFF',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: borderLight || '#E5E7EB',
                }}
              >
                <h3
                  className="font-semibold"
                  style={{ color: headingText || '#000000' }}
                >
                  Card {i}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: bodyText || '#000000' }}
                >
                  Beispielinhalt für eine Card-Komponente.
                </p>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              className="px-6 py-2 rounded-lg font-medium transition-opacity hover:opacity-90"
              style={{
                backgroundColor: buttonPrimaryBg || '#EF4444',
                color: buttonPrimaryText || '#FFFFFF',
              }}
            >
              Primary Button
            </button>
            <button
              className="px-6 py-2 rounded-lg font-medium transition-opacity hover:opacity-90"
              style={{
                backgroundColor: buttonSecondaryBg || '#6B7280',
                color: buttonSecondaryText || '#FFFFFF',
              }}
            >
              Secondary Button
            </button>
            <button
              className="px-6 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: 'transparent',
                color: link || '#3B82F6',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: border || '#E5E7EB',
              }}
            >
              Outline Button
            </button>
          </div>

          {/* Form Elements */}
          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: bodyText || '#000000' }}
              >
                Input Field
              </label>
              <input
                type="text"
                placeholder="Beispieltext eingeben..."
                className="w-full px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: cardBg || '#FFFFFF',
                  color: bodyText || '#000000',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: border || '#E5E7EB',
                }}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: bodyText || '#000000' }}
              >
                Textarea
              </label>
              <textarea
                rows={3}
                placeholder="Längerer Text hier..."
                className="w-full px-4 py-2 rounded-lg resize-none"
                style={{
                  backgroundColor: cardBg || '#FFFFFF',
                  color: bodyText || '#000000',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: border || '#E5E7EB',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Color Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="space-y-1">
          <div className="font-medium" style={{ color: 'var(--admin-text-secondary)' }}>Page Background</div>
          <div className="font-mono" style={{ color: 'var(--admin-text-muted)' }}>{pageBg || 'N/A'}</div>
        </div>
        <div className="space-y-1">
          <div className="font-medium" style={{ color: 'var(--admin-text-secondary)' }}>Content Background</div>
          <div className="font-mono" style={{ color: 'var(--admin-text-muted)' }}>{contentBg || 'N/A'}</div>
        </div>
        <div className="space-y-1">
          <div className="font-medium" style={{ color: 'var(--admin-text-secondary)' }}>Card Background</div>
          <div className="font-mono" style={{ color: 'var(--admin-text-muted)' }}>{cardBg || 'N/A'}</div>
        </div>
        <div className="space-y-1">
          <div className="font-medium" style={{ color: 'var(--admin-text-secondary)' }}>Body Text</div>
          <div className="font-mono" style={{ color: 'var(--admin-text-muted)' }}>{bodyText || 'N/A'}</div>
        </div>
      </div>
    </div>
  );
}
