interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  userAgent: string;
  url: string;
  timestamp: string;
  userId?: string;
  route?: string;
}

class ErrorReportingService {
  private static instance: ErrorReportingService;
  private userId?: string;

  static getInstance() {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService();
    }
    return ErrorReportingService.instance;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  reportError(error: Error, errorInfo?: any, route?: string) {
    const report: ErrorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      route,
    };

    // In development, just log to console
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Report:', report);
      return;
    }

    // In production, you could send to your error reporting service
    // Example: Sentry, LogRocket, or custom endpoint
    this.sendToErrorService(report);
  }

  private async sendToErrorService(report: ErrorReport) {
    try {
      // Example implementation - replace with your error reporting service
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });
    } catch (error) {
      console.error('Failed to send error report:', error);
    }
  }
}

export const errorReporting = ErrorReportingService.getInstance();
