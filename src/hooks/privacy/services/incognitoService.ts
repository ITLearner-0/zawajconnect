
import { supabase } from "@/integrations/supabase/client";
import { IncognitoSettings } from "@/types/enhancedPrivacy";

export class IncognitoService {
  private incognitoUsers = new Set<string>();

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
              maxProfileViewsPerDay: 5
            }
          }
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
              maxProfileViewsPerDay: 0
            }
          }
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

  isIncognito(userId: string): boolean {
    return this.incognitoUsers.has(userId);
  }

  async checkIncognitoStatus(userId: string): Promise<boolean> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('privacy_settings')
        .eq('id', userId)
        .single();

      if (!profile?.privacy_settings) return false;

      const settings = profile.privacy_settings as any;
      const incognitoEnabled = settings.incognito?.enabled || false;

      if (incognitoEnabled) {
        this.incognitoUsers.add(userId);
      } else {
        this.incognitoUsers.delete(userId);
      }

      return incognitoEnabled;
    } catch (error) {
      console.error('Error checking incognito status:', error);
      return false;
    }
  }

  filterSearchResults(profiles: any[], viewerId: string): any[] {
    return profiles.filter(profile => {
      // Don't show incognito users in search results
      if (this.isIncognito(profile.id)) {
        return false;
      }

      // Check if the profile has incognito settings that would hide them
      const settings = profile.privacy_settings;
      if (settings?.incognito?.hideFromSearch) {
        return false;
      }

      return true;
    });
  }

  maskUserActivity(userId: string, lastActive: Date): Date | null {
    if (this.isIncognito(userId)) {
      return null; // Hide last active time for incognito users
    }
    return lastActive;
  }

  async checkDailyViewLimit(viewerId: string, targetUserId: string): Promise<boolean> {
    if (!this.isIncognito(viewerId)) {
      return true; // No limit for non-incognito users
    }

    try {
      // Check today's view count (this would require a profile_views table)
      // For now, we'll implement a simple in-memory check
      const today = new Date().toDateString();
      const key = `${viewerId}_${today}`;
      
      // In a real implementation, you'd store this in Supabase or Redis
      const viewCount = parseInt(localStorage.getItem(key) || '0');
      const maxViews = 5; // Default limit for incognito users

      if (viewCount >= maxViews) {
        return false;
      }

      localStorage.setItem(key, (viewCount + 1).toString());
      return true;
    } catch (error) {
      console.error('Error checking daily view limit:', error);
      return false;
    }
  }
}

export const incognitoService = new IncognitoService();
