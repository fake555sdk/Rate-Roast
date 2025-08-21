import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { AnalyticsService } from '../services/analytics';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error to analytics
    AnalyticsService.trackError(error.message, undefined, {
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20 text-center">
            <AlertTriangle className="text-red-400 mx-auto mb-4" size={48} />
            
            <h1 className="text-2xl font-bold text-white mb-4">
              Oops! Something went wrong
            </h1>
            
            <p className="text-white/70 mb-6">
              We encountered an unexpected error. Don't worry, our team has been notified.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-white/80 cursor-pointer mb-2">
                  Error Details (Development)
                </summary>
                <div className="bg-black/30 rounded-lg p-3 text-xs text-white/70 font-mono overflow-auto max-h-32">
                  <div className="mb-2 text-red-300">{this.state.error.message}</div>
                  <div className="whitespace-pre-wrap">{this.state.error.stack}</div>
                </div>
              </details>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={this.handleReload}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                Reload
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Home size={16} />
                Home
              </button>
            </div>

            <p className="text-white/50 text-xs mt-4">
              Error ID: {Date.now().toString(36)}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for handling errors in functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    AnalyticsService.trackError(error.message, undefined, errorInfo);
    
    if (process.env.NODE_ENV === 'development') {
      console.error('Error handled:', error, errorInfo);
    }
  };
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}