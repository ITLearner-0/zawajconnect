import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import MobileOptimizedError from './MobileOptimizedError';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  private isMobile: boolean = false;
  
  public state: State = {
    hasError: false
  };

  constructor(props: Props) {
    super(props);
    // Note: We can't use hooks in class components, so we'll detect mobile via CSS
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      // Check if screen width suggests mobile (fallback detection)
      const isMobileScreen = window.innerWidth < 768;
      
      if (isMobileScreen) {
        return (
          <MobileOptimizedError 
            error={this.state.error}
            resetError={this.handleReset}
          />
        );
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card rounded-lg border p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Une erreur s'est produite
            </h2>
            <p className="text-muted-foreground mb-6">
              L'application a rencontré un problème. Veuillez réessayer ou actualiser la page.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={this.handleReset}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Actualiser la page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}