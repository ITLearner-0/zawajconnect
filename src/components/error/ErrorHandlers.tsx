
export class ErrorHandlers {
  static handleRetry(
    setError: (error: { hasError: boolean; error?: Error; errorInfo?: any; errorId: string }) => void,
    generateErrorId: () => string
  ) {
    return () => {
      setError({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        errorId: generateErrorId()
      });
    };
  }

  static handleReload() {
    return () => {
      window.location.reload();
    };
  }

  static handleGoHome() {
    return () => {
      window.location.href = '/';
    };
  }

  static handleReportBug(errorId: string, error?: Error) {
    return () => {
      const errorDetails = {
        id: errorId,
        message: error?.message,
        stack: error?.stack
      };
      
      const subject = `Bug Report - Error ${errorId}`;
      const body = `Erreur détectée:\n\nID: ${errorId}\nMessage: ${error?.message}\n\nVeuillez décrire ce que vous faisiez quand l'erreur s'est produite...`;
      
      window.open(`mailto:support@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    };
  }
}
