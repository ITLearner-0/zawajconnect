import { supabase } from '@/integrations/supabase/client';
import { DailyLimits } from '@/types/filters';

export class DailyLimitsService {
  private static readonly SUGGESTIONS_LIMIT = 5;
  private static readonly STORAGE_KEY = 'daily_limits';

  static async getDailyLimits(userId: string): Promise<DailyLimits> {
    const today = new Date().toISOString().split('T')[0];

    // First check localStorage for quick access
    const stored = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`);
    if (stored) {
      const limits: DailyLimits = JSON.parse(stored);
      if (limits.lastResetDate === today) {
        return limits;
      }
    }

    // Reset or create new limits for today
    const newLimits: DailyLimits = {
      suggestionsPerDay: this.SUGGESTIONS_LIMIT,
      currentDayCount: 0,
      lastResetDate: today ?? '',
    };

    localStorage.setItem(`${this.STORAGE_KEY}_${userId}`, JSON.stringify(newLimits));
    return newLimits;
  }

  static async incrementSuggestionCount(userId: string): Promise<boolean> {
    const limits = await this.getDailyLimits(userId);

    if (limits.currentDayCount >= limits.suggestionsPerDay) {
      return false; // Limit reached
    }

    limits.currentDayCount += 1;
    localStorage.setItem(`${this.STORAGE_KEY}_${userId}`, JSON.stringify(limits));

    return true;
  }

  static async getRemainingCount(userId: string): Promise<number> {
    const limits = await this.getDailyLimits(userId);
    return Math.max(0, limits.suggestionsPerDay - limits.currentDayCount);
  }

  static async canShowSuggestions(userId: string): Promise<boolean> {
    const remaining = await this.getRemainingCount(userId);
    return remaining > 0;
  }
}
