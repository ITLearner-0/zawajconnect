
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
    console.log("submitProfile function called with:", {
      userId,
      profileData,
      privacySettings
    });

    setIsLoading(true);
    setError(null);

    try {
      console.log("Starting profile submission for user:", userId);
      console.log("Profile data:", profileData);
      
      // Extract first and last name from full name
      const nameParts = (profileData.fullName || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Handle birth date conversion - only process if age is provided and valid
      let birthDate = null;
      const ageValue = profileData.age;
      if (ageValue && ageValue.trim() !== '') {
        if (ageValue.includes('-')) {
          // If age is already a date format, use it directly
          birthDate = ageValue;
        } else if (!isNaN(Number(ageValue))) {
          // If age is a number, convert to a birth year
          const currentYear = new Date().getFullYear();
          const birthYear = currentYear - parseInt(ageValue, 10);
          birthDate = `${birthYear}-01-01`;
        }
      }

      // Prepare update data - allow all fields to be saved
      const updateData: any = {
        id: userId,
        first_name: firstName,
        last_name: lastName,
        privacy_settings: privacySettings,
        is_visible: true,
        updated_at: new Date().toISOString()
      };

      // Add all profile fields without strict validation
      if (birthDate) updateData.birth_date = birthDate;
      if (profileData.gender) updateData.gender = profileData.gender;
      if (profileData.location) updateData.location = profileData.location;
      if (profileData.education) updateData.education_level = profileData.education;
      if (profileData.occupation) updateData.occupation = profileData.occupation;
      if (profileData.religiousLevel) updateData.religious_practice_level = profileData.religiousLevel;
      if (profileData.prayerFrequency) updateData.prayer_frequency = profileData.prayerFrequency;
      if (profileData.polygamyStance) updateData.polygamy_stance = profileData.polygamyStance;
      if (profileData.aboutMe) updateData.about_me = profileData.aboutMe;
      if (profileData.waliName) updateData.wali_name = profileData.waliName;
      if (profileData.waliRelationship) updateData.wali_relationship = profileData.waliRelationship;
      if (profileData.waliContact) updateData.wali_contact = profileData.waliContact;
      if (profileData.madhab) updateData.madhab = profileData.madhab;
      
      // Handle languages with proper type checking
      if (profileData.languages) {
        // Cast to unknown first to handle the type issue, then check the actual type
        const languagesField = profileData.languages as unknown;
        if (typeof languagesField === 'string') {
          updateData.languages = (languagesField as string).split(',').map(lang => lang.trim());
        } else if (Array.isArray(languagesField)) {
          updateData.languages = languagesField as string[];
        }
      }

      // Handle profile picture and gallery
      if (profileData.profilePicture !== undefined) {
        updateData.profile_picture = profileData.profilePicture || null;
      }
      if (profileData.gallery !== undefined) {
        updateData.gallery = profileData.gallery || [];
      }

      console.log("Final update data:", updateData);
      
      // Update the profile using upsert to handle both insert and update cases
      const { data, error } = await supabase
        .from('profiles')
        .upsert(updateData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        console.error("Error updating profile:", error);
        setError(error.message);
        toast({
          title: "Erreur",
          description: "Échec de la mise à jour du profil. Veuillez réessayer.",
          variant: "destructive",
        });
        return false;
      }

      console.log("Profile updated successfully:", data);

      // Call the success callback with the original profile data to maintain form state
      if (onSuccess) {
        console.log("Calling onSuccess callback with profile data");
        onSuccess(profileData);
      }

      toast({
        title: "Profil Sauvegardé",
        description: "Votre profil a été sauvegardé avec succès.",
      });
      return true;
    } catch (err: any) {
      console.error("Unexpected error updating profile:", err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite. Veuillez réessayer.",
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
