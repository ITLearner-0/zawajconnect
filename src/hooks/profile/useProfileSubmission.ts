
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProfileFormData, PrivacySettings } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';
import { sanitizeProfileData } from '@/utils/security/inputSanitization';

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
      console.log("Début de la soumission du profil pour l'utilisateur:", userId);
      console.log("Données du profil avant sanitisation:", profileData);
      
      // Sanitize the profile data
      const sanitizedData = sanitizeProfileData(profileData);
      console.log("Données sanitisées:", sanitizedData);
      
      // Extract first and last name from full name
      const nameParts = (sanitizedData.fullName || profileData.fullName || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Handle birth date conversion - only process if age is provided and valid
      let birthDate = null;
      const ageValue = sanitizedData.age || profileData.age;
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

      // Prepare update data - include all provided fields
      const updateData: any = {
        first_name: firstName,
        last_name: lastName,
        privacy_settings: privacySettings,
        is_visible: true
      };

      // Add all other fields from sanitized data, falling back to original data
      if (birthDate) updateData.birth_date = birthDate;
      if (sanitizedData.gender || profileData.gender) updateData.gender = sanitizedData.gender || profileData.gender;
      if (sanitizedData.location || profileData.location) updateData.location = sanitizedData.location || profileData.location;
      if (sanitizedData.education || profileData.education) updateData.education_level = sanitizedData.education || profileData.education;
      if (sanitizedData.occupation || profileData.occupation) updateData.occupation = sanitizedData.occupation || profileData.occupation;
      if (sanitizedData.religiousLevel || profileData.religiousLevel) updateData.religious_practice_level = sanitizedData.religiousLevel || profileData.religiousLevel;
      if (sanitizedData.prayerFrequency || profileData.prayerFrequency) updateData.prayer_frequency = sanitizedData.prayerFrequency || profileData.prayerFrequency;
      if (sanitizedData.polygamyStance || profileData.polygamyStance) updateData.polygamy_stance = sanitizedData.polygamyStance || profileData.polygamyStance;
      if (sanitizedData.aboutMe || profileData.aboutMe) updateData.about_me = sanitizedData.aboutMe || profileData.aboutMe;
      if (sanitizedData.waliName || profileData.waliName) updateData.wali_name = sanitizedData.waliName || profileData.waliName;
      if (sanitizedData.waliRelationship || profileData.waliRelationship) updateData.wali_relationship = sanitizedData.waliRelationship || profileData.waliRelationship;
      if (sanitizedData.waliContact || profileData.waliContact) updateData.wali_contact = sanitizedData.waliContact || profileData.waliContact;

      console.log("Données de mise à jour finale:", updateData);
      
      // Update the profile
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        console.error("Erreur lors de la mise à jour du profil:", error);
        setError(error.message);
        toast({
          title: "Erreur",
          description: "Échec de la mise à jour du profil. Veuillez réessayer.",
          variant: "destructive",
        });
        return false;
      }

      console.log("Profil mis à jour avec succès");

      // Call the success callback to update the form data with original (non-sanitized) data
      // This ensures the user sees their original input
      if (onSuccess) {
        onSuccess(profileData);
      }

      toast({
        title: "Profil Mis à Jour",
        description: "Votre profil a été mis à jour avec succès.",
      });
      return true;
    } catch (err: any) {
      console.error("Erreur inattendue lors de la mise à jour du profil:", err);
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
