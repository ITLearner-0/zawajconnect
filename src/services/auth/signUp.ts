
import { supabase } from "@/integrations/supabase/client";
import { SignUpData } from "@/types/auth";
import { toast } from "sonner";
import { sanitizeProfileData, validateEmail } from "@/utils/security/inputSanitization";

export const signUp = async (data: SignUpData, t: (key: string) => string) => {
  const { email, password, firstName, lastName, gender, waliName, waliRelationship, waliContact } = data;

  try {
    console.log("Starting signup process with:", { email, firstName, lastName, gender });
    
    // Validate email format
    if (!validateEmail(email)) {
      toast.error("Email invalide", {
        description: "Veuillez entrer une adresse email valide"
      });
      return false;
    }

    // Combine firstName and lastName into fullName for sanitization
    const fullName = `${firstName} ${lastName}`.trim();
    
    // Sanitize input data using the correct ProfileFormData structure
    const sanitizedData = sanitizeProfileData({
      fullName,
      waliName,
      waliRelationship,
      waliContact
    });
    
    // Register the user with proper redirect URL and email confirmation required
    const redirectUrl = `${window.location.origin}/profile`;
    
    const { data: userData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
          gender: gender
        }
      }
    });

    if (error) {
      console.error("Signup error:", error);
      
      if (error.message.includes("already registered") || error.message.includes("already exists")) {
        toast.error("Email déjà utilisé", {
          description: "Un compte existe déjà avec cette adresse email"
        });
      } else if (error.message.includes("rate limit") || error.code === "over_email_send_rate_limit") {
        toast.error("Limite de fréquence atteinte", {
          description: "Trop de tentatives d'inscription récentes. Veuillez attendre quelques minutes avant de réessayer."
        });
      } else {
        toast.error("Erreur d'inscription", {
          description: error.message || "Veuillez vérifier vos informations et réessayer"
        });
      }
      
      return false;
    }

    console.log("Signup successful, user data:", userData);

    // Show success messages only when signup actually succeeds
    if (userData?.user) {
      // Clear success message about account creation and email verification
      toast.success("🎉 Compte créé avec succès !", {
        description: "Votre compte a été créé. Un email de confirmation a été envoyé à votre adresse.",
        duration: 6000,
      });

      // Important follow-up message about email verification requirement
      setTimeout(() => {
        toast.info("📧 Vérification requise", {
          description: "Veuillez vérifier votre boîte email et cliquer sur le lien de confirmation pour activer votre compte. Vérifiez aussi vos spams si nécessaire.",
          duration: 10000,
        });
      }, 1500);
    }

    return true;
  } catch (error: any) {
    console.error("Authentication error:", error);
    toast.error("Erreur inattendue", {
      description: "Une erreur inattendue s'est produite. Veuillez réessayer."
    });
    return false;
  }
};
