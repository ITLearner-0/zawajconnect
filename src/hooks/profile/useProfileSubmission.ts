
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
    console.log("=== PROFILE SUBMISSION STARTED ===");
    console.log("User ID:", userId);
    console.log("Profile data:", JSON.stringify(profileData, null, 2));
    console.log("Privacy settings:", JSON.stringify(privacySettings, null, 2));

    if (!userId) {
      const errorMsg = "Identifiant utilisateur manquant. Veuillez vous reconnecter.";
      console.error("ERROR:", errorMsg);
      toast({
        title: "Erreur",
        description: errorMsg,
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("=== PROCESSING DATA ===");
      
      // Process name and birth date
      const { firstName, lastName } = processFullName(profileData.fullName);
      const birthDate = processBirthDate(profileData.age);
      
      console.log("Processed name:", { firstName, lastName });
      console.log("Processed birth date:", birthDate);

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

      // Process and add languages
      const processedLanguages = processLanguages(profileData.languages);
      if (processedLanguages.length > 0) {
        updateData.languages = processedLanguages;
      }

      // Handle profile picture
      if (profileData.profilePicture && typeof profileData.profilePicture === 'string') {
        const trimmedPicture = profileData.profilePicture.trim();
        if (trimmedPicture) {
          updateData.profile_picture = trimmedPicture;
        }
      }
      
      // Handle gallery
      const processedGallery = processGallery(profileData.gallery);
      if (processedGallery.length > 0) {
        updateData.gallery = processedGallery;
      }

      console.log("=== FINAL UPDATE DATA ===");
      console.log(JSON.stringify(updateData, null, 2));
      
      console.log("=== DATABASE OPERATIONS ===");
      
      // Check if profile exists and perform appropriate operation
      const existingProfile = await checkProfileExists(userId);
      
      let result;
      if (existingProfile) {
        result = await updateProfile(userId, updateData);
      } else {
        result = await insertProfile(updateData);
      }

      const { data, error: dbError } = result;

      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error(`Erreur de base de données: ${dbError.message}`);
      }

      if (!data) {
        throw new Error("Aucune donnée retournée après la sauvegarde");
      }

      console.log("=== PROFILE SAVED SUCCESSFULLY ===");
      console.log("Saved data:", JSON.stringify(data, null, 2));

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
      console.error("=== ERROR IN SUBMIT PROFILE ===");
      console.error("Error object:", err);
      console.error("Error message:", err?.message);
      console.error("Error stack:", err?.stack);
      
      const errorMessage = err?.message || "Une erreur inattendue s'est produite lors de la sauvegarde";
      setError(errorMessage);
      
      toast({
        title: "Erreur de Sauvegarde",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
      console.log("=== PROFILE SUBMISSION ENDED ===");
    }
  };

  return {
    isLoading,
    error,
    submitProfile,
  };
};
