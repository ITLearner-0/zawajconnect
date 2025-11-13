
import { useState } from 'react';
import { ProfileFormData, PrivacySettings } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';
import { processFullName, processBirthDate, processGallery } from './utils/dataProcessing';
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

    // Validate essential fields
    if (!profileData.fullName || !profileData.fullName.trim()) {
      const errorMsg = "Le nom complet est requis pour sauvegarder le profil.";
      console.error("ERROR:", errorMsg);
      toast({
        title: "Erreur de Validation",
        description: errorMsg,
        variant: "destructive",
      });
      return false;
    }

    if (!profileData.age || !profileData.age.trim()) {
      const errorMsg = "L'âge est requis pour sauvegarder le profil.";
      console.error("ERROR:", errorMsg);
      toast({
        title: "Erreur de Validation",
        description: errorMsg,
        variant: "destructive",
      });
      return false;
    }

    if (!profileData.gender || !profileData.gender.trim()) {
      const errorMsg = "Le genre est requis pour sauvegarder le profil.";
      console.error("ERROR:", errorMsg);
      toast({
        title: "Erreur de Validation",
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
      const nameResult = processFullName(profileData.fullName);
      const birthDate = processBirthDate(profileData.age);
      
      console.log("Processed name:", nameResult);
      console.log("Processed birth date:", birthDate);

      // Prepare base update data
      const updateData = mapProfileDataToDatabase(
        userId,
        profileData,
        nameResult.firstName,
        nameResult.lastName,
        birthDate
      );

      // Add privacy settings
      updateData.privacy_settings = privacySettings;

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
      
      // Check if profile exists
      const existingProfile = await checkProfileExists(userId);
      console.log("Profile exists:", !!existingProfile);
      
      let result;
      if (existingProfile) {
        console.log("Updating existing profile...");
        result = await updateProfile(userId, updateData);
      } else {
        console.log("Creating new profile...");
        result = await insertProfile(updateData);
      }

      const { data, error: dbError } = result;

      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error(`Erreur de base de données: ${(dbError as any).message}`);
      }

      if (!data) {
        console.error("No data returned from database");
        throw new Error("Aucune donnée retournée après la sauvegarde");
      }

      console.log("=== PROFILE SAVED SUCCESSFULLY ===");
      console.log("Saved data:", JSON.stringify(data, null, 2));

      if (onSuccess) {
        onSuccess(profileData);
      }

      toast({
        title: "Profil Sauvegardé",
        description: "Votre profil a été sauvegardé avec succès.",
      });
      
      return true;

    } catch (err: any) {
      console.error("=== ERROR IN SUBMIT PROFILE ===");
      console.error("Error:", err);
      
      let errorMessage = "Une erreur s'est produite lors de la sauvegarde";
      
      if (err?.message) {
        if (err.message.includes('JWT') || err.message.includes('session')) {
          errorMessage = "Session expirée. Veuillez vous reconnecter.";
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = "Problème de connexion. Vérifiez votre connexion internet.";
        } else if (err.message.includes('validation')) {
          errorMessage = "Certains champs ne sont pas valides. Veuillez vérifier vos données.";
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
