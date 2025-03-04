
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PrivacySettings } from '@/types/profile';
import { useToast } from '@/components/ui/use-toast';

interface UsePrivacySettingsProps {
  userId: string | null;
  initialPrivacySettings?: PrivacySettings;
  initialBlockedUsers?: string[];
  initialIsVisible?: boolean;
}

const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  profileVisibilityLevel: 1, // Moderate by default
  showAge: true,
  showLocation: true,
  showOccupation: true,
  allowNonMatchMessages: true,
};

export const usePrivacySettings = ({
  userId,
  initialPrivacySettings = DEFAULT_PRIVACY_SETTINGS,
  initialBlockedUsers = [],
  initialIsVisible = true,
}: UsePrivacySettingsProps) => {
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(initialPrivacySettings);
  const [blockedUsers, setBlockedUsers] = useState<string[]>(initialBlockedUsers);
  const [isAccountVisible, setIsAccountVisible] = useState<boolean>(initialIsVisible);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const savePrivacySettings = async (settings: PrivacySettings) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to update privacy settings",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setPrivacySettings(settings);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ privacy_settings: settings })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Privacy settings updated successfully",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: "Error",
        description: "Failed to update privacy settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAccountVisibility = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to update account visibility",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const newVisibility = !isAccountVisible;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_visible: newVisibility })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      setIsAccountVisible(newVisibility);
    } catch (error) {
      console.error('Error toggling account visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update account visibility",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const blockUser = async (userIdToBlock: string) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to block users",
        variant: "destructive",
      });
      return;
    }

    if (userIdToBlock === userId) {
      toast({
        title: "Error",
        description: "You cannot block yourself",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const updatedBlockedUsers = [...blockedUsers, userIdToBlock];
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ blocked_users: updatedBlockedUsers })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      setBlockedUsers(updatedBlockedUsers);
      toast({
        title: "User Blocked",
        description: "You'll no longer see content from this user",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error blocking user:', error);
      toast({
        title: "Error",
        description: "Failed to block user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const unblockUser = async (userIdToUnblock: string) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to unblock users",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const updatedBlockedUsers = blockedUsers.filter(id => id !== userIdToUnblock);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ blocked_users: updatedBlockedUsers })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      setBlockedUsers(updatedBlockedUsers);
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast({
        title: "Error",
        description: "Failed to unblock user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    privacySettings,
    blockedUsers,
    isAccountVisible,
    isLoading,
    savePrivacySettings,
    toggleAccountVisibility,
    blockUser,
    unblockUser,
  };
};
