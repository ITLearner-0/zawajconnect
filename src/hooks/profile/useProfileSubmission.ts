
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
      
      const gender = profileData.gender;
      if (gender && typeof gender === 'string' && gender.trim()) {
        updateData.gender = gender.trim();
      }
      
      const location = profileData.location;
      if (location && typeof location === 'string' && location.trim()) {
        updateData.location = location.trim();
      }
      
      const education = profileData.education;
      if (education && typeof education === 'string' && education.trim()) {
        updateData.education_level = education.trim();
      }
      
      const occupation = profileData.occupation;
      if (occupation && typeof occupation === 'string' && occupation.trim()) {
        updateData.occupation = occupation.trim();
      }
      
      const religiousLevel = profileData.religiousLevel;
      if (religiousLevel && typeof religiousLevel === 'string' && religiousLevel.trim()) {
        updateData.religious_practice_level = religiousLevel.trim();
      }
      
      const prayerFrequency = profileData.prayerFrequency;
      if (prayerFrequency && typeof prayerFrequency === 'string' && prayerFrequency.trim()) {
        updateData.prayer_frequency = prayerFrequency.trim();
      }
      
      const polygamyStance = profileData.polygamyStance;
      if (polygamyStance && typeof polygamyStance === 'string' && polygamyStance.trim()) {
        updateData.polygamy_stance = polygamyStance.trim();
      }
      
      const aboutMe = profileData.aboutMe;
      if (aboutMe && typeof aboutMe === 'string' && aboutMe.trim()) {
        updateData.about_me = aboutMe.trim();
      }
      
      const waliName = profileData.waliName;
      if (waliName && typeof waliName === 'string' && waliName.trim()) {
        updateData.wali_name = waliName.trim();
      }
      
      const waliRelationship = profileData.waliRelationship;
      if (waliRelationship && typeof waliRelationship === 'string' && waliRelationship.trim()) {
        updateData.wali_relationship = waliRelationship.trim();
      }
      
      const waliContact = profileData.waliContact;
      if (waliContact && typeof waliContact === 'string' && waliContact.trim()) {
        updateData.wali_contact = waliContact.trim();
      }
      
      const madhab = profileData.madhab;
      if (madhab && typeof madhab === 'string' && madhab.trim()) {
        updateData.madhab = madhab.trim();
      }
      
      // Handle arrays properly with proper type checking
      const languages = profileData.languages;
      if (languages) {
        if (typeof languages === 'string') {
          const languagesStr = languages as string;
          if (languagesStr.trim()) {
            updateData.languages = languagesStr.split(',').map(lang => lang.trim()).filter(lang => lang.length > 0);
          }
        } else if (Array.isArray(languages)) {
          updateData.languages = languages.filter(lang => lang && typeof lang === 'string' && lang.trim().length > 0);
        }
      }

      // Handle profile picture and gallery
      const profilePicture = profileData.profilePicture;
      if (profilePicture && typeof profilePicture === 'string') {
        updateData.profile_picture = profilePicture;
      }
      
      const gallery = profileData.gallery;
      if (gallery && Array.isArray(gallery)) {
        updateData.gallery = gallery.filter(url => url && typeof url === 'string' && url.trim().length > 0);
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
