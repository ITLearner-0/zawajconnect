
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
    privacySettings: PrivacySettings,
    onSuccess?: (savedData: ProfileFormData) => void
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

      // Handle birth date conversion - only process if age is provided and valid
      let birthDate = null;
      if (profileData.age && profileData.age.trim() !== '') {
        if (profileData.age.includes('-')) {
          // If age is already a date format, use it directly
          birthDate = profileData.age;
        } else if (!isNaN(Number(profileData.age))) {
          // If age is a number, convert to a birth year
          const currentYear = new Date().getFullYear();
          const birthYear = currentYear - parseInt(profileData.age, 10);
          birthDate = `${birthYear}-01-01`;
        }
      }

      // Prepare update data - only include non-empty values
      const updateData: any = {
        first_name: firstName,
        last_name: lastName,
        privacy_settings: privacySettings,
        is_visible: true
      };

      // Only add fields that have values
      if (birthDate) updateData.birth_date = birthDate;
      if (profileData.gender) updateData.gender = profileData.gender;
      if (profileData.location) updateData.location = profileData.location;
      if (profileData.education) updateData.education_level = profileData.education;
      if (profileData.occupation) updateData.occupation = profileData.occupation;
      if (profileData.religiousLevel) updateData.religious_practice_level = profileData.religiousLevel;
      if (profileData.prayerFrequency) updateData.prayer_frequency = profileData.prayerFrequency;
      if (profileData.aboutMe) updateData.about_me = profileData.aboutMe;
      if (profileData.waliName) updateData.wali_name = profileData.waliName;
      if (profileData.waliRelationship) updateData.wali_relationship = profileData.waliRelationship;
      if (profileData.waliContact) updateData.wali_contact = profileData.waliContact;

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

      // Call the success callback to update the form data
      if (onSuccess) {
        onSuccess(profileData);
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
