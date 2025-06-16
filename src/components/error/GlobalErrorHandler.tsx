
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from 'sonner';
import { ErrorService } from './services/errorService';
import { ErrorDisplay } from './ErrorDisplay';
import { ErrorHandlers } from './ErrorHandlers';

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
      errorId: ErrorService.generateErrorId()
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: ErrorService.generateErrorId()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error details
    ErrorService.logError(error, errorInfo, this.state.errorId);
    
    // Show user notification
    toast.error('Une erreur inattendue s\'est produite', {
      description: 'L\'équipe technique a été notifiée',
      duration: 5000
    });

    // Send error to monitoring service
    ErrorService.reportError(error, errorInfo, this.state.errorId);
  }

  private handleRetry = ErrorHandlers.handleRetry(
    (newState) => this.setState(newState),
    ErrorService.generateErrorId
  );

  private handleReload = ErrorHandlers.handleReload();

  private handleGoHome = ErrorHandlers.handleGoHome();

  private handleReportBug = ErrorHandlers.handleReportBug(
    this.state.errorId,
    this.state.error
  );

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorDisplay
          error={this.state.error}
          errorId={this.state.errorId}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
          onGoHome={this.handleGoHome}
          onReportBug={this.handleReportBug}
        />
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorHandler;
