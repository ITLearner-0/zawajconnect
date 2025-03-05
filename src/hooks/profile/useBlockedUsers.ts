
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useBlockedUsers = (userId: string | null) => {
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchBlockedUsers = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    
    try {
      // Use array format instead of object to handle empty results
      const { data, error } = await supabase
        .from('profiles')
        .select('blocked_users')
        .eq('id', userId);
        
      if (error) {
        console.error('Error fetching blocked users:', error);
        return;
      }
      
      // Check if we have any results at all
      if (data && data.length > 0 && data[0].blocked_users) {
        setBlockedUsers(data[0].blocked_users);
      } else {
        // Initialize with empty array if no data or no blocked_users field
        setBlockedUsers([]);
      }
    } catch (err) {
      console.error('Error in fetchBlockedUsers:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const blockUser = async (targetUserId: string) => {
    if (!userId) return false;
    
    try {
      // Add user to blocked list locally first
      const updatedBlockedUsers = [...blockedUsers, targetUserId];
      setBlockedUsers(updatedBlockedUsers);
      
      // Then update in database
      const { error } = await supabase
        .from('profiles')
        .update({ blocked_users: updatedBlockedUsers })
        .eq('id', userId);
        
      if (error) {
        console.error('Error blocking user:', error);
        // Revert local state if database update failed
        setBlockedUsers(blockedUsers);
        return false;
      }
      
      toast({
        title: "User Blocked",
        description: "You will no longer see content from this user",
      });
      
      return true;
    } catch (err) {
      console.error('Error in blockUser:', err);
      return false;
    }
  };
  
  const unblockUser = async (targetUserId: string) => {
    if (!userId) return false;
    
    try {
      // Remove user from blocked list locally first
      const updatedBlockedUsers = blockedUsers.filter(id => id !== targetUserId);
      setBlockedUsers(updatedBlockedUsers);
      
      // Then update in database
      const { error } = await supabase
        .from('profiles')
        .update({ blocked_users: updatedBlockedUsers })
        .eq('id', userId);
        
      if (error) {
        console.error('Error unblocking user:', error);
        // Revert local state if database update failed
        setBlockedUsers(blockedUsers);
        return false;
      }
      
      toast({
        title: "User Unblocked",
        description: "You will now see content from this user",
      });
      
      return true;
    } catch (err) {
      console.error('Error in unblockUser:', err);
      return false;
    }
  };
  
  return {
    blockedUsers,
    isLoading,
    blockUser,
    unblockUser,
    fetchBlockedUsers
  };
};
