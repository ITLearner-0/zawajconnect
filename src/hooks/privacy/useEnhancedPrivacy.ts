
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { EnhancedPrivacySettings } from '@/types/enhancedPrivacy';
import { progressiveRevealService } from './services/progressiveRevealService';
import { incognitoService } from './services/incognitoService';

const DEFAULT_ENHANCED_PRIVACY: EnhancedPrivacySettings = {
  profileVisibilityLevel: 1,
  showAge: true,
  showLocation: true,
  showOccupation: true,
  allowNonMatchMessages: true,
  progressiveReveal: {
    enabled: false,
    revealStages: {
      basic: true,
      education: true,
      religious: true,
      personal: true,
      contact: false
    },
    requiresCompatibilityScore: 70,
    autoRevealAfterDays: 7
  },
  incognito: {
    enabled: false,
    hideFromSearch: false,
    hideLastActive: false,
    hideViewHistory: false,
    limitProfileViews: false,
    maxProfileViewsPerDay: 0
  },
  profileVisibility: {
    whoCanSeeProfile: 'everyone',
    customCriteria: {
      minCompatibilityScore: 60,
      requireVerification: false,
      requireWaliApproval: false,
      allowedAgeRange: [18, 50],
      allowedLocations: [],
      blockedUsers: []
    },
    showInSearchResults: true,
    allowProfileScreenshots: true
  },
  dataRetention: {
    deleteViewHistoryAfterDays: 30,
    deleteConversationsAfterDays: 365,
    autoDeleteRejectedMatches: false
  }
};

export const useEnhancedPrivacy = (userId?: string) => {
  const { toast } = useToast();
  const [privacySettings, setPrivacySettings] = useState<EnhancedPrivacySettings>(DEFAULT_ENHANCED_PRIVACY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchPrivacySettings();
    }
  }, [userId]);

  const fetchPrivacySettings = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('privacy_settings')
        .eq('id', userId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (data?.privacy_settings) {
        const settings = typeof data.privacy_settings === 'string' 
          ? JSON.parse(data.privacy_settings) 
          : data.privacy_settings;
        
        // Merge with defaults to ensure all fields exist
        setPrivacySettings({
          ...DEFAULT_ENHANCED_PRIVACY,
          ...settings
        });
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching privacy settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const updatePrivacySettings = async (newSettings: EnhancedPrivacySettings) => {
    if (!userId) return false;

    try {
      // Convert to a plain object that Supabase can handle
      const settingsJson = JSON.parse(JSON.stringify(newSettings));
      
      const { error } = await supabase
        .from('profiles')
        .update({ privacy_settings: settingsJson })
        .eq('id', userId);

      if (error) {
        throw new Error(error.message);
      }

      setPrivacySettings(newSettings);
      
      toast({
        title: 'Privacy Settings Updated',
        description: 'Your privacy preferences have been saved successfully.',
      });
      
      return true;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error',
        description: err.message || 'Failed to update privacy settings',
        variant: 'destructive',
      });
      return false;
    }
  };

  const getFilteredProfile = async (
    targetProfile: any,
    viewerId: string,
    compatibilityScore?: number
  ) => {
    if (!targetProfile) return null;

    try {
      // Check if viewer is in incognito mode
      const viewerIncognito = await incognitoService.checkIncognitoStatus(viewerId);
      
      if (viewerIncognito) {
        const canView = await incognitoService.checkDailyViewLimit(viewerId, targetProfile.id);
        if (!canView) {
          throw new Error('Daily profile view limit reached');
        }
      }

      // Get the appropriate reveal level
      const revealLevel = await progressiveRevealService.getRevealLevel(
        viewerId,
        targetProfile.id,
        compatibilityScore
      );

      // Filter the profile data based on reveal level
      const filteredProfile = progressiveRevealService.filterProfileData(
        targetProfile,
        revealLevel
      );

      // Log the profile view
      await progressiveRevealService.logProfileView(
        viewerId,
        targetProfile.id,
        revealLevel,
        compatibilityScore
      );

      return {
        ...filteredProfile,
        revealLevel,
        isFiltered: revealLevel !== 'contact'
      };
    } catch (error) {
      console.error('Error filtering profile:', error);
      return null;
    }
  };

  const checkProfileVisibility = (
    targetProfile: any,
    viewerId: string,
    viewerProfile?: any,
    compatibilityScore?: number
  ): boolean => {
    if (!targetProfile?.privacy_settings?.profileVisibility) {
      return true; // Default to visible if no settings
    }

    const visibility = targetProfile.privacy_settings.profileVisibility;

    switch (visibility.whoCanSeeProfile) {
      case 'everyone':
        return true;

      case 'matches_only':
        // Would need to check if users are matches
        return compatibilityScore && compatibilityScore >= 60;

      case 'verified_only':
        return viewerProfile?.email_verified || viewerProfile?.phone_verified || viewerProfile?.id_verified;

      case 'custom':
        const criteria = visibility.customCriteria;
        
        // Check compatibility score
        if (criteria.minCompatibilityScore && (!compatibilityScore || compatibilityScore < criteria.minCompatibilityScore)) {
          return false;
        }

        // Check verification requirement
        if (criteria.requireVerification && !viewerProfile?.email_verified) {
          return false;
        }

        // Check if viewer is blocked
        if (criteria.blockedUsers?.includes(viewerId)) {
          return false;
        }

        return true;

      default:
        return true;
    }
  };

  return {
    privacySettings,
    loading,
    error,
    updatePrivacySettings,
    getFilteredProfile,
    checkProfileVisibility,
    progressiveRevealService,
    incognitoService
  };
};
