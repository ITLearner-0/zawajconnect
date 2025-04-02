
import { supabase } from "@/integrations/supabase/client";
import { SignInData } from "@/types/auth";
import { toast } from "sonner";

export const signIn = async (data: SignInData, t: (key: string) => string) => {
  const { email, password } = data;

  try {
    console.log("Starting login process with:", email);
    const { data: sessionData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Login error:", error);
      
      // More specific error messages
      if (error.message.includes("Invalid login credentials")) {
        toast(t("auth.invalidCredentials"), {
          description: t("auth.loginError")
        });
      } else {
        toast(error.message, {
          description: t("auth.loginError")
        });
      }
      
      return false;
    }
    
    console.log("Login successful, returning session");
    return true;
  } catch (error: any) {
    console.error("Authentication error:", error);
    toast(error.message, {
      description: "Error"
    });
    return false;
  }
};
