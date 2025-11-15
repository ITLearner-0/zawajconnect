
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { executeSql } from "@/utils/database";

interface UseAccountVisibilityProps {
  initialIsVisible?: boolean;
}

export const useAccountVisibility = ({
  initialIsVisible
}: UseAccountVisibilityProps) => {
  const { toast } = useToast();
  const [isAccountVisible, setIsAccountVisible] = useState<boolean>(initialIsVisible !== false);

  const toggleAccountVisibility = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return false;
    }
    
    const userId = user.id;
    const newVisibilityState = !isAccountVisible;
    setIsAccountVisible(newVisibilityState);
    
    // Make sure is_visible column exists
    try {
      await executeSql(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true`);
    } catch (err) {
      console.error("Error ensuring is_visible column exists:", err);
    }
    
    const { error } = await (supabase as any)
      .from("profiles")
      .update({ is_visible: newVisibilityState })
      .eq("id", userId);
      
    if (error) {
      console.error("Error toggling account visibility:", error);
      setIsAccountVisible(!newVisibilityState); // Revert on error
      toast({
        title: "Error",
        description: "Failed to update account visibility",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  return {
    isAccountVisible,
    toggleAccountVisibility
  };
};
