import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  full_name: string;
  age: number | null;
  gender: string;
  location: string;
  education: string;
  profession: string;
  bio: string;
  looking_for: string;
  interests: string[];
  avatar_url: string;
}

interface IslamicPreferences {
  prayer_frequency: string;
  quran_reading: string;
  hijab_preference: string;
  beard_preference: string;
  sect: string;
  madhab: string;
  halal_diet: boolean;
  smoking: string;
  desired_partner_sect: string;
  importance_of_religion: string;
}

export const useProfileSave = () => {
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const saveProfile = async (profileData: ProfileData, islamicPrefs: IslamicPreferences) => {
    if (!user) {
      console.error('❌ No authenticated user found');
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour sauvegarder votre profil.",
        variant: "destructive"
      });
      return { success: false, error: 'User not authenticated' };
    }
    
    console.log('✅ Authenticated user:', user.id);
    console.log('📊 Profile data to save:', { ...profileData, user_id: user.id });

    setSaving(true);

    try {
      // Debug log the exact data being sent to database
      const profileUpdateData = {
        user_id: user.id,
        full_name: profileData.full_name,
        age: profileData.age,
        gender: profileData.gender,
        location: profileData.location,
        education: profileData.education,
        profession: profileData.profession,
        bio: profileData.bio,
        looking_for: profileData.looking_for,
        interests: profileData.interests,
        avatar_url: profileData.avatar_url,
        updated_at: new Date().toISOString()
      };
      
      // Debug gender value specifically
      console.log('Raw gender value:', JSON.stringify(profileUpdateData.gender));
      console.log('Gender type:', typeof profileUpdateData.gender);
      console.log('Gender length:', profileUpdateData.gender?.length);
      console.log('Gender char codes:', profileUpdateData.gender?.split('').map(c => c.charCodeAt(0)));
      
      // Validate gender exists (database constraint will handle case/whitespace)
      if (!profileUpdateData.gender || profileUpdateData.gender.trim().length === 0) {
        throw new Error(`Gender value is required.`);
      }
      
      console.log('Sending to database:', JSON.stringify(profileUpdateData, null, 2));
      
      // Check if user is still authenticated before database operation
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Session expired. Please log in again.');
      }
      
      console.log('✅ Session valid, proceeding with upsert...');
      
      // 1. Save basic profile using UPSERT to avoid conflicts
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileUpdateData, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (profileError) {
        console.error('Profile save error:', profileError);
        throw profileError;
      }

    // Validate Islamic preferences before saving - matches database constraints exactly
    const validateIslamicPrefs = (prefs: any) => {
      // These values MUST match the CHECK constraints in the database
      const validSects = ['sunni', 'shia', 'other', 'prefer_not_to_say'];
      const validPrayerFreqs = ['5_times_daily', 'often', 'sometimes', 'fridays_only', 'occasionally', 'rarely', 'never'];
      const validImportance = ['very_important', 'important', 'somewhat_important', 'not_important', 'extremely_important'];
      const validQuranReading = ['daily', 'weekly', 'monthly', 'occasionally', 'rarely', 'learning'];
      const validHijab = ['always', 'most_times', 'sometimes', 'never', 'not_applicable', 'yes', 'no', 'prefer_not_to_say'];
      const validBeard = ['full_beard', 'trimmed_beard', 'goatee', 'mustache_only', 'clean_shaven', 'not_applicable', 'yes', 'no', 'sometimes', 'prefer_not_to_say'];
      const validMadhab = ['hanafi', 'maliki', 'shafii', 'hanbali', 'salafi', 'other', 'none', 'prefer_not_to_say'];
      const validSmoking = ['never', 'occasionally', 'regularly', 'trying_to_quit'];
      const validDesiredPartnerSect = ['same_sect', 'sunni', 'shia', 'any', 'other', 'open_discussion'];
      
      // Log validation for debugging
      console.log('Validating Islamic preferences:', prefs);
      
      const validated = {
        prayer_frequency: validPrayerFreqs.includes(prefs.prayer_frequency) ? prefs.prayer_frequency : null,
        quran_reading: validQuranReading.includes(prefs.quran_reading) ? prefs.quran_reading : null,
        hijab_preference: validHijab.includes(prefs.hijab_preference) ? prefs.hijab_preference : null,
        beard_preference: validBeard.includes(prefs.beard_preference) ? prefs.beard_preference : null,
        sect: validSects.includes(prefs.sect) ? prefs.sect : null,
        madhab: validMadhab.includes(prefs.madhab) ? prefs.madhab : null,
        halal_diet: prefs.halal_diet ?? true,
        smoking: validSmoking.includes(prefs.smoking) ? prefs.smoking : null,
        desired_partner_sect: validDesiredPartnerSect.includes(prefs.desired_partner_sect) ? prefs.desired_partner_sect : null,
        importance_of_religion: validImportance.includes(prefs.importance_of_religion) ? prefs.importance_of_religion : null,
      };
      
      console.log('Validated Islamic preferences:', validated);
      return validated;
    };

    const validatedPrefs = validateIslamicPrefs(islamicPrefs);
    
    // 2. Save Islamic preferences - Clean data before saving
    const cleanIslamicPrefs = {
      user_id: user.id,
      prayer_frequency: validatedPrefs.prayer_frequency || null,
      quran_reading: validatedPrefs.quran_reading || null,
      hijab_preference: validatedPrefs.hijab_preference || null,
      beard_preference: validatedPrefs.beard_preference || null,
      sect: validatedPrefs.sect || null,
      madhab: validatedPrefs.madhab || null,
      halal_diet: validatedPrefs.halal_diet ?? true,
      smoking: validatedPrefs.smoking || null,
      desired_partner_sect: validatedPrefs.desired_partner_sect || null,
      importance_of_religion: validatedPrefs.importance_of_religion || null,
      updated_at: new Date().toISOString()
    };

      const { error: prefsError } = await supabase
        .from('islamic_preferences')
        .upsert(cleanIslamicPrefs);

      if (prefsError) {
        console.error('Islamic preferences save error:', prefsError);
        console.error('Error details:', {
          message: prefsError.message,
          details: prefsError.details,
          hint: prefsError.hint,
          code: prefsError.code
        });
        
        // Show user-friendly error message
        const errorMessage = prefsError.message.includes('check constraint')
          ? 'Certaines préférences islamiques contiennent des valeurs invalides. Veuillez vérifier vos sélections.'
          : `Erreur lors de la sauvegarde des préférences islamiques: ${prefsError.message}`;
        
        throw new Error(errorMessage);
      }

      console.log('✅ Profile and Islamic preferences saved successfully');
      console.log('⚡ All other settings handled automatically by database triggers');

      toast({
        title: "Profil sauvegardé !",
        description: "Votre profil a été créé avec succès. Bienvenue sur notre plateforme !",
        variant: "default"
      });

      return { success: true };

    } catch (error: any) {
      console.error('Save profile error:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la sauvegarde de votre profil.';
      
      if (error.code === '23505') {
        errorMessage = 'Ce profil existe déjà. Mise à jour en cours...';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet.';
      }

      toast({
        title: "Erreur de sauvegarde",
        description: errorMessage,
        variant: "destructive"
      });

      return { success: false, error: error.message };
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          upsert: true, // Replace existing file
          contentType: file.type
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      return { success: true, url: data.publicUrl };

    } catch (error: any) {
      console.error('Avatar upload error:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    saveProfile,
    uploadAvatar,
    saving
  };
};