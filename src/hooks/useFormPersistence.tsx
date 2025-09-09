import { useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

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

interface UseFormPersistenceProps {
  profileData: ProfileData;
  islamicPrefs: IslamicPreferences;
  currentStep: number;
}

export const useFormPersistence = ({ 
  profileData, 
  islamicPrefs, 
  currentStep 
}: UseFormPersistenceProps) => {
  const { user } = useAuth();

  // Auto-save profile data to localStorage
  const saveProfileDraft = useCallback((data: ProfileData) => {
    if (!user) return;

    // Only save if there's meaningful data
    const hasData = data.full_name.length > 0 || 
                   data.age !== null || 
                   data.gender.length > 0 || 
                   data.location.length > 0;

    if (!hasData) return;

    try {
      const draftData = {
        ...data,
        userId: user.id,
        updated_at: new Date().toISOString()
      };

      localStorage.setItem(`onboarding_profile_${user.id}`, JSON.stringify(draftData));
      console.log('Profile draft saved to localStorage');
    } catch (error) {
      console.error('Error saving profile draft:', error);
    }
  }, [user]);

  // Auto-save Islamic preferences to localStorage
  const savePreferencesDraft = useCallback((prefs: IslamicPreferences) => {
    if (!user) return;

    // Only save if there's meaningful data
    const hasData = prefs.prayer_frequency.length > 0 || 
                   prefs.sect.length > 0 || 
                   prefs.importance_of_religion.length > 0;

    if (!hasData) return;

    try {
      const draftData = {
        ...prefs,
        userId: user.id,
        updated_at: new Date().toISOString()
      };

      localStorage.setItem(`onboarding_islamic_${user.id}`, JSON.stringify(draftData));
      console.log('Islamic preferences draft saved to localStorage');
    } catch (error) {
      console.error('Error saving preferences draft:', error);
    }
  }, [user]);

  // Load saved drafts from localStorage
  const loadDrafts = useCallback(() => {
    if (!user) return { profileDraft: null, preferencesDraft: null };

    try {
      const profileDraft = localStorage.getItem(`onboarding_profile_${user.id}`);
      const preferencesDraft = localStorage.getItem(`onboarding_islamic_${user.id}`);

      return {
        profileDraft: profileDraft ? JSON.parse(profileDraft) : null,
        preferencesDraft: preferencesDraft ? JSON.parse(preferencesDraft) : null
      };
    } catch (error) {
      console.error('Error loading drafts:', error);
      return { profileDraft: null, preferencesDraft: null };
    }
  }, [user]);

  // Clear drafts when onboarding is completed
  const clearDrafts = useCallback(() => {
    if (!user) return;

    try {
      localStorage.removeItem(`onboarding_profile_${user.id}`);
      localStorage.removeItem(`onboarding_islamic_${user.id}`);
      localStorage.removeItem(`onboarding_step_${user.id}`);
      console.log('Drafts cleared successfully');
    } catch (error) {
      console.error('Error clearing drafts:', error);
    }
  }, [user]);

  // Save step progress to localStorage
  const saveStepProgress = useCallback((step: number) => {
    if (!user) return;

    try {
      const progressData = {
        userId: user.id,
        currentStep: step,
        updated_at: new Date().toISOString()
      };

      localStorage.setItem(`onboarding_step_${user.id}`, JSON.stringify(progressData));
    } catch (error) {
      console.error('Error saving step progress:', error);
    }
  }, [user]);

  // Auto-save effect with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveProfileDraft(profileData);
    }, 2000); // Save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [profileData, saveProfileDraft]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      savePreferencesDraft(islamicPrefs);
    }, 2000); // Save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [islamicPrefs, savePreferencesDraft]);

  // Save step progress when step changes
  useEffect(() => {
    if (currentStep > 0) {
      saveStepProgress(currentStep);
    }
  }, [currentStep, saveStepProgress]);

  return {
    loadDrafts,
    clearDrafts,
    saveProfileDraft,
    savePreferencesDraft,
    saveStepProgress
  };
};