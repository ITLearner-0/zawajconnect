import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WaliProfileExtended, SupervisionSettings } from '@/types/waliInvitation';
import { useToast } from '../use-toast';

// Helper function to safely parse chat preferences and supervision settings
const parseSupervisionSettings = (settings: any): SupervisionSettings => {
  if (!settings) {
    return {
      require_approval_for_new_conversations: true,
      receive_all_messages: false,
      can_end_conversations: true,
      notification_frequency: 'immediate',
      auto_approve_known_contacts: false,
    };
  }

  if (typeof settings === 'object') {
    return {
      require_approval_for_new_conversations:
        settings.require_approval_for_new_conversations || true,
      receive_all_messages: settings.receive_all_messages || false,
      can_end_conversations: settings.can_end_conversations || true,
      notification_frequency: settings.notification_frequency || 'immediate',
      auto_approve_known_contacts: settings.auto_approve_known_contacts || false,
    };
  }

  return {
    require_approval_for_new_conversations: true,
    receive_all_messages: false,
    can_end_conversations: true,
    notification_frequency: 'immediate',
    auto_approve_known_contacts: false,
  };
};

// Helper function to safely parse availability status
const parseAvailabilityStatus = (status: string | null): 'online' | 'away' | 'busy' | 'offline' => {
  if (!status) return 'offline';

  const validStatuses = ['online', 'away', 'busy', 'offline'] as const;
  if (validStatuses.includes(status as any)) {
    return status as 'online' | 'away' | 'busy' | 'offline';
  }

  return 'offline';
};

export const useWaliProfile = (userId: string) => {
  const [waliProfile, setWaliProfile] = useState<WaliProfileExtended | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch wali profile data with extended information
  useEffect(() => {
    const fetchWaliProfile = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await (supabase as any)
          .from('wali_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        // Convert the database record to WaliProfileExtended with proper type handling
        const waliProfile: any = {
          ...(data as any),
          availability_status: parseAvailabilityStatus((data as any).availability_status),
          supervision_settings: parseSupervisionSettings((data as any).supervision_settings),
          supervision_level: (data as any).supervision_level || 'moderate',
          invitation_status: (data as any).invitation_status || 'pending',
        };

        setWaliProfile(waliProfile);
      } catch (err: any) {
        console.error('Error fetching wali profile:', err);
        setError(err.message || 'Failed to load wali profile');
      } finally {
        setLoading(false);
      }
    };

    fetchWaliProfile();
  }, [userId]);

  // Update wali availability status
  const updateAvailability = async (status: 'online' | 'away' | 'busy' | 'offline') => {
    if (!userId || !waliProfile) return false;

    try {
      const { error: updateError } = await (supabase as any)
        .from('wali_profiles')
        .update({ availability_status: status, last_active: new Date().toISOString() })
        .eq('user_id', userId);

      if (updateError) {
        throw updateError;
      }

      setWaliProfile({
        ...waliProfile,
        availability_status: status,
        last_active: new Date().toISOString(),
      });

      toast({
        title: 'Status Updated',
        description: `Your status is now set to ${status}`,
        variant: 'default',
      });

      return true;
    } catch (err: any) {
      console.error('Error updating wali status:', err);
      setError(err.message || 'Failed to update status');

      toast({
        title: 'Status Update Failed',
        description: err.message || 'Could not update your status',
        variant: 'destructive',
      });

      return false;
    }
  };

  // Update supervision settings
  const updateSupervisionSettings = async (settings: SupervisionSettings, level: string) => {
    if (!userId || !waliProfile) return false;

    try {
      const { error: updateError } = await (supabase as any)
        .from('wali_profiles')
        .update({
          supervision_settings: settings,
          supervision_level: level,
        })
        .eq('user_id', userId);

      if (updateError) {
        throw updateError;
      }

      setWaliProfile({
        ...waliProfile,
        supervision_settings: settings,
        supervision_level: level as any,
      });

      return true;
    } catch (err: any) {
      console.error('Error updating supervision settings:', err);
      setError(err.message || 'Failed to update supervision settings');
      return false;
    }
  };

  return {
    waliProfile,
    loading,
    error,
    updateAvailability,
    updateSupervisionSettings,
  };
};
