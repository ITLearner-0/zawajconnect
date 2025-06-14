
interface ErrorRecoveryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  enableCircuitBreaker?: boolean;
  circuitBreakerThreshold?: number;
  circuitBreakerTimeout?: number;
}

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
}

class ErrorRecoveryService {
  private static instance: ErrorRecoveryService;
  private circuitBreakers = new Map<string, CircuitBreakerState>();
  private defaultOptions: Required<ErrorRecoveryOptions> = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    enableCircuitBreaker: true,
    circuitBreakerThreshold: 5,
    circuitBreakerTimeout: 60000, // 1 minute
  };

  static getInstance(): ErrorRecoveryService {
    if (!ErrorRecoveryService.instance) {
      ErrorRecoveryService.instance = new ErrorRecoveryService();
    }
    return ErrorRecoveryService.instance;
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    key: string,
    options: Partial<ErrorRecoveryOptions> = {}
  ): Promise<T> {
    const config = { ...this.defaultOptions, ...options };
    
    if (config.enableCircuitBreaker && this.isCircuitOpen(key, config)) {
      throw new Error(`Circuit breaker is open for ${key}`);
    }

    let lastError: Error;
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const result = await operation();
        
        // Reset circuit breaker on success
        if (config.enableCircuitBreaker) {
          this.resetCircuitBreaker(key);
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (config.enableCircuitBreaker) {
          this.recordFailure(key, config);
        }
        
        // Don't retry on last attempt
        if (attempt === config.maxRetries) {
          break;
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffFactor, attempt),
          config.maxDelay
        );
        
        await this.delay(delay);
      }
    }
    
    throw lastError!;
  }

  private isCircuitOpen(key: string, config: Required<ErrorRecoveryOptions>): boolean {
    const breaker = this.circuitBreakers.get(key);
    if (!breaker) return false;

    const now = Date.now();
    
    switch (breaker.state) {
      case 'open':
        if (now - breaker.lastFailureTime > config.circuitBreakerTimeout) {
          // Transition to half-open
          breaker.state = 'half-open';
          return false;
        }
        return true;
      
      case 'half-open':
        return false;
      
      default:
        return false;
    }
  }

  private recordFailure(key: string, config: Required<ErrorRecoveryOptions>): void {
    const now = Date.now();
    let breaker = this.circuitBreakers.get(key);
    
    if (!breaker) {
      breaker = { failures: 0, lastFailureTime: now, state: 'closed' };
      this.circuitBreakers.set(key, breaker);
    }
    
    breaker.failures++;
    breaker.lastFailureTime = now;
    
    if (breaker.failures >= config.circuitBreakerThreshold) {
      breaker.state = 'open';
    }
  }

  private resetCircuitBreaker(key: string): void {
    const breaker = this.circuitBreakers.get(key);
    if (breaker) {
      breaker.failures = 0;
      breaker.state = 'closed';
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getCircuitBreakerStatus(key: string): CircuitBreakerState | null {
    return this.circuitBreakers.get(key) || null;
  }

  resetAllCircuitBreakers(): void {
    this.circuitBreakers.clear();
  }
}

export const errorRecoveryService = ErrorRecoveryService.getInstance();
