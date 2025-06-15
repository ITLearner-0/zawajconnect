
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
      
      // Handle specific error cases
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Email ou mot de passe incorrect", {
          description: "Veuillez vérifier vos identifiants"
        });
      } else if (error.message.includes("captcha verification process failed")) {
        toast.error("Problème de vérification", {
          description: "Veuillez réessayer dans quelques instants"
        });
      } else if (error.message.includes("Email not confirmed")) {
        toast.error("Email non confirmé", {
          description: "Veuillez vérifier votre email pour confirmer votre compte"
        });
      } else {
        toast.error("Erreur de connexion", {
          description: error.message
        });
      }
      
      return false;
    }
    
    console.log("Login successful");
    toast.success("Connexion réussie", {
      description: "Bienvenue !"
    });
    return true;
  } catch (error: any) {
    console.error("Authentication error:", error);
    toast.error("Erreur inattendue", {
      description: "Veuillez réessayer"
    });
    return false;
  }
};
