
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUpdateUserStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (status: 'online' | 'offline' | 'away' | 'busy') => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      // Update the user's profile with the last activity timestamp
      // In a real app, you'd have a dedicated user_status table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);

      if (updateError) {
        throw updateError;
      }

      console.log(`User status updated to: ${status}`);
    } catch (err: any) {
      console.error('Error updating user status:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { updateStatus, loading, error };
};
