
import { logger } from '@/services/logging/LoggingService';

export interface APIMetrics {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  timestamp: number;
}

export class APIMetricsService {
  private apiMetrics: APIMetrics[] = [];

  trackAPICall(endpoint: string, method: string, duration: number, status: number): void {
    const apiMetric: APIMetrics = {
      endpoint,
      method,
      duration,
      status,
      timestamp: Date.now(),
    };
    
    this.apiMetrics = [...this.apiMetrics.slice(-99), apiMetric]; // Keep last 100 API calls
    logger.logApiCall(endpoint, method, duration, status);
  }

  getAPIMetrics(): APIMetrics[] {
    return [...this.apiMetrics];
  }

  clearAPIMetrics(): void {
    this.apiMetrics = [];
  }
}
