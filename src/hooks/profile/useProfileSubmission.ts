
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
        if (typeof trimmedAge === 'string' && trimmedAge.includes('-')) {
          // If age is already a date format, use it directly
          birthDate = trimmedAge;
        } else if (typeof trimmedAge === 'string' && !isNaN(Number(trimmedAge))) {
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

      // Add fields only if they have valid values with proper type checking
      if (birthDate) updateData.birth_date = birthDate;
      
      // Handle string fields with explicit type checking
      const stringFields = [
        'gender', 'location', 'education', 'occupation', 'religiousLevel', 
        'prayerFrequency', 'polygamyStance', 'aboutMe', 'waliName', 
        'waliRelationship', 'waliContact', 'madhab'
      ] as const;

      stringFields.forEach(field => {
        const value = profileData[field as keyof ProfileFormData];
        if (value && typeof value === 'string' && value.trim()) {
          const dbField = getDbFieldName(field);
          updateData[dbField] = value.trim();
        }
      });

      // Handle arrays properly with explicit type checking
      const languagesValue = profileData.languages;
      if (languagesValue) {
        if (typeof languagesValue === 'string') {
          const trimmedLanguages = languagesValue.trim();
          if (trimmedLanguages) {
            updateData.languages = trimmedLanguages.split(',').map((lang: string) => lang.trim()).filter((lang: string) => lang.length > 0);
          }
        } else if (Array.isArray(languagesValue)) {
          updateData.languages = languagesValue.filter((lang: unknown): lang is string => {
            return lang != null && typeof lang === 'string' && lang.trim().length > 0;
          });
        }
      }

      // Handle profile picture and gallery
      const profilePictureValue = profileData.profilePicture;
      if (profilePictureValue && typeof profilePictureValue === 'string') {
        updateData.profile_picture = profilePictureValue;
      }
      
      const galleryValue = profileData.gallery;
      if (galleryValue && Array.isArray(galleryValue)) {
        updateData.gallery = galleryValue.filter((url: unknown): url is string => {
          return url != null && typeof url === 'string' && url.trim().length > 0;
        });
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

  // Helper function to map form field names to database field names
  const getDbFieldName = (field: string): string => {
    const fieldMap: Record<string, string> = {
      gender: 'gender',
      location: 'location',
      education: 'education_level',
      occupation: 'occupation',
      religiousLevel: 'religious_practice_level',
      prayerFrequency: 'prayer_frequency',
      polygamyStance: 'polygamy_stance',
      aboutMe: 'about_me',
      waliName: 'wali_name',
      waliRelationship: 'wali_relationship',
      waliContact: 'wali_contact',
      madhab: 'madhab'
    };
    return fieldMap[field] || field;
  };

  return {
    isLoading,
    error,
    submitProfile,
  };
};
