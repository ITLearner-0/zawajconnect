import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PrivacySettings } from '@/types/profile';

interface UsePrivacyManagementProps {
  userId: string | undefined;
  initialPrivacySettings: PrivacySettings | null;
}

export const usePrivacyManagement = ({ userId, initialPrivacySettings }: UsePrivacyManagementProps) => {
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(
    initialPrivacySettings || {
      profileVisibilityLevel: 1,
      showAge: true,
      showLocation: true,
      showOccupation: true,
      allowNonMatchMessages: true,
    }
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePrivacySettings = async (newSettings: Partial<PrivacySettings>) => {
    if (!userId) {
      setError('User ID is not available.');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ privacy_settings: { ...privacySettings, ...newSettings } })
        .eq('id', userId)
        .select('privacy_settings')
        .single();

      if (error) {
        console.error('Error updating privacy settings:', error);
        setError('Failed to update privacy settings.');
        return false;
      }

      // Update the local state with the new privacy settings
      setPrivacySettings(data.privacy_settings);
      return true;
    } catch (err: any) {
      console.error('Error updating privacy settings:', err);
      setError('An unexpected error occurred.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    privacySettings,
    isLoading,
    error,
    updatePrivacySettings,
  };
};
