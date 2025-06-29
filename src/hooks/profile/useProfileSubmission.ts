
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
      
      // Process name and birth date with better error handling
      let firstName = '', lastName = '', birthDate = null;
      
      try {
        const nameResult = processFullName(profileData.fullName);
        firstName = nameResult.firstName;
        lastName = nameResult.lastName;
        console.log("Processed name:", { firstName, lastName });
      } catch (nameError) {
        console.error("Error processing name:", nameError);
        // Continue with empty names rather than failing
      }

      try {
        birthDate = processBirthDate(profileData.age);
        console.log("Processed birth date:", birthDate);
      } catch (dateError) {
        console.error("Error processing birth date:", dateError);
        // Continue with null birth date
      }

      // Prepare base update data with safer processing
      let updateData;
      try {
        updateData = mapProfileDataToDatabase(
          userId,
          profileData,
          firstName,
          lastName,
          birthDate
        );
        console.log("Base update data created successfully");
      } catch (mappingError) {
        console.error("Error mapping profile data:", mappingError);
        throw new Error(`Erreur lors du mapping des données: ${mappingError instanceof Error ? mappingError.message : 'Erreur inconnue'}`);
      }

      // Add privacy settings with fallback
      updateData.privacy_settings = privacySettings || {
        profileVisibilityLevel: 1,
        showAge: true,
        showLocation: true,
        showOccupation: true,
        allowNonMatchMessages: true
      };

      // Process languages with better error handling
      try {
        const processedLanguages = processLanguages(profileData.languages);
        if (processedLanguages && processedLanguages.length > 0) {
          updateData.languages = processedLanguages;
          console.log("Languages processed:", processedLanguages);
        }
      } catch (langError) {
        console.error("Error processing languages (continuing without):", langError);
        // Continue without languages rather than failing
      }

      // Handle profile picture safely
      try {
        if (profileData.profilePicture && typeof profileData.profilePicture === 'string') {
          const trimmedPicture = profileData.profilePicture.trim();
          if (trimmedPicture) {
            updateData.profile_picture = trimmedPicture;
            console.log("Profile picture added");
          }
        }
      } catch (picError) {
        console.error("Error processing profile picture (continuing without):", picError);
      }
      
      // Handle gallery safely
      try {
        const processedGallery = processGallery(profileData.gallery);
        if (processedGallery && processedGallery.length > 0) {
          updateData.gallery = processedGallery;
          console.log("Gallery processed:", processedGallery.length, "items");
        }
      } catch (galleryError) {
        console.error("Error processing gallery (continuing without):", galleryError);
      }

      console.log("=== FINAL UPDATE DATA ===");
      console.log(JSON.stringify(updateData, null, 2));
      
      console.log("=== DATABASE OPERATIONS ===");
      
      // Check if profile exists with better error handling
      let existingProfile;
      try {
        existingProfile = await checkProfileExists(userId);
        console.log("Profile existence check completed:", !!existingProfile);
      } catch (checkError) {
        console.error("Error checking profile existence:", checkError);
        // Try to continue by assuming it's a new profile
        existingProfile = null;
      }
      
      let result;
      try {
        if (existingProfile) {
          console.log("Updating existing profile...");
          result = await updateProfile(userId, updateData);
        } else {
          console.log("Creating new profile...");
          result = await insertProfile(updateData);
        }
      } catch (dbError) {
        console.error("Database operation failed:", dbError);
        throw new Error(`Erreur lors de l'opération base de données: ${dbError instanceof Error ? dbError.message : 'Erreur inconnue'}`);
      }

      const { data, error: dbError } = result;

      if (dbError) {
        console.error("Database returned error:", dbError);
        throw new Error(`Erreur de base de données: ${dbError.message || 'Erreur inconnue'}`);
      }

      if (!data) {
        console.error("No data returned from database operation");
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
      
      // More specific error messages
      let errorMessage = "Une erreur inattendue s'est produite lors de la sauvegarde";
      
      if (err?.message) {
        if (err.message.includes('JWT')) {
          errorMessage = "Session expirée. Veuillez vous reconnecter.";
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = "Problème de connexion. Vérifiez votre connexion internet.";
        } else if (err.message.includes('validation') || err.message.includes('required')) {
          errorMessage = "Données du profil invalides. Vérifiez les champs obligatoires.";
        } else {
          errorMessage = err.message;
        }
      }
      
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
