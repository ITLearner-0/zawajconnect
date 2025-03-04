
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
      const updatedSettings = { ...privacySettings, ...newSettings };
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ privacy_settings: updatedSettings })
        .eq('id', userId)
        .select('privacy_settings')
        .single();

      if (error) {
        console.error('Error updating privacy settings:', error);
        setError('Failed to update privacy settings.');
        return false;
      }

      // Type assertion to ensure correct typing
      setPrivacySettings(data.privacy_settings as PrivacySettings);
      return true;
    } catch (err: any) {
      console.error('Error updating privacy settings:', err);
      setError('An unexpected error occurred.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePrivacySettingsChange = (newSettings: Partial<PrivacySettings>) => {
    // Update local state first
    setPrivacySettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }));
    
    // Then persist to database
    return updatePrivacySettings(newSettings);
  };

  return {
    privacySettings,
    isLoading,
    error,
    updatePrivacySettings,
    handlePrivacySettingsChange
  };
};
