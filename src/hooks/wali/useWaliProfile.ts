
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client'; 
import { WaliProfile } from '@/types/wali';
import { useToast } from '../use-toast';

export const useWaliProfile = (userId: string) => {
  const [waliProfile, setWaliProfile] = useState<WaliProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch wali profile data
  useEffect(() => {
    const fetchWaliProfile = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('wali_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        setWaliProfile(data as WaliProfile);
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
      const { error: updateError } = await supabase
        .from('wali_profiles')
        .update({ availability_status: status, last_active: new Date().toISOString() })
        .eq('user_id', userId);

      if (updateError) {
        throw updateError;
      }

      setWaliProfile({
        ...waliProfile,
        availability_status: status,
        last_active: new Date().toISOString()
      });

      toast({
        title: "Status Updated",
        description: `Your status is now set to ${status}`,
        variant: "default"
      });

      return true;
    } catch (err: any) {
      console.error('Error updating wali status:', err);
      setError(err.message || 'Failed to update status');
      
      toast({
        title: "Status Update Failed",
        description: err.message || "Could not update your status",
        variant: "destructive"
      });
      
      return false;
    }
  };

  return {
    waliProfile,
    loading,
    error,
    updateAvailability
  };
};
