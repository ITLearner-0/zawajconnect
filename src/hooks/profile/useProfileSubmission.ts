
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

    if (!userId) {
      console.error("No user ID provided");
      toast({
        title: "Erreur",
        description: "Identifiant utilisateur manquant. Veuillez vous reconnecter.",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Starting profile submission for user:", userId);
      
      // Extract first and last name from full name with proper null checking
      const fullName = profileData.fullName || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Handle birth date conversion - only process if age is provided and valid
      let birthDate = null;
      const ageValue = profileData.age;
      if (ageValue && typeof ageValue === 'string' && ageValue.trim() !== '') {
        const trimmedAge = ageValue.trim();
        if (trimmedAge.includes('-')) {
          // If age is already a date format, use it directly
          birthDate = trimmedAge;
        } else if (!isNaN(Number(trimmedAge))) {
          // If age is a number, convert to a birth year
          const currentYear = new Date().getFullYear();
          const birthYear = currentYear - parseInt(trimmedAge, 10);
          birthDate = `${birthYear}-01-01`;
        }
      }

      // Prepare update data with proper validation
      const updateData: any = {
        id: userId,
        first_name: firstName || null,
        last_name: lastName || null,
        privacy_settings: privacySettings || {
          profileVisibilityLevel: 1,
          showAge: true,
          showLocation: true,
          showOccupation: true,
          allowNonMatchMessages: true
        },
        is_visible: true,
        updated_at: new Date().toISOString()
      };

      // Add fields only if they have valid values
      if (birthDate) updateData.birth_date = birthDate;
      if (profileData.gender && profileData.gender.trim()) updateData.gender = profileData.gender.trim();
      if (profileData.location && profileData.location.trim()) updateData.location = profileData.location.trim();
      if (profileData.education && profileData.education.trim()) updateData.education_level = profileData.education.trim();
      if (profileData.occupation && profileData.occupation.trim()) updateData.occupation = profileData.occupation.trim();
      if (profileData.religiousLevel && profileData.religiousLevel.trim()) updateData.religious_practice_level = profileData.religiousLevel.trim();
      if (profileData.prayerFrequency && profileData.prayerFrequency.trim()) updateData.prayer_frequency = profileData.prayerFrequency.trim();
      if (profileData.polygamyStance && profileData.polygamyStance.trim()) updateData.polygamy_stance = profileData.polygamyStance.trim();
      if (profileData.aboutMe && profileData.aboutMe.trim()) updateData.about_me = profileData.aboutMe.trim();
      if (profileData.waliName && profileData.waliName.trim()) updateData.wali_name = profileData.waliName.trim();
      if (profileData.waliRelationship && profileData.waliRelationship.trim()) updateData.wali_relationship = profileData.waliRelationship.trim();
      if (profileData.waliContact && profileData.waliContact.trim()) updateData.wali_contact = profileData.waliContact.trim();
      if (profileData.madhab && profileData.madhab.trim()) updateData.madhab = profileData.madhab.trim();
      
      // Handle arrays properly
      if (profileData.languages) {
        if (typeof profileData.languages === 'string') {
          updateData.languages = profileData.languages.split(',').map(lang => lang.trim()).filter(lang => lang.length > 0);
        } else if (Array.isArray(profileData.languages)) {
          updateData.languages = profileData.languages.filter(lang => lang && lang.trim().length > 0);
        }
      }

      // Handle profile picture and gallery
      if (profileData.profilePicture) {
        updateData.profile_picture = profileData.profilePicture;
      }
      if (profileData.gallery && Array.isArray(profileData.gallery)) {
        updateData.gallery = profileData.gallery.filter(url => url && url.trim().length > 0);
      }

      console.log("Final update data:", updateData);
      
      // First check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking existing profile:", checkError);
        throw new Error("Erreur lors de la vérification du profil existant");
      }

      let result;
      if (existingProfile) {
        // Update existing profile
        console.log("Updating existing profile");
        result = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId)
          .select()
          .single();
      } else {
        // Insert new profile
        console.log("Creating new profile");
        result = await supabase
          .from('profiles')
          .insert(updateData)
          .select()
          .single();
      }

      const { data, error } = result;

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Erreur de base de données: ${error.message}`);
      }

      if (!data) {
        throw new Error("Aucune donnée retournée après la sauvegarde");
      }

      console.log("Profile saved successfully:", data);

      // Call the success callback with the original profile data to maintain form state
      if (onSuccess) {
        console.log("Calling onSuccess callback");
        onSuccess(profileData);
      }

      toast({
        title: "Profil Sauvegardé",
        description: "Votre profil a été sauvegardé avec succès.",
      });
      
      return true;
    } catch (err: any) {
      console.error("Error in submitProfile:", err);
      const errorMessage = err.message || "Une erreur inattendue s'est produite";
      setError(errorMessage);
      
      toast({
        title: "Erreur de Sauvegarde",
        description: errorMessage,
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
