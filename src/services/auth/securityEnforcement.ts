
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const enforceEmailVerification = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return false;
    }

    // Check if email is verified
    if (!session.user.email_confirmed_at) {
      toast.error("Vérification email requise", {
        description: "Veuillez vérifier votre email avant de continuer",
        duration: 5000
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking email verification:", error);
    return false;
  }
};

export const enforceAccountSecurity = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return false;
    }

    // Check for suspicious login patterns
    const lastSignIn = new Date(session.user.last_sign_in_at || '');
    const now = new Date();
    const timeDiff = now.getTime() - lastSignIn.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);

    // If last login was more than 24 hours ago, require re-authentication for sensitive actions
    if (hoursDiff > 24) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking account security:", error);
    return true; // Allow by default if check fails
  }
};

export const validateSessionSecurity = async (): Promise<boolean> => {
  const emailVerified = await enforceEmailVerification();
  const accountSecure = await enforceAccountSecurity();
  
  return emailVerified && accountSecure;
};
