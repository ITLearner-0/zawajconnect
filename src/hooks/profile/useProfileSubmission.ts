import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProfileFormData, PrivacySettings } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';
import { executeSql } from '@/utils/database';

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
      // Convert age to birth_date (assuming age is provided in years)
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - parseInt(profileData.age, 10);
      const birthDate = `${birthYear}-01-01`; // Just year is stored

      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.fullName.split(' ')[0],
          last_name: profileData.fullName.split(' ').slice(1).join(' ') || '',
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
        })
        .eq('id', userId)
        .select();

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
