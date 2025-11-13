import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PrivacySettings } from '@/types/profile';
import { executeSql } from '@/utils/database';

const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  profileVisibilityLevel: 1, // Moderate by default
  showAge: true,
  showLocation: true,
  showOccupation: true,
  allowNonMatchMessages: true,
};

export const usePrivacySettings = () => {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(DEFAULT_PRIVACY_SETTINGS);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [isAccountVisible, setIsAccountVisible] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Get current user ID
  useEffect(() => {
    const getUserId = async () => {
      const { data } = await supabase.auth.getSession();
      if (data && data.session) {
        setUserId(data.session.user.id);
      }
    };
    
    getUserId();
  }, []);
  
  // Fetch privacy settings
  useEffect(() => {
    const fetchPrivacySettings = async () => {
      if (!userId) return;
      
      setLoading(true);
      
      // Ensure necessary columns exist
      await executeSql(`
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS privacy_settings JSONB 
        DEFAULT '{"profileVisibilityLevel": 1, "showAge": true, "showLocation": true, "showOccupation": true, "allowNonMatchMessages": true}'::jsonb;
        
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;
        
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS blocked_users TEXT[] DEFAULT '{}'::text[];
      `);
      
      // Get the profile data
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('privacy_settings, blocked_users, is_visible')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching privacy settings:', error);
        setLoading(false);
        return;
      }
      
      // Set privacy settings if they exist
      if (profile?.privacy_settings) {
        try {
          const settings = typeof profile.privacy_settings === 'string' 
            ? JSON.parse(profile.privacy_settings) 
            : profile.privacy_settings;
          
          setPrivacySettings(settings);
        } catch (e) {
          console.error('Error parsing privacy settings:', e);
          setPrivacySettings(DEFAULT_PRIVACY_SETTINGS);
        }
      }
      
      // Set blocked users if they exist
      if (profile?.blocked_users) {
        try {
          const blockedList = Array.isArray(profile.blocked_users)
            ? profile.blocked_users
            : typeof profile.blocked_users === 'string'
              ? JSON.parse(profile.blocked_users)
              : [];
          
          setBlockedUsers(blockedList);
        } catch (e) {
          console.error('Error parsing blocked users:', e);
          setBlockedUsers([]);
        }
      }
      
      // Set account visibility
      setIsAccountVisible(profile?.is_visible !== false);
      
      setLoading(false);
    };
    
    fetchPrivacySettings();
  }, [userId]);
  
  // Update privacy settings
  const updatePrivacySettings = async (newSettings: PrivacySettings) => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'You must be logged in to update privacy settings',
        variant: 'destructive',
      });
      return false;
    }
    
    try {
      // Update the database
      const { error } = await supabase
        .from('profiles')
        .update({ privacy_settings: newSettings })
        .eq('id', userId);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Update local state
      setPrivacySettings(newSettings);
      
      toast({
        title: 'Privacy Settings Updated',
        description: 'Your privacy settings have been updated successfully',
      });
      
      return true;
    } catch (err: any) {
      console.error('Error updating privacy settings:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to update privacy settings',
        variant: 'destructive',
      });
      return false;
    }
  };
  
  // Toggle account visibility
  const toggleAccountVisibility = async () => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'You must be logged in to update account visibility',
        variant: 'destructive',
      });
      return false;
    }
    
    const newVisibility = !isAccountVisible;
    
    try {
      // Update the database
      const { error } = await supabase
        .from('profiles')
        .update({ is_visible: newVisibility })
        .eq('id', userId);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Update local state
      setIsAccountVisible(newVisibility);
      
      toast({
        title: newVisibility ? 'Profile Visible' : 'Profile Hidden',
        description: `Your profile is now ${newVisibility ? 'visible' : 'hidden'} to other users`,
      });
      
      return true;
    } catch (err: any) {
      console.error('Error toggling account visibility:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to update account visibility',
        variant: 'destructive',
      });
      return false;
    }
  };
  
  // Block user
  const blockUser = async (userIdToBlock: string) => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'You must be logged in to block users',
        variant: 'destructive',
      });
      return false;
    }
    
    if (blockedUsers.includes(userIdToBlock)) {
      toast({
        title: 'Already Blocked',
        description: 'This user is already blocked',
        variant: 'destructive',
      });
      return false;
    }
    
    const updatedBlockedUsers = [...blockedUsers, userIdToBlock];
    
    try {
      // Update the database
      const { error } = await supabase
        .from('profiles')
        .update({ blocked_users: updatedBlockedUsers })
        .eq('id', userId);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Update local state
      setBlockedUsers(updatedBlockedUsers);
      
      toast({
        title: 'User Blocked',
        description: 'You will no longer receive messages from this user',
      });
      
      return true;
    } catch (err: any) {
      console.error('Error blocking user:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to block user',
        variant: 'destructive',
      });
      return false;
    }
  };
  
  // Unblock user
  const unblockUser = async (userIdToUnblock: string) => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'You must be logged in to unblock users',
        variant: 'destructive',
      });
      return false;
    }
    
    const updatedBlockedUsers = blockedUsers.filter(id => id !== userIdToUnblock);
    
    try {
      // Update the database
      const { error } = await supabase
        .from('profiles')
        .update({ blocked_users: updatedBlockedUsers })
        .eq('id', userId);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Update local state
      setBlockedUsers(updatedBlockedUsers);
      
      toast({
        title: 'User Unblocked',
        description: 'You can now receive messages from this user',
      });
      
      return true;
    } catch (err: any) {
      console.error('Error unblocking user:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to unblock user',
        variant: 'destructive',
      });
      return false;
    }
  };
  
  return {
    privacySettings,
    updatePrivacySettings,
    isAccountVisible,
    toggleAccountVisibility,
    blockedUsers,
    blockUser,
    unblockUser,
    loading
  };
};
