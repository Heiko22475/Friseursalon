// =====================================================
// VISUAL EDITOR â€“ ERROR BOUNDARY
// FÃ¤ngt Rendering-Fehler und zeigt Fallback-UI
// =====================================================

import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class VEErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Visual Editor] Error caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            padding: '40px',
            backgroundColor: 'var(--admin-bg-card)',
            color: 'var(--admin-text)',
            gap: '16px',
            borderRadius: '8px',
            border: '1px solid #ef444440',
          }}
        >
          <span style={{ fontSize: '32px' }}>âš ï¸</span>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#ef4444' }}>
            Ein Fehler ist aufgetreten
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--admin-text-icon)', textAlign: 'center', maxWidth: '400px' }}>
            {this.state.error?.message || 'Unbekannter Fehler im Visual Editor.'}
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '8px 20px',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Erneut versuchen
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
