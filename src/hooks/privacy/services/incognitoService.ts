import { supabase } from '@/integrations/supabase/client';
import { IncognitoSettings } from '@/types/enhancedPrivacy';

export class IncognitoService {
  private incognitoUsers = new Set<string>();
  private dailyViewCounts = new Map<string, { date: string; count: number }>();

  async enableIncognito(userId: string): Promise<boolean> {
    try {
      this.incognitoUsers.add(userId);

      // Update user's privacy settings
      const { error } = await supabase
        .from('profiles')
        .update({
          privacy_settings: {
            incognito: {
              enabled: true,
              hideFromSearch: true,
              hideLastActive: true,
              hideViewHistory: true,
              limitProfileViews: true,
              maxProfileViewsPerDay: 5,
            },
          },
        })
        .eq('id', userId);

      if (error) {
        console.error('Error enabling incognito mode:', error);
        return false;
      }

      console.log(`Incognito mode enabled for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error enabling incognito mode:', error);
      return false;
    }
  }

  async disableIncognito(userId: string): Promise<boolean> {
    try {
      this.incognitoUsers.delete(userId);

      // Update user's privacy settings
      const { error } = await supabase
        .from('profiles')
        .update({
          privacy_settings: {
            incognito: {
              enabled: false,
              hideFromSearch: false,
              hideLastActive: false,
              hideViewHistory: false,
              limitProfileViews: false,
              maxProfileViewsPerDay: 0,
            },
          },
        })
        .eq('id', userId);

      if (error) {
        console.error('Error disabling incognito mode:', error);
        return false;
      }

      console.log(`Incognito mode disabled for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error disabling incognito mode:', error);
      return false;
    }
  }

  async checkIncognitoStatus(userId: string): Promise<boolean> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('privacy_settings')
        .eq('id', userId)
        .single();

      return profile?.privacy_settings?.incognito?.enabled || false;
    } catch (error) {
      console.error('Error checking incognito status:', error);
      return false;
    }
  }

  async checkDailyViewLimit(viewerId: string, targetUserId: string): Promise<boolean> {
    try {
      const { data: viewerProfile } = await supabase
        .from('profiles')
        .select('privacy_settings')
        .eq('id', viewerId)
        .single();

      const incognitoSettings = viewerProfile?.privacy_settings?.incognito;

      if (!incognitoSettings?.limitProfileViews) {
        return true; // No limit set
      }

      const today = new Date().toISOString().split('T')[0];
      const userViewData = this.dailyViewCounts.get(viewerId);

      if (!userViewData || userViewData.date !== today) {
        // Reset count for new day
        this.dailyViewCounts.set(viewerId, { date: today, count: 1 });
        return true;
      }

      if (userViewData.count >= incognitoSettings.maxProfileViewsPerDay) {
        return false; // Limit exceeded
      }

      // Increment count
      userViewData.count++;
      this.dailyViewCounts.set(viewerId, userViewData);
      return true;
    } catch (error) {
      console.error('Error checking daily view limit:', error);
      return true; // Allow view on error
    }
  }

  async hideFromSearchResults(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_visible: false })
        .eq('id', userId);

      if (error) {
        console.error('Error hiding from search results:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error hiding from search results:', error);
      return false;
    }
  }

  async showInSearchResults(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_visible: true })
        .eq('id', userId);

      if (error) {
        console.error('Error showing in search results:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error showing in search results:', error);
      return false;
    }
  }

  getIncognitoUsers(): string[] {
    return Array.from(this.incognitoUsers);
  }

  isUserIncognito(userId: string): boolean {
    return this.incognitoUsers.has(userId);
  }

  async obfuscateLastActive(userId: string): Promise<string> {
    const isIncognito = await this.checkIncognitoStatus(userId);

    if (isIncognito) {
      return 'Actif récemment'; // Generic message
    }

    // Return actual last active time
    try {
      const { data: session } = await supabase
        .from('user_sessions')
        .select('last_activity')
        .eq('user_id', userId)
        .order('last_activity', { ascending: false })
        .limit(1)
        .single();

      if (session?.last_activity) {
        const lastActive = new Date(session.last_activity);
        const now = new Date();
        const diffMinutes = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60));

        if (diffMinutes < 5) return 'En ligne';
        if (diffMinutes < 60) return `Actif il y a ${diffMinutes} minutes`;
        if (diffMinutes < 1440) return `Actif il y a ${Math.floor(diffMinutes / 60)} heures`;
        return `Actif il y a ${Math.floor(diffMinutes / 1440)} jours`;
      }

      return 'Actif récemment';
    } catch (error) {
      console.error('Error getting last active time:', error);
      return 'Actif récemment';
    }
  }
}

export const incognitoService = new IncognitoService();
