
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProfileFormData, PrivacySettings } from "@/types/profile";
import { geocodeLocation } from "@/utils/locationUtils";
import { updateUserCoordinates } from "@/utils/profileUtils";

interface UseProfileSubmissionProps {
  formData: ProfileFormData;
  privacySettings: PrivacySettings;
  blockedUsers: string[];
  isAccountVisible: boolean;
}

export const useProfileSubmission = ({
  formData,
  privacySettings,
  blockedUsers,
  isAccountVisible
}: UseProfileSubmissionProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("No active session found");
      toast({
        title: "Error",
        description: "Please sign in to update your profile",
        variant: "destructive",
      });
      return;
    }

    if (formData.gender === "female" && (!formData.waliName || !formData.waliRelationship || !formData.waliContact)) {
      toast({
        title: "Wali Information Required",
        description: "As a female user, you must provide complete wali information.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    const [firstName, ...lastNameParts] = formData.fullName.split(" ");
    const lastName = lastNameParts.join(" ");

    // Ensure required columns exist
    try {
      await supabase.rpc('execute_sql', {
        sql_query: `
          ALTER TABLE profiles ADD COLUMN IF NOT EXISTS privacy_settings JSONB 
          DEFAULT '{"profileVisibilityLevel": 1, "showAge": true, "showLocation": true, "showOccupation": true, "allowNonMatchMessages": true}'::jsonb;
          
          ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;
          
          ALTER TABLE profiles ADD COLUMN IF NOT EXISTS blocked_users TEXT[] DEFAULT '{}'::text[];
        `
      });
    } catch (err) {
      console.error("Error ensuring columns exist:", err);
    }

    const profileData = {
      id: session.user.id,
      first_name: firstName,
      last_name: lastName,
      gender: formData.gender,
      location: formData.location,
      education_level: formData.education,
      occupation: formData.occupation,
      religious_practice_level: formData.religiousLevel,
      prayer_frequency: formData.prayerFrequency,
      about_me: formData.aboutMe,
      birth_date: formData.age ? new Date(new Date().getFullYear() - parseInt(formData.age), 0, 1).toISOString() : null,
      wali_name: formData.waliName || null,
      wali_relationship: formData.waliRelationship || null,
      wali_contact: formData.waliContact || null,
      privacy_settings: privacySettings,
      is_visible: isAccountVisible,
      blocked_users: blockedUsers,
    };

    console.log("Attempting to save profile with data:", profileData);

    const { error } = await supabase
      .from("profiles")
      .upsert(profileData);

    if (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    if (formData.location) {
      try {
        const locationData = await geocodeLocation(formData.location);
        
        if (locationData) {
          await updateUserCoordinates(
            session.user.id,
            locationData.latitude,
            locationData.longitude
          );
          
          console.log("Updated user coordinates:", locationData);
        }
      } catch (err) {
        console.error("Error updating coordinates:", err);
      }
    }

    console.log("Profile saved successfully");
    toast({
      title: "Success",
      description: "Profile updated successfully",
      duration: 3000,
    });
    
    navigate("/");
  };

  return {
    handleSubmit
  };
};
