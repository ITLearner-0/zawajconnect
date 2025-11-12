import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showRetry?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

class LazyLoadingErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      retryCount: 0,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LazyLoading Error Boundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState((prevState) => ({
        hasError: false,
        error: null,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mb-3" />
            <h3 className="text-lg font-semibold text-destructive mb-2">Something went wrong</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {this.state.error?.message || 'An unexpected error occurred while loading content.'}
            </p>

            {this.props.showRetry && this.state.retryCount < this.maxRetries && (
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleRetry}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry ({this.maxRetries - this.state.retryCount} attempts left)
              </Button>
            )}

            {this.state.retryCount >= this.maxRetries && (
              <p className="text-xs text-muted-foreground">
                Maximum retry attempts reached. Please refresh the page.
              </p>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default LazyLoadingErrorBoundary;
