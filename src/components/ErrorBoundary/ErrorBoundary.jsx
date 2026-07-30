import React from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: 'var(--bg-soft, #0f1117)',
          color: 'var(--text-main, #e5e7eb)',
          fontFamily: "'Inter', sans-serif",
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: 420,
            padding: '40px',
            borderRadius: '20px',
            background: 'var(--bg-card, rgba(255,255,255,0.04))',
            border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
          }}>
            <FiAlertTriangle style={{ fontSize: 48, color: '#f59e0b', marginBottom: 16 }} />
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Something Went Wrong</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted, #9ca3af)', marginBottom: 24 }}>
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={this.handleReset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 24px',
                borderRadius: 10,
                background: 'var(--primary, #6366f1)',
                color: '#fff',
                border: 'none',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <FiRefreshCw /> Go to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
