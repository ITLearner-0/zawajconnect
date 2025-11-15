
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useBlockedUsers = (userId: string | null) => {
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchBlockedUsers = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('blocked_users')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching blocked users:', error);
        return;
      }

      setBlockedUsers((data as any).blocked_users || []);
    } catch (err) {
      console.error('Unexpected error fetching blocked users:', err);
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
      return false;
    }

    setIsLoading(true);
    try {
      // Filter out the user ID to unblock
      const updatedBlockedList = blockedUsers.filter(id => id !== userIdToUnblock);
      
      const { error } = await (supabase as any)
        .from('profiles')
        .update({ blocked_users: updatedBlockedList })
        .eq('id', userId);

      if (error) {
        console.error('Error unblocking user:', error);
        toast({
          title: "Error",
          description: "Failed to unblock user",
          variant: "destructive",
        });
        return false;
      }

      setBlockedUsers(updatedBlockedList);
      toast({
        title: "User Unblocked",
        description: "User has been successfully unblocked",
      });
      return true;
    } catch (err) {
      console.error('Unexpected error unblocking user:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    blockedUsers,
    isLoading,
    fetchBlockedUsers,
    unblockUser
  };
};
