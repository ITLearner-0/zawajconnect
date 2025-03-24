
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUserSession = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const getUserId = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setCurrentUserId(session.user.id);
      } else {
        // If not logged in, use a temporary ID for the demo
        setCurrentUserId('current-user');
      }
      setLoading(false);
    };
    
    getUserId();
  }, []);

  return {
    currentUserId,
    isAuthenticated: currentUserId !== null && currentUserId !== 'current-user',
    loading
  };
};
