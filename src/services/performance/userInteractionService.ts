
import { logger } from '@/services/logging/LoggingService';

export interface UserInteractionMetrics {
  action: string;
  element: string;
  timestamp: number;
  duration?: number;
}

export class UserInteractionService {
  private userInteractions: UserInteractionMetrics[] = [];
  private interactionStartTime = 0;

  trackUserInteraction(action: string, element: string, duration?: number): void {
    const interaction: UserInteractionMetrics = {
      action,
      element,
      timestamp: Date.now(),
      duration,
    };
    
    this.userInteractions = [...this.userInteractions.slice(-199), interaction]; // Keep last 200 interactions
    logger.logUserAction(action, element, { duration });
  }

  startInteraction(): void {
    this.interactionStartTime = performance.now();
  }

  endInteraction(action: string, element: string): void {
    const duration = performance.now() - this.interactionStartTime;
    this.trackUserInteraction(action, element, duration);
  }

  getUserInteractions(): UserInteractionMetrics[] {
    return [...this.userInteractions];
  }

  clearUserInteractions(): void {
    this.userInteractions = [];
  }
}
