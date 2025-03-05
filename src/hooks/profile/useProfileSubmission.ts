
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProfileFormData, PrivacySettings } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';

export const useProfileSubmission = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const submitProfile = async (
    userId: string,
    profileData: ProfileFormData,
    privacySettings: PrivacySettings
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Submitting profile for user:", userId);
      console.log("Profile data:", profileData);
      
      // Extract first and last name from full name
      const nameParts = profileData.fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Handle birth date conversion if needed
      let birthDate = profileData.age;
      if (!birthDate.includes('-') && !isNaN(Number(birthDate))) {
        // If age is a number, convert to a birth year
        const currentYear = new Date().getFullYear();
        const birthYear = currentYear - parseInt(birthDate, 10);
        birthDate = `${birthYear}-01-01`; // Just year is stored
      }

      // Prepare update data
      const updateData = {
        first_name: firstName,
        last_name: lastName,
        birth_date: birthDate,
        gender: profileData.gender,
        location: profileData.location,
        education_level: profileData.education,
        occupation: profileData.occupation,
        religious_practice_level: profileData.religiousLevel,
        prayer_frequency: profileData.prayerFrequency,
        about_me: profileData.aboutMe,
        wali_name: profileData.waliName || null,
        wali_relationship: profileData.waliRelationship || null,
        wali_contact: profileData.waliContact || null,
        privacy_settings: privacySettings,
        is_visible: true // Default value
      };

      console.log("Update data:", updateData);
      
      // Update the profile
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        console.error("Error updating profile:", error);
        setError(error.message);
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      return true;
    } catch (err: any) {
      console.error("Unexpected error during profile update:", err);
      setError(err.message);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    submitProfile,
  };
};
