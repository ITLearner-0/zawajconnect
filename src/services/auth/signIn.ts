
import { supabase } from "@/integrations/supabase/client";
import { SignInData } from "@/types/auth";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const signIn = async (data: SignInData, t: ReturnType<typeof useTranslation>["t"]) => {
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
    
    console.log("Login successful, redirecting to profile");
    // Store session data
    console.log("Session data:", sessionData);
    
    return true;
  } catch (error: any) {
    console.error("Authentication error:", error);
    toast(error.message, {
      description: "Error"
    });
    return false;
  }
};
