import { supabase } from '@/integrations/supabase/client';
import { ProfileViewEvent, ProgressiveRevealSettings } from '@/types/enhancedPrivacy';

export class ProgressiveRevealService {
  private viewHistory = new Map<string, ProfileViewEvent[]>();

  async getRevealLevel(
    viewerId: string,
    targetUserId: string,
    compatibilityScore?: number
  ): Promise<keyof ProgressiveRevealSettings['revealStages']> {
    try {
      // Get target user's progressive reveal settings
      const { data: targetProfile } = await (supabase as any)
        .from('profiles')
        .select('privacy_settings')
        .eq('id', targetUserId)
        .single();

      if (!(targetProfile as any)?.privacy_settings?.progressiveReveal?.enabled) {
        return 'contact'; // Full reveal if not enabled
      }

      const settings = (targetProfile as any).privacy_settings.progressiveReveal;

      // Check compatibility score requirement
      if (compatibilityScore && compatibilityScore >= settings.requiresCompatibilityScore) {
        return 'contact'; // Full reveal for high compatibility
      }

      // Check conversation duration
      const conversationDays = await this.getConversationDuration(viewerId, targetUserId);
      if (conversationDays >= settings.autoRevealAfterDays) {
        return 'contact'; // Full reveal after conversation duration
      }

      // Progressive reveal based on interaction level
      if (conversationDays >= 3) return 'personal';
      if (conversationDays >= 1) return 'religious';
      if (compatibilityScore && compatibilityScore >= 50) return 'education';

      return 'basic'; // Minimum reveal level
    } catch (error) {
      console.error('Error determining reveal level:', error);
      return 'basic';
    }
  }

  async getConversationDuration(userId1: string, userId2: string): Promise<number> {
    try {
      const { data: conversation } = await (supabase as any)
        .from('conversations')
        .select('created_at')
        .contains('participants', [userId1])
        .contains('participants', [userId2])
        .single();

      if (!conversation) return 0;

      const createdAt = new Date((conversation as any).created_at);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - createdAt.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays;
    } catch (error) {
      console.error('Error getting conversation duration:', error);
      return 0;
    }
  }

  filterProfileData(
    profile: any,
    revealLevel: keyof ProgressiveRevealSettings['revealStages']
  ): any {
    const filtered = { ...profile };

    switch (revealLevel) {
      case 'basic':
        // Only show basic info
        return {
          id: filtered.id,
          first_name: filtered.first_name,
          birth_date: filtered.birth_date,
          location: this.obfuscateLocation(filtered.location),
          profile_picture: this.blurImage(filtered.profile_picture),
          gallery: filtered.gallery?.map((img: string) => this.blurImage(img)) || [],
        };

      case 'education':
        // Add education and work info
        return {
          ...this.filterProfileData(profile, 'basic'),
          education_level: filtered.education_level,
          occupation: filtered.occupation,
        };

      case 'religious':
        // Add religious practice info
        return {
          ...this.filterProfileData(profile, 'education'),
          religious_practice_level: filtered.religious_practice_level,
          prayer_frequency: filtered.prayer_frequency,
          madhab: filtered.madhab,
        };

      case 'personal':
        // Add personal details
        return {
          ...this.filterProfileData(profile, 'religious'),
          about_me: filtered.about_me,
          profile_picture: filtered.profile_picture, // Unblur photos
          gallery: filtered.gallery || [],
        };

      case 'contact':
        // Full profile access
        return filtered;

      default:
        return this.filterProfileData(profile, 'basic');
    }
  }

  private obfuscateLocation(location: string): string {
    if (!location) return '';

    // Remove specific addresses, keep only city/region
    const parts = location.split(',');
    if (parts.length > 1) {
      return parts.slice(-2).join(',').trim(); // Keep last 2 parts (city, country)
    }
    return location;
  }

  private blurImage(imageUrl: string): string {
    if (!imageUrl) return '';

    // Add blur filter parameter (this would be handled by your image service)
    return `${imageUrl}?blur=15&brightness=80`;
  }

  async logProfileView(
    viewerId: string,
    viewedUserId: string,
    revealLevel: keyof ProgressiveRevealSettings['revealStages'],
    compatibilityScore?: number
  ): Promise<void> {
    try {
      const viewEvent: ProfileViewEvent = {
        id: crypto.randomUUID(),
        viewerId,
        viewedUserId,
        timestamp: new Date(),
        revealLevel,
        compatibilityScore,
      };

      // Store in memory (in production, you'd store in database)
      const userViews = this.viewHistory.get(viewerId) || [];
      userViews.push(viewEvent);
      this.viewHistory.set(viewerId, userViews);

      console.log(
        `Profile view logged: ${viewerId} viewed ${viewedUserId} at level ${revealLevel}`
      );
    } catch (error) {
      console.error('Error logging profile view:', error);
    }
  }

  async getUserViewHistory(userId: string): Promise<ProfileViewEvent[]> {
    return this.viewHistory.get(userId) || [];
  }

  async clearViewHistory(userId: string): Promise<void> {
    this.viewHistory.delete(userId);
  }
}

export const progressiveRevealService = new ProgressiveRevealService();
