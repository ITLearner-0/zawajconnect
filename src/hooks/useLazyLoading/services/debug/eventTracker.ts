
import { LazyLoadingEvent } from './types';
import { DebugLogger } from './logger';

export class EventTracker {
  private events: Map<string, LazyLoadingEvent[]> = new Map();

  constructor(
    private logger: DebugLogger,
    private enableLogging: boolean = true
  ) {}

  logEvent(elementId: string, event: Omit<LazyLoadingEvent, 'timestamp'>): void {
    if (!this.enableLogging) return;
    
    const fullEvent: LazyLoadingEvent = {
      ...event,
      timestamp: Date.now(),
    };
    
    const events = this.events.get(elementId) || [];
    events.push(fullEvent);
    this.events.set(elementId, events);
    
    this.logger.log('debug', `Event: ${event.type}`, { elementId, ...event.data });
  }

  getEvents(elementId?: string): LazyLoadingEvent[] {
    if (elementId) {
      return this.events.get(elementId) || [];
    }
    return Array.from(this.events.values()).flat();
  }

  clearEvents(elementId?: string): void {
    if (elementId) {
      this.events.delete(elementId);
    } else {
      this.events.clear();
    }
  }
}
