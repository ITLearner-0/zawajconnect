
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
      } else if (error.message.includes("rate limit")) {
        toast.error("Limite de fréquence atteinte", {
          description: "Trop de tentatives d'inscription. Veuillez attendre quelques minutes avant de réessayer."
        });
      } else {
        toast.error("Erreur d'inscription", {
          description: "Veuillez vérifier vos informations et réessayer"
        });
      }
      
      return false;
    }

    console.log("Signup successful, user data:", userData);

    // The profile will be automatically created by the handle_new_user trigger
    // We don't need to manually create it here since the trigger handles it

    // Enhanced success message with clear email verification instructions
    toast.success("Compte créé avec succès !", {
      description: "Un email de validation vient d'être envoyé à votre adresse. Veuillez vérifier votre boîte de réception et cliquer sur le lien de confirmation pour activer votre compte.",
      duration: 8000, // Show longer to ensure user reads it
    });

    // Additional info toast for clarity
    setTimeout(() => {
      toast.info("Vérification requise", {
        description: "Vous devez confirmer votre email avant de pouvoir vous connecter. Vérifiez aussi vos spams si vous ne trouvez pas l'email.",
        duration: 10000,
      });
    }, 2000);

    return true;
  } catch (error: any) {
    console.error("Authentication error:", error);
    toast.error("Erreur inattendue", {
      description: "Veuillez réessayer"
    });
    return false;
  }
};
