/**
 * Production-safe logging utilities
 * Logs are only shown in development mode
 * In production, they can be sent to a monitoring service (Sentry, LogRocket, etc.)
 */

const isDev = import.meta.env.DEV;

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: unknown;
}

/**
 * Send logs to monitoring service in production
 * TODO: Integrate with Sentry or similar service
 */
const sendToMonitoring = (level: LogLevel, message: string, context?: LogContext) => {
  // In production, send to monitoring service
  // Example: Sentry.captureMessage(message, { level, extra: context });

  // For now, only log errors to console in production
  if (level === 'error') {
    console.error('[PRODUCTION]', message, context);
  }
};

/**
 * Safe logger that respects environment
 */
export const logger = {
  log: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.log(message, ...args);
    }
  },

  info: (message: string, context?: LogContext) => {
    if (isDev) {
      console.info(`ℹ️ ${message}`, context);
    }
  },

  warn: (message: string, context?: LogContext) => {
    if (isDev) {
      console.warn(`⚠️ ${message}`, context);
    } else {
      sendToMonitoring('warn', message, context);
    }
  },

  error: (message: string, error?: Error | unknown, context?: LogContext) => {
    if (isDev) {
      console.error(`❌ ${message}`, error, context);
    } else {
      // In production: Log generic message, suppress details
      sendToMonitoring('error', message, {
        ...context,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  },

  debug: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.debug(`🐛 ${message}`, ...args);
    }
  },

  // Special loggers for common use cases
  auth: {
    log: (message: string, ...args: unknown[]) => {
      if (isDev) {
        console.log(`🔐 [Auth] ${message}`, ...args);
      }
    },
    error: (message: string, error?: Error | unknown) => {
      if (isDev) {
        console.error(`🔐 [Auth] ${message}`, error);
      } else {
        logger.error(`[Auth] ${message}`, error);
      }
    },
  },

  api: {
    log: (message: string, ...args: unknown[]) => {
      if (isDev) {
        console.log(`📡 [API] ${message}`, ...args);
      }
    },
    error: (message: string, error?: Error | unknown) => {
      if (isDev) {
        console.error(`📡 [API] ${message}`, error);
      } else {
        logger.error(`[API] ${message}`, error);
      }
    },
  },

  realtime: {
    log: (message: string, ...args: unknown[]) => {
      if (isDev) {
        console.log(`🔄 [Realtime] ${message}`, ...args);
      }
    },
    error: (message: string, error?: Error | unknown) => {
      if (isDev) {
        console.error(`🔄 [Realtime] ${message}`, error);
      } else {
        logger.error(`[Realtime] ${message}`, error);
      }
    },
  },
};

/**
 * Create a namespace logger for a specific feature
 */
export const createNamespacedLogger = (namespace: string) => ({
  log: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.log(`[${namespace}] ${message}`, ...args);
    }
  },
  info: (message: string, context?: LogContext) => {
    logger.info(`[${namespace}] ${message}`, context);
  },
  warn: (message: string, context?: LogContext) => {
    logger.warn(`[${namespace}] ${message}`, context);
  },
  error: (message: string, error?: Error | unknown, context?: LogContext) => {
    logger.error(`[${namespace}] ${message}`, error, context);
  },
  debug: (message: string, ...args: unknown[]) => {
    logger.debug(`[${namespace}] ${message}`, ...args);
  },
});
