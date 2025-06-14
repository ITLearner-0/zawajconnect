
import { supabase } from "@/integrations/supabase/client";
import { ProgressiveRevealSettings, ProfileViewEvent } from "@/types/enhancedPrivacy";
import { DatabaseProfile } from "@/types/profile";

export class ProgressiveRevealService {
  async getRevealLevel(
    viewerId: string,
    targetUserId: string,
    compatibilityScore?: number
  ): Promise<keyof ProgressiveRevealSettings['revealStages']> {
    try {
      // Get the target user's progressive reveal settings
      const { data: profile } = await supabase
        .from('profiles')
        .select('privacy_settings')
        .eq('id', targetUserId)
        .single();

      if (!profile?.privacy_settings) {
        return 'basic';
      }

      const settings = profile.privacy_settings as any;
      const progressiveReveal = settings.progressiveReveal as ProgressiveRevealSettings;

      if (!progressiveReveal?.enabled) {
        return 'contact'; // Full reveal if progressive reveal is disabled
      }

      // Check if users have been chatting and for how long
      const conversationDays = await this.getConversationDays(viewerId, targetUserId);
      
      if (conversationDays >= progressiveReveal.autoRevealAfterDays) {
        return 'contact'; // Full reveal after extended conversation
      }

      // Determine reveal level based on compatibility score
      if (!compatibilityScore || compatibilityScore < progressiveReveal.requiresCompatibilityScore) {
        return 'basic';
      }

      if (compatibilityScore >= 90) return 'contact';
      if (compatibilityScore >= 80) return 'personal';
      if (compatibilityScore >= 70) return 'religious';
      if (compatibilityScore >= 60) return 'education';
      
      return 'basic';
    } catch (error) {
      console.error('Error determining reveal level:', error);
      return 'basic';
    }
  }

  async logProfileView(
    viewerId: string,
    viewedUserId: string,
    revealLevel: keyof ProgressiveRevealSettings['revealStages'],
    compatibilityScore?: number
  ): Promise<void> {
    try {
      const viewEvent: Partial<ProfileViewEvent> = {
        viewerId,
        viewedUserId,
        timestamp: new Date(),
        revealLevel,
        compatibilityScore
      };

      // Store in a hypothetical profile_views table
      console.log('Profile view logged:', viewEvent);
      // In a real implementation, you'd store this in Supabase
    } catch (error) {
      console.error('Error logging profile view:', error);
    }
  }

  filterProfileData(
    profile: DatabaseProfile,
    revealLevel: keyof ProgressiveRevealSettings['revealStages']
  ): Partial<DatabaseProfile> {
    const baseProfile = {
      id: profile.id,
      first_name: profile.first_name
    };

    switch (revealLevel) {
      case 'basic':
        return {
          ...baseProfile,
          first_name: profile.first_name,
          birth_date: profile.birth_date,
          location: profile.location,
          gender: profile.gender
        };

      case 'education':
        return {
          ...baseProfile,
          first_name: profile.first_name,
          last_name: profile.last_name,
          birth_date: profile.birth_date,
          location: profile.location,
          gender: profile.gender,
          education_level: profile.education_level,
          occupation: profile.occupation
        };

      case 'religious':
        return {
          ...baseProfile,
          first_name: profile.first_name,
          last_name: profile.last_name,
          birth_date: profile.birth_date,
          location: profile.location,
          gender: profile.gender,
          education_level: profile.education_level,
          occupation: profile.occupation,
          religious_practice_level: profile.religious_practice_level,
          prayer_frequency: profile.prayer_frequency
        };

      case 'personal':
        return {
          ...profile,
          wali_name: undefined,
          wali_contact: undefined,
          wali_relationship: undefined
        };

      case 'contact':
      default:
        return profile;
    }
  }

  private async getConversationDays(userId1: string, userId2: string): Promise<number> {
    try {
      const { data: conversation } = await supabase
        .from('conversations')
        .select('created_at')
        .contains('participants', [userId1, userId2])
        .single();

      if (!conversation) return 0;

      const conversationStart = new Date(conversation.created_at);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - conversationStart.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays;
    } catch (error) {
      console.error('Error getting conversation days:', error);
      return 0;
    }
  }
}

export const progressiveRevealService = new ProgressiveRevealService();
