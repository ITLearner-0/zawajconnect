
import { supabase } from "@/integrations/supabase/client";
import { SignUpData } from "@/types/auth";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

// Remove the circular type reference by using a more direct type annotation
export const signUp = async (
  data: SignUpData, 
  t: ReturnType<typeof useTranslation>["t"]
) => {
  const { email, password, firstName, lastName, gender, waliName, waliRelationship, waliContact } = data;

  try {
    console.log("Starting signup process with:", { email, firstName, lastName, gender });
    
    // Check if user already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();
      
    if (checkError) {
      console.error("Error checking existing user:", checkError);
    }

    if (existingUsers) {
      toast(t("auth.emailAlreadyExists"), {
        description: t("auth.registrationError")
      });
      return false;
    }
    
    // Register the user
    const { data: userData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          gender: gender
        }
      }
    });

    if (error) {
      console.error("Signup error:", error);
      
      // More specific error messages
      if (error.message.includes("already registered")) {
        toast(t("auth.emailAlreadyExists"), {
          description: t("auth.registrationError")
        });
      } else {
        toast(error.message, {
          description: t("auth.registrationError")
        });
      }
      
      return false;
    }

    console.log("Signup successful, user data:", userData);

    // If registration successful and user provides gender info, save to profile
    if (userData.user) {
      console.log("Creating profile for user:", userData.user.id);
      
      // Create initial profile - use explicit type annotation to avoid deep nesting
      const profileData: Record<string, any> = {
        id: userData.user.id,
        first_name: firstName,
        last_name: lastName,
        gender: gender,
        birth_date: new Date().toISOString().split('T')[0], // Default to current date
        location: "Not specified", // Default value
        prayer_frequency: "Not specified", // Default value
        religious_practice_level: "Not specified", // Default value
        about_me: "", // Empty string for optional fields
        education_level: "",
        occupation: "",
        is_visible: true,
        privacy_settings: {
          profileVisibilityLevel: 1,
          showAge: true,
          showLocation: true,
          showOccupation: true,
          allowNonMatchMessages: true
        },
        email_verified: false,
        phone_verified: false,
        id_verified: false,
        wali_verified: false
      };

      // Add wali information for female users
      if (gender === "female") {
        profileData.wali_name = waliName || null;
        profileData.wali_relationship = waliRelationship || null;
        profileData.wali_contact = waliContact || null;
      } else {
        // For males, set wali fields to null
        profileData.wali_name = null;
        profileData.wali_relationship = null;
        profileData.wali_contact = null;
      }

      console.log("Inserting profile data:", profileData);

      // Create initial profile
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(profileData);

      if (profileError) {
        console.error("Error creating initial profile:", profileError);
        toast(profileError.message, {
          description: "Profile Creation Error"
        });
      } else {
        console.log("Profile created successfully");
      }
    }

    toast(t("auth.emailVerification"), {
      description: t("auth.success")
    });

    return true;
  } catch (error: any) {
    console.error("Authentication error:", error);
    toast(error.message, {
      description: "Error"
    });
    return false;
  }
};
