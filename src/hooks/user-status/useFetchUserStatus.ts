
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserStatus {
  status: 'online' | 'offline' | 'away' | 'busy';
  last_active: string | null;
}

export const useFetchUserStatus = (userId: string | null) => {
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setUserStatus(null);
      return;
    }

    const fetchUserStatus = async () => {
      setLoading(true);
      setError(null);

      try {
        // For now, we'll use the profiles table and assume offline status
        // In a real implementation, you'd have a separate user_status table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('updated_at')
          .eq('id', userId)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          setError(profileError.message);
          return;
        }

        if (profile) {
          // Simple logic: if updated recently, consider online, otherwise offline
          const lastActive = new Date(profile.updated_at);
          const now = new Date();
          const diffMinutes = (now.getTime() - lastActive.getTime()) / (1000 * 60);
          
          setUserStatus({
            status: diffMinutes < 15 ? 'online' : 'offline',
            last_active: profile.updated_at
          });
        } else {
          setUserStatus({
            status: 'offline',
            last_active: null
          });
        }
      } catch (err: any) {
        console.error('Error in fetchUserStatus:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStatus();
  }, [userId]);

  return { userStatus, loading, error };
};
