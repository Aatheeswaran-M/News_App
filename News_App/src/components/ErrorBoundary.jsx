import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    // Refresh the page as a fallback
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-container">
            <h2>🚨 Something went wrong</h2>
            <p>The application encountered an unexpected error.</p>
            <details style={{ whiteSpace: 'pre-wrap', marginTop: '20px' }}>
              <summary>Error Details (Click to expand)</summary>
              <p><strong>Error:</strong> {this.state.error && this.state.error.toString()}</p>
              <p><strong>Stack trace:</strong></p>
              <pre>{this.state.errorInfo.componentStack}</pre>
            </details>
            <div className="error-actions">
              <button onClick={this.handleRetry} className="retry-button">
                🔄 Retry
              </button>
              <button onClick={() => window.location.href = '/'} className="home-button">
                🏠 Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;