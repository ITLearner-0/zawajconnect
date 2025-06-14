
// Enhanced logging utility
export const logError = (operation: string, error: Error, context?: any) => {
  console.error(`[CompatibilityService] ${operation} failed:`, {
    error: error.message,
    stack: error.stack,
    context
  });
};

export const logWarning = (operation: string, message: string, context?: any) => {
  console.warn(`[CompatibilityService] ${operation}:`, message, context);
};

export const logInfo = (operation: string, message: string, context?: any) => {
  console.log(`[CompatibilityService] ${operation}:`, message, context);
};
