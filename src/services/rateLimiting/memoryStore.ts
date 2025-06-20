
import { RateLimitStateEntry } from './types';

export class MemoryStore {
  private store = new Map<string, RateLimitStateEntry>();

  getKey(userId: string, endpoint: string): string {
    return `${userId}:${endpoint}`;
  }

  get(key: string): RateLimitStateEntry | undefined {
    return this.store.get(key);
  }

  set(key: string, value: RateLimitStateEntry): void {
    this.store.set(key, value);
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  entries(): IterableIterator<[string, RateLimitStateEntry]> {
    return this.store.entries();
  }

  size(): number {
    return this.store.size;
  }

  cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [key, data] of this.store.entries()) {
      // Clean up expired windows and blocks
      if (data.blockedUntil && data.blockedUntil < now) {
        this.store.delete(key);
      } else if (!data.blockedUntil && (now - data.windowStart) > 24 * 60 * 60 * 1000) {
        // Clean up old windows after 24 hours
        this.store.delete(key);
      }
    }
  }

  getUserKeys(userId: string): string[] {
    const keys: string[] = [];
    for (const [key] of this.store.entries()) {
      if (key.startsWith(`${userId}:`)) {
        keys.push(key);
      }
    }
    return keys;
  }

  getBlockedUsers(): Set<string> {
    const now = Date.now();
    return new Set(
      Array.from(this.store.entries())
        .filter(([, data]) => data.blockedUntil && data.blockedUntil > now)
        .map(([key]) => key.split(':')[0])
    );
  }
}
