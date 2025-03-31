
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";

interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: string;
  waliName?: string;
  waliRelationship?: string;
  waliContact?: string;
}

interface SignInData {
  email: string;
  password: string;
}

// Define a simpler type for profile data to avoid recursive type definitions
interface ProfileData {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  birth_date: string;
  location: string;
  prayer_frequency: string;
  religious_practice_level: string;
  about_me: string;
  education_level: string;
  occupation: string;
  is_visible: boolean;
  privacy_settings: {
    profileVisibilityLevel: number;
    showAge: boolean;
    showLocation: boolean;
    showOccupation: boolean;
    allowNonMatchMessages: boolean;
    [key: string]: boolean | number;
  };
  email_verified: boolean;
  phone_verified: boolean;
  id_verified: boolean;
  wali_verified: boolean;
  wali_name?: string | null;
  wali_relationship?: string | null;
  wali_contact?: string | null;
  [key: string]: any; // Allow for additional properties without causing circular references
}

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const signUp = async (data: SignUpData) => {
    const { email, password, firstName, lastName, gender, waliName, waliRelationship, waliContact } = data;
    setLoading(true);

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
        toast({
          title: t("auth.registrationError"),
          description: t("auth.emailAlreadyExists"),
          variant: "destructive",
        });
        setLoading(false);
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
          toast({
            title: t("auth.registrationError"),
            description: t("auth.emailAlreadyExists"),
            variant: "destructive",
          });
        } else {
          toast({
            title: t("auth.registrationError"),
            description: error.message,
            variant: "destructive",
          });
        }
        
        setLoading(false);
        return false;
      }

      console.log("Signup successful, user data:", userData);

      // If registration successful and user provides gender info, save to profile
      if (userData.user) {
        console.log("Creating profile for user:", userData.user.id);
        
        // Create complete profile data with all required fields
        const profileData: ProfileData = {
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
          profileData.wali_name = waliName;
          profileData.wali_relationship = waliRelationship;
          profileData.wali_contact = waliContact;
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
          toast({
            title: "Profile Creation Error",
            description: profileError.message,
            variant: "destructive",
          });
        } else {
          console.log("Profile created successfully");
        }
      }

      toast({
        title: t("auth.success"),
        description: t("auth.emailVerification"),
      });

      setLoading(false);
      return true;
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return false;
    }
  };

  const signIn = async (data: SignInData) => {
    const { email, password } = data;
    setLoading(true);

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
          toast({
            title: t("auth.loginError"),
            description: t("auth.invalidCredentials"),
            variant: "destructive",
          });
        } else {
          toast({
            title: t("auth.loginError"),
            description: error.message,
            variant: "destructive",
          });
        }
        
        setLoading(false);
        return false;
      }
      
      console.log("Login successful, redirecting to profile");
      // Store session data
      console.log("Session data:", sessionData);
      
      navigate("/profile");
      setLoading(false);
      return true;
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return false;
    }
  };

  return {
    loading,
    signUp,
    signIn,
    setLoading
  };
};
