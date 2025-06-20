
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
    
    // Check if user already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", email)
      .maybeSingle();
      
    if (checkError) {
      console.error("Error checking existing user:", checkError);
    }

    if (existingUsers) {
      toast.error("Email déjà utilisé", {
        description: "Un compte existe déjà avec cette adresse email"
      });
      return false;
    }
    
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
      
      if (error.message.includes("already registered")) {
        toast.error("Email déjà utilisé", {
          description: "Un compte existe déjà avec cette adresse email"
        });
      } else {
        toast.error("Erreur d'inscription", {
          description: "Veuillez vérifier vos informations et réessayer"
        });
      }
      
      return false;
    }

    console.log("Signup successful, user data:", userData);

    if (userData.user) {
      console.log("Creating profile for user:", userData.user.id);
      
      // Extract first and last name from sanitized fullName
      const nameParts = (sanitizedData.fullName || fullName).split(' ');
      const sanitizedFirstName = nameParts[0] || firstName;
      const sanitizedLastName = nameParts.slice(1).join(' ') || lastName;
      
      // Create profile data object with sanitized input
      const profileInsert = {
        id: userData.user.id,
        first_name: sanitizedFirstName,
        last_name: sanitizedLastName,
        gender: gender || null,
        birth_date: new Date().toISOString().split('T')[0], 
        location: "Not specified",
        prayer_frequency: "Not specified", 
        religious_practice_level: "Not specified",
        about_me: "",
        education_level: "",
        occupation: "",
        is_visible: true,
        email_verified: false,
        phone_verified: false,
        id_verified: false,
        wali_verified: false,
        wali_name: gender === "female" ? (sanitizedData.waliName || null) : null,
        wali_relationship: gender === "female" ? (sanitizedData.waliRelationship || null) : null,
        wali_contact: gender === "female" ? (sanitizedData.waliContact || null) : null
      };
      
      console.log("Inserting profile data:", profileInsert);

      // Create initial profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert(profileInsert);

      if (profileError) {
        console.error("Error creating initial profile:", profileError);
        toast.error("Erreur de création du profil", {
          description: profileError.message
        });
      } else {
        console.log("Profile created successfully");
      }
    }

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
