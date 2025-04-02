
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const signOut = async (t: (key: string) => string) => {
  try {
    console.log("Signing out user");
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Sign out error:", error);
      toast(error.message, {
        description: t("auth.signOutError")
      });
      return false;
    }
    
    console.log("Sign out successful");
    return true;
  } catch (error: any) {
    console.error("Sign out error:", error);
    toast(error.message, {
      description: "Error"
    });
    return false;
  }
};
