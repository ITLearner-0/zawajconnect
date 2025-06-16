export interface ErrorDetails {
  id: string;
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
}

export class ErrorService {
  static generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static logError(error: Error, errorInfo?: any, errorId?: string): void {
    const currentErrorId = errorId || this.generateErrorId();
    const errorDetails: ErrorDetails = {
      id: currentErrorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: localStorage.getItem('user_id') || 'anonymous'
    };

    console.group(`🚨 Global Error [${currentErrorId}]`);
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
  }

  static async reportError(error: Error, errorInfo?: any, errorId?: string): Promise<void> {
    try {
      const currentErrorId = errorId || this.generateErrorId();
      const errorReport: ErrorDetails = {
        id: currentErrorId,
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
  }
}
