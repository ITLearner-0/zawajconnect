
import { DebugConfig } from './types';

export class DebugLogger {
  constructor(private config: DebugConfig) {}

  log(level: 'error' | 'warn' | 'info' | 'debug', message: string, data?: any): void {
    if (!this.config.enableLogging) return;
    
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.config.logLevel);
    const messageLevel = levels.indexOf(level);
    
    if (messageLevel > currentLevelIndex) return;
    
    const prefix = `${this.config.trackingPrefix} [${level.toUpperCase()}]`;
    
    switch (level) {
      case 'error':
        console.error(prefix, message, data);
        break;
      case 'warn':
        console.warn(prefix, message, data);
        break;
      case 'info':
        console.info(prefix, message, data);
        break;
      case 'debug':
        console.log(prefix, message, data);
        break;
    }
  }
}
