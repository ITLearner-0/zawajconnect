
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseBlockedUsersProps {
  initialBlockedUsers?: string[];
}

export const useBlockedUsers = ({
  initialBlockedUsers
}: UseBlockedUsersProps) => {
  const { toast } = useToast();
  const [blockedUsers, setBlockedUsers] = useState<string[]>(initialBlockedUsers || []);

  const unblockUser = async (userId: string, userIdToUnblock: string) => {
    const updatedBlockedUsers = blockedUsers.filter(id => id !== userIdToUnblock);
    
    // Make sure blocked_users column exists
    try {
      await supabase.rpc('execute_sql', {
        sql_query: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS blocked_users TEXT[] DEFAULT '{}'::text[]`
      });
    } catch (err) {
      console.error("Error ensuring blocked_users column exists:", err);
    }
    
    const { error } = await supabase
      .from("profiles")
      .update({ blocked_users: updatedBlockedUsers })
      .eq("id", userId);
      
    if (error) {
      console.error("Error unblocking user:", error);
      toast({
        title: "Error",
        description: "Failed to unblock user",
        variant: "destructive",
      });
      return false;
    }
    
    setBlockedUsers(updatedBlockedUsers);
    return true;
  };

  return {
    blockedUsers,
    unblockUser
  };
};
