import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home, MessageCircle, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRetrying: boolean;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    isRetrying: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      isRetrying: false
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In a real app, you'd send this to an error tracking service like Sentry, LogRocket, etc.
    console.log('Logging error to service:', {
      error: error.toString(),
      errorInfo: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.setState({ isRetrying: true });
      this.retryCount++;
      
      setTimeout(() => {
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
          isRetrying: false
        });
      }, 1000);
    }
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportBug = () => {
    const errorDetails = {
      error: this.state.error?.toString(),
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    // In a real app, this would open a bug report form or send to support
    console.log('Bug report details:', errorDetails);
    alert('Bug report details have been logged. Please contact support if the issue persists.');
  };

  private getErrorTitle = (error: Error): string => {
    if (error.message.includes('ChunkLoadError') || error.message.includes('Loading chunk')) {
      return 'Connection Issue';
    }
    if (error.message.includes('fetch')) {
      return 'Network Error';
    }
    if (error.name === 'SyntaxError') {
      return 'Page Load Error';
    }
    return 'Something Went Wrong';
  };

  private getErrorDescription = (error: Error): string => {
    if (error.message.includes('ChunkLoadError') || error.message.includes('Loading chunk')) {
      return 'There was a problem loading part of the application. This usually happens when the app has been updated.';
    }
    if (error.message.includes('fetch')) {
      return 'Unable to connect to our servers. Please check your internet connection and try again.';
    }
    if (error.name === 'SyntaxError') {
      return 'There was a problem loading this page. This might be due to a temporary issue.';
    }
    return 'We encountered an unexpected error. Our team has been notified and is working to fix it.';
  };

  private getSuggestions = (error: Error): string[] => {
    if (error.message.includes('ChunkLoadError') || error.message.includes('Loading chunk')) {
      return [
        'Try refreshing the page',
        'Clear your browser cache',
        'Check if the app has been updated'
      ];
    }
    if (error.message.includes('fetch')) {
      return [
        'Check your internet connection',
        'Try again in a few moments',
        'Contact support if the problem persists'
      ];
    }
    return [
      'Try refreshing the page',
      'Go back to the homepage',
      'Contact support if you keep seeing this error'
    ];
  };

  public render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorTitle = this.getErrorTitle(this.state.error);
      const errorDescription = this.getErrorDescription(this.state.error);
      const suggestions = this.getSuggestions(this.state.error);
      const canRetry = this.retryCount < this.maxRetries && !this.state.isRetrying;

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 flex items-center justify-center p-4">
          <div className="max-w-2xl mx-auto text-center">
            {/* Error Icon */}
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-red-100 rounded-full">
                <AlertTriangle className="h-16 w-16 text-red-600" />
              </div>
            </div>

            {/* Error Content */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl p-8 mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {errorTitle}
              </h1>
              
              <p className="text-lg text-gray-600 mb-6">
                {errorDescription}
              </p>

              {/* Suggestions */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Here's what you can try:</h3>
                <ul className="text-left space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <div className="w-2 h-2 bg-rose-500 rounded-full mr-3 flex-shrink-0"></div>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {canRetry && (
                  <button
                    onClick={this.handleRetry}
                    disabled={this.state.isRetrying}
                    className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-full hover:from-rose-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCcw className={`h-5 w-5 mr-2 ${this.state.isRetrying ? 'animate-spin' : ''}`} />
                    {this.state.isRetrying ? 'Retrying...' : 'Try Again'}
                  </button>
                )}
                
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center px-6 py-3 border-2 border-rose-500 text-rose-600 font-semibold rounded-full hover:bg-rose-500 hover:text-white transition-all duration-200"
                >
                  <Home className="h-5 w-5 mr-2" />
                  Go Home
                </button>
                
                <button
                  onClick={this.handleReportBug}
                  className="flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-600 font-semibold rounded-full hover:bg-gray-100 transition-all duration-200"
                >
                  <Bug className="h-5 w-5 mr-2" />
                  Report Issue
                </button>
              </div>

              {/* Retry Count Display */}
              {this.retryCount > 0 && (
                <div className="mt-6 text-sm text-gray-500">
                  Retry attempts: {this.retryCount}/{this.maxRetries}
                </div>
              )}
            </div>

            {/* Technical Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="bg-gray-100 rounded-2xl p-6 text-left">
                <summary className="cursor-pointer font-semibold text-gray-900 mb-4">
                  Technical Details (Development Only)
                </summary>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Error:</h4>
                    <code className="block bg-red-50 p-3 rounded-lg text-sm text-red-800 font-mono">
                      {this.state.error.toString()}
                    </code>
                  </div>
                  
                  {this.state.error.stack && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Stack Trace:</h4>
                      <code className="block bg-red-50 p-3 rounded-lg text-sm text-red-800 font-mono whitespace-pre-wrap overflow-x-auto">
                        {this.state.error.stack}
                      </code>
                    </div>
                  )}
                  
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Component Stack:</h4>
                      <code className="block bg-red-50 p-3 rounded-lg text-sm text-red-800 font-mono whitespace-pre-wrap overflow-x-auto">
                        {this.state.errorInfo.componentStack}
                      </code>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Support Contact */}
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center text-gray-500 text-sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Need help? Contact our support team
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <EnhancedErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </EnhancedErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Hook for error boundary context
export const useErrorHandler = () => {
  return {
    reportError: (error: Error, context?: string) => {
      console.error(`Error in ${context}:`, error);
      // In production, send to error tracking service
      if (process.env.NODE_ENV === 'production') {
        // Log to service
      }
    }
  };
};
