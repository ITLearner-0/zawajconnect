
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

    // Sanitize input data
    const sanitizedData = sanitizeProfileData({
      firstName,
      lastName,
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
          first_name: sanitizedData.firstName,
          last_name: sanitizedData.lastName,
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
      
      // Create profile data object with sanitized input
      const profileInsert = {
        id: userData.user.id,
        first_name: sanitizedData.firstName || "",
        last_name: sanitizedData.lastName || "",
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

    toast.success("Inscription réussie", {
      description: "Veuillez vérifier votre email pour confirmer votre compte avant de vous connecter"
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
