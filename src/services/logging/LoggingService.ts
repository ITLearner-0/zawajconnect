interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

interface LogEntry {
  timestamp: string;
  level: keyof LogLevel;
  message: string;
  context?: any;
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

interface LoggingConfig {
  enableConsoleLogging: boolean;
  enableRemoteLogging: boolean;
  logLevel: keyof LogLevel;
  maxLocalLogs: number;
  batchSize: number;
  flushInterval: number;
}

class LoggingService {
  private static instance: LoggingService;
  private config: LoggingConfig;
  private localLogs: LogEntry[] = [];
  private flushTimer?: NodeJS.Timeout;
  private userId?: string;
  private sessionId: string;

  private constructor() {
    this.config = {
      enableConsoleLogging: true,
      enableRemoteLogging: process.env.NODE_ENV === 'production',
      logLevel: process.env.NODE_ENV === 'development' ? 'DEBUG' : 'INFO',
      maxLocalLogs: 1000,
      batchSize: 50,
      flushInterval: 30000, // 30 seconds
    };

    this.sessionId = this.generateSessionId();
    this.startPeriodicFlush();
  }

  static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  configure(config: Partial<LoggingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldLog(level: keyof LogLevel): boolean {
    const levels: Record<keyof LogLevel, number> = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3,
    };

    return levels[level] <= levels[this.config.logLevel];
  }

  private createLogEntry(
    level: keyof LogLevel,
    message: string,
    context?: any,
    metadata?: Record<string, any>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userId: this.userId,
      sessionId: this.sessionId,
      metadata: {
        ...metadata,
        url: window.location.href,
        userAgent: navigator.userAgent,
      },
    };
  }

  private addToLocalStorage(entry: LogEntry): void {
    this.localLogs.push(entry);

    // Keep only the most recent logs
    if (this.localLogs.length > this.config.maxLocalLogs) {
      this.localLogs = this.localLogs.slice(-this.config.maxLocalLogs);
    }
  }

  error(message: string, context?: any, metadata?: Record<string, any>): void {
    if (!this.shouldLog('ERROR')) return;

    const entry = this.createLogEntry('ERROR', message, context, metadata);

    if (this.config.enableConsoleLogging) {
      console.error(`[${entry.timestamp}] ERROR: ${message}`, context);
    }

    this.addToLocalStorage(entry);

    // Immediately flush errors
    this.flushLogs();
  }

  warn(message: string, context?: any, metadata?: Record<string, any>): void {
    if (!this.shouldLog('WARN')) return;

    const entry = this.createLogEntry('WARN', message, context, metadata);

    if (this.config.enableConsoleLogging) {
      console.warn(`[${entry.timestamp}] WARN: ${message}`, context);
    }

    this.addToLocalStorage(entry);
  }

  info(message: string, context?: any, metadata?: Record<string, any>): void {
    if (!this.shouldLog('INFO')) return;

    const entry = this.createLogEntry('INFO', message, context, metadata);

    if (this.config.enableConsoleLogging) {
      console.info(`[${entry.timestamp}] INFO: ${message}`, context);
    }

    this.addToLocalStorage(entry);
  }

  debug(message: string, context?: any, metadata?: Record<string, any>): void {
    if (!this.shouldLog('DEBUG')) return;

    const entry = this.createLogEntry('DEBUG', message, context, metadata);

    if (this.config.enableConsoleLogging) {
      console.log(`[${entry.timestamp}] DEBUG: ${message}`, context);
    }

    this.addToLocalStorage(entry);
  }

  // Component-specific logging
  logUserAction(action: string, component: string, metadata?: Record<string, any>): void {
    this.info(`User action: ${action}`, { action, component }, metadata);
  }

  logPageView(page: string, metadata?: Record<string, any>): void {
    this.info(`Page view: ${page}`, { page }, metadata);
  }

  logApiCall(endpoint: string, method: string, duration?: number, status?: number): void {
    this.info(`API call: ${method} ${endpoint}`, {
      endpoint,
      method,
      duration,
      status,
    });
  }

  logPerformance(metric: string, value: number, unit: string = 'ms'): void {
    this.info(`Performance: ${metric}`, { metric, value, unit });
  }

  // Get logs for debugging
  getLocalLogs(level?: keyof LogLevel): LogEntry[] {
    if (level) {
      return this.localLogs.filter((log) => log.level === level);
    }
    return [...this.localLogs];
  }

  // Export logs
  exportLogs(): string {
    return JSON.stringify(this.localLogs, null, 2);
  }

  // Clear local logs
  clearLogs(): void {
    this.localLogs = [];
  }

  private async flushLogs(): Promise<void> {
    if (!this.config.enableRemoteLogging || this.localLogs.length === 0) {
      return;
    }

    const logsToFlush = this.localLogs.splice(0, this.config.batchSize);

    try {
      // Send logs to remote logging service
      await this.sendLogsToRemote(logsToFlush);
    } catch (error) {
      // If remote logging fails, put logs back
      this.localLogs.unshift(...logsToFlush);
      console.error('Failed to send logs to remote service:', error);
    }
  }

  private async sendLogsToRemote(logs: LogEntry[]): Promise<void> {
    // This would be implemented based on your remote logging service
    // For now, we'll use a placeholder
    if (process.env.NODE_ENV === 'development') {
      console.log('Would send logs to remote service:', logs);
      return;
    }

    // Example implementation for a remote logging service
    const response = await fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ logs }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send logs: ${response.statusText}`);
    }
  }

  private startPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flushLogs();
    }, this.config.flushInterval);
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushLogs(); // Final flush
  }
}

export const logger = LoggingService.getInstance();
export type { LogEntry, LoggingConfig };
