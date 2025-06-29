
import { useState } from 'react';
import { ProfileFormData, PrivacySettings } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';
import { processFullName, processBirthDate, processLanguages, processGallery } from './utils/dataProcessing';
import { mapProfileDataToDatabase } from './utils/fieldMapping';
import { checkProfileExists, updateProfile, insertProfile } from './utils/databaseOperations';

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
      
      // Process name and birth date
      const { firstName, lastName } = processFullName(profileData.fullName);
      const birthDate = processBirthDate(profileData.age);

      // Prepare base update data
      const updateData = mapProfileDataToDatabase(
        userId,
        profileData,
        firstName,
        lastName,
        birthDate
      );

      // Add privacy settings
      updateData.privacy_settings = privacySettings || {
        profileVisibilityLevel: 1,
        showAge: true,
        showLocation: true,
        showOccupation: true,
        allowNonMatchMessages: true
      };

      // Process arrays and optional fields
      const processedLanguages = processLanguages(profileData.languages);
      if (processedLanguages) {
        updateData.languages = processedLanguages;
      }

      // Handle profile picture
      const profilePictureValue = profileData.profilePicture;
      if (profilePictureValue && typeof profilePictureValue === 'string') {
        updateData.profile_picture = profilePictureValue;
      }
      
      // Handle gallery
      const processedGallery = processGallery(profileData.gallery);
      if (processedGallery) {
        updateData.gallery = processedGallery;
      }

      console.log("Final update data:", updateData);
      
      // Check if profile exists and perform appropriate operation
      const existingProfile = await checkProfileExists(userId);
      
      let result;
      if (existingProfile) {
        result = await updateProfile(userId, updateData);
      } else {
        result = await insertProfile(updateData);
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
