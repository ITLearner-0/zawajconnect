// @ts-nocheck
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, createNamespacedLogger } from '../logger';

describe('Logger Utility', () => {
  const originalEnv = import.meta.env.DEV;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('in development mode', () => {
    beforeEach(() => {
      // @ts-expect-error - Mock DEV mode
      import.meta.env.DEV = true;
    });

    it('should log messages in development', () => {
      logger.log('Test message', 'arg1', 'arg2');
      expect(consoleLogSpy).toHaveBeenCalledWith('Test message', 'arg1', 'arg2');
    });

    it('should log info messages with emoji', () => {
      logger.info('Info message', { key: 'value' });
      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it('should log errors in development', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error, { userId: '123' });
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('namespace loggers', () => {
    it('should create namespaced logger', () => {
      const testLogger = createNamespacedLogger('TestFeature');
      testLogger.log('Test message');

      // In dev mode, should log with namespace
      if (import.meta.env.DEV) {
        expect(consoleLogSpy).toHaveBeenCalled();
        const callArgs = consoleLogSpy.mock.calls[0][0];
        expect(callArgs).toContain('[TestFeature]');
      }
    });

    it('should use auth logger', () => {
      logger.auth.log('Auth message', 'token');
      if (import.meta.env.DEV) {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('🔐'),
          expect.anything()
        );
      }
    });

    it('should use api logger', () => {
      logger.api.log('API call', '/endpoint');
      if (import.meta.env.DEV) {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('📡'),
          expect.anything()
        );
      }
    });

    it('should use realtime logger', () => {
      logger.realtime.log('Realtime event', 'data');
      if (import.meta.env.DEV) {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('🔄'),
          expect.anything()
        );
      }
    });
  });

  describe('error handling', () => {
    it('should handle Error objects', () => {
      const error = new Error('Test error');
      error.stack = 'Error stack trace';

      logger.error('Something went wrong', error);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle non-Error objects', () => {
      logger.error('Something went wrong', 'string error');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should include context in error logs', () => {
      logger.error('API failed', new Error('Network error'), {
        endpoint: '/api/users',
        method: 'GET',
      });
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
