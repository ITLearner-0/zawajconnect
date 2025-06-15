
import { supabase } from "@/integrations/supabase/client";
import { SignInData } from "@/types/auth";
import { toast } from "sonner";
import { enforceEmailVerification } from "./securityEnforcement";

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
      
      // Handle specific error cases - removed CAPTCHA bypass recommendation
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Email ou mot de passe incorrect", {
          description: "Veuillez vérifier vos identifiants"
        });
      } else if (error.message.includes("captcha verification process failed")) {
        toast.error("Erreur de vérification CAPTCHA", {
          description: "Trop de tentatives de connexion. Veuillez attendre quelques minutes et réessayer.",
          duration: 6000
        });
      } else if (error.message.includes("Email not confirmed")) {
        toast.error("Email non confirmé", {
          description: "Veuillez vérifier votre email pour confirmer votre compte"
        });
      } else if (error.message.includes("Too many requests")) {
        toast.error("Trop de tentatives", {
          description: "Veuillez attendre quelques minutes avant de réessayer"
        });
      } else {
        toast.error("Erreur de connexion", {
          description: "Échec de la connexion. Veuillez réessayer.",
          duration: 5000
        });
      }
      
      return false;
    }
    
    if (sessionData?.session && sessionData?.user) {
      console.log("Login successful");
      
      // Enforce email verification for new security policy
      const emailVerified = await enforceEmailVerification();
      if (!emailVerified) {
        // Sign out the user if email is not verified
        await supabase.auth.signOut();
        return false;
      }
      
      toast.success("Connexion réussie", {
        description: "Bienvenue !"
      });
      return true;
    } else {
      console.log("Login failed - no session or user data");
      toast.error("Échec de la connexion", {
        description: "Aucune session créée"
      });
      return false;
    }
  } catch (error: any) {
    console.error("Authentication error:", error);
    toast.error("Erreur inattendue", {
      description: "Veuillez réessayer ou contacter le support"
    });
    return false;
  }
};
