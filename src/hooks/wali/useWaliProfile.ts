
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WaliProfile } from '@/types/wali';
import { useToast } from '@/hooks/use-toast';

export const useWaliProfile = (userId: string | null) => {
  const { toast } = useToast();
  const [waliProfile, setWaliProfile] = useState<WaliProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError(null);

      try {
        // Initialize empty profile structure if it doesn't exist
        const { data, error } = await supabase
          .from('wali_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Error checking wali profile:', error);
          return null;
        }
        
        // If no profile exists, create a basic one
        if (!data) {
          const { data: userData } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', userId)
            .single();
            
          const defaultProfile = {
            user_id: userId,
            first_name: userData?.first_name || 'New',
            last_name: userData?.last_name || 'Wali',
            relationship: 'self',
            contact_information: '',
            is_verified: false,
            availability_status: 'offline' as const,
            last_active: new Date().toISOString(),
            managed_users: []
          };
          
          const { data: insertedProfile, error: insertError } = await supabase
            .from('wali_profiles')
            .insert(defaultProfile)
            .select()
            .single();
            
          if (insertError) {
            console.error('Error creating wali profile:', insertError);
            setError('Failed to create wali profile');
            return null;
          }
          
          setWaliProfile(insertedProfile as WaliProfile);
          return insertedProfile as WaliProfile;
        }
        
        setWaliProfile(data as WaliProfile);
        return data as WaliProfile;
      } catch (err: any) {
        console.error('Error fetching wali profile:', err);
        setError(err.message || 'Failed to load wali profile');
        return null;
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, toast]);

  // Update availability status
  const updateAvailability = async (status: WaliProfile['availability_status']) => {
    if (!userId || !waliProfile) {
      toast({
        title: "Error",
        description: "Unable to update status: Wali profile not loaded",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('wali_profiles')
        .update({ 
          availability_status: status,
          last_active: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      setWaliProfile({
        ...waliProfile,
        availability_status: status,
        last_active: new Date().toISOString()
      });

      toast({
        title: "Status Updated",
        description: `Your status is now ${status}`,
      });

      return true;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update status",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    waliProfile,
    loading,
    error,
    updateAvailability,
    setWaliProfile
  };
};
