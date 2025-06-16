import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
}

export class GlobalErrorHandler extends Component<Props, State> {
  private errorLogInterval: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorId: this.generateErrorId()
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: GlobalErrorHandler.prototype.generateErrorId()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error details
    this.logError(error, errorInfo);
    
    // Show user notification
    toast.error('Une erreur inattendue s\'est produite', {
      description: 'L\'équipe technique a été notifiée',
      duration: 5000
    });

    // Send error to monitoring service
    this.reportError(error, errorInfo);
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logError = (error: Error, errorInfo?: ErrorInfo) => {
    const errorDetails = {
      id: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.group(`🚨 Global Error [${this.state.errorId}]`);
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Error Details:', errorDetails);
    console.groupEnd();

    // Store in local storage for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      existingErrors.push(errorDetails);
      
      // Keep only last 10 errors
      const recentErrors = existingErrors.slice(-10);
      localStorage.setItem('app_errors', JSON.stringify(recentErrors));
    } catch (storageError) {
      console.warn('Failed to store error in localStorage:', storageError);
    }
  };

  private reportError = async (error: Error, errorInfo?: ErrorInfo) => {
    try {
      // In a real app, send to error monitoring service (Sentry, Bugsnag, etc.)
      const errorReport = {
        id: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: localStorage.getItem('user_id') || 'anonymous'
      };

      console.log('📊 Error report would be sent:', errorReport);
      
      // Simulate API call
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // });
      
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: this.generateErrorId()
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportBug = () => {
    const errorDetails = {
      id: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack
    };
    
    const subject = `Bug Report - Error ${this.state.errorId}`;
    const body = `Erreur détectée:\n\nID: ${this.state.errorId}\nMessage: ${this.state.error?.message}\n\nVeuillez décrire ce que vous faisiez quand l'erreur s'est produite...`;
    
    window.open(`mailto:support@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-6 w-6" />
                Oops ! Une erreur s'est produite
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-gray-600">
                  Nous nous excusons pour la gêne occasionnée. Une erreur inattendue s'est produite.
                </p>
                <p className="text-sm text-gray-500">
                  ID d'erreur: <code className="bg-gray-100 px-1 py-0.5 rounded">{this.state.errorId}</code>
                </p>
              </div>

              {isDevelopment && this.state.error && (
                <details className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <summary className="cursor-pointer font-medium text-red-800">
                    Détails de l'erreur (développement uniquement)
                  </summary>
                  <div className="mt-3 space-y-2">
                    <div>
                      <strong>Message:</strong>
                      <pre className="text-sm bg-white p-2 rounded border mt-1 overflow-auto">
                        {this.state.error.message}
                      </pre>
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="text-xs bg-white p-2 rounded border mt-1 overflow-auto max-h-40">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="text-xs bg-white p-2 rounded border mt-1 overflow-auto max-h-40">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-wrap gap-3">
                <Button onClick={this.handleRetry} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Réessayer
                </Button>
                
                <Button onClick={this.handleReload} variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Recharger la page
                </Button>
                
                <Button onClick={this.handleGoHome} variant="outline" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Retour à l'accueil
                </Button>
                
                <Button onClick={this.handleReportBug} variant="ghost" className="flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  Signaler le bug
                </Button>
              </div>

              <div className="text-xs text-gray-500 border-t pt-4">
                <p>Si le problème persiste, veuillez contacter notre support technique.</p>
                <p>Timestamp: {new Date().toLocaleString('fr-FR')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorHandler;
