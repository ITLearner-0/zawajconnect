
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { tableExists } from '@/utils/database/core';
import { useToast } from '@/hooks/use-toast';
import { UserStatusType } from './types';

export const useUpdateUserStatus = (
  userId: string | null,
  isDemoUser: boolean,
  setStatus: (status: UserStatusType) => void,
  setLastActive: (lastActive: string | null) => void,
  setError: (error: string | null) => void
) => {
  const { toast } = useToast();

  const updateUserStatus = useCallback(async (newStatus: UserStatusType) => {
    if (!userId || isDemoUser) return false;

    try {
      setError(null);

      // Check if the user_sessions table exists
      const sessionsTableExists = await tableExists('user_sessions');
      
      if (!sessionsTableExists) {
        // Table doesn't exist, can't update status
        toast({
          title: "Status Update Failed",
          description: "User status tracking is not available",
          variant: "destructive"
        });
        return false;
      }

      // First check if a record exists for this user
      const { data: existingSession } = await supabase
        .from('user_sessions' as any)
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingSession) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('user_sessions' as any)
          .update({ 
            status: newStatus,
            last_active: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (updateError) throw updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('user_sessions' as any)
          .insert({ 
            user_id: userId, 
            status: newStatus,
            last_active: new Date().toISOString()
          });

        if (insertError) throw insertError;
      }

      // Update local state
      setStatus(newStatus);
      setLastActive(new Date().toISOString());
      
      return true;
    } catch (err: any) {
      console.error('Error updating user status:', err);
      setError(err.message || 'Failed to update status');
      
      toast({
        title: "Status Update Failed",
        description: err.message || "Could not update your status",
        variant: "destructive"
      });
      
      return false;
    }
  }, [userId, isDemoUser, toast, setStatus, setLastActive, setError]);

  return { updateUserStatus };
};
