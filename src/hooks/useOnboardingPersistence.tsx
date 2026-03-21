/**
 * Unified Onboarding Persistence Hook
 *
 * Replaces useFormAutoSave, useEmergencyBackup, and useFormPersistence
 * with a single optimized hook featuring:
 * - 1.5s debounce for optimal performance
 * - Dual storage: localStorage + Supabase
 * - Intelligent restoration: DB > Emergency localStorage > Standard localStorage
 * - Visual status indicator integration
 * - Automatic cleanup of old data
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface ProfileData {
  full_name: string;
  age: number | undefined;
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

interface SavedData {
  profileData: ProfileData;
  islamicPrefs: IslamicPreferences;
  currentStep: number;
  skippedSections?: string[];
  timestamp: string;
  sessionId: string;
}

interface UseOnboardingPersistenceProps {
  profileData: ProfileData;
  islamicPrefs: IslamicPreferences;
  currentStep: number;
  skippedSections?: string[];
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export const useOnboardingPersistence = ({
  profileData,
  islamicPrefs,
  currentStep,
  skippedSections = [],
}: UseOnboardingPersistenceProps) => {
  const { user } = useAuth();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const lastSavedDataRef = useRef<string>('');
  const sessionIdRef = useRef<string>('');

  // Debounce data for auto-save (1.5s as requested)
  const debouncedProfileData = useDebounce(profileData, 1500);
  const debouncedIslamicPrefs = useDebounce(islamicPrefs, 1500);
  const debouncedStep = useDebounce(currentStep, 1500);
  const debouncedSkippedSections = useDebounce(skippedSections, 1500);

  // Generate or retrieve session ID
  const getSessionId = useCallback(() => {
    if (sessionIdRef.current) return sessionIdRef.current;

    const existing = sessionStorage.getItem('onboarding_session_id');
    if (existing) {
      sessionIdRef.current = existing;
      return existing;
    }

    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('onboarding_session_id', newSessionId);
    sessionIdRef.current = newSessionId;
    return newSessionId;
  }, []);

  /**
   * Save to localStorage (standard + emergency backup)
   */
  const saveToLocalStorage = useCallback(
    async (data: SavedData) => {
      if (!user) return false;

      try {
        const standardKey = `onboarding_data_${user.id}`;
        const emergencyKey = `emergency_onboarding_${getSessionId()}`;
        const emailKey = `emergency_onboarding_${user.email?.replace('@', '_')}`;

        localStorage.setItem(standardKey, JSON.stringify(data));
        localStorage.setItem(emergencyKey, JSON.stringify(data));
        localStorage.setItem(emailKey, JSON.stringify(data));
        // Also save to the key that OnboardingCompletionGuide checks
        localStorage.setItem('onboarding_progress', JSON.stringify(data));

        logger.log('Saved to localStorage', standardKey);
        return true;
      } catch (error) {
        logger.error('Failed to save to localStorage', error);
        return false;
      }
    },
    [user, getSessionId]
  );

  /**
   * Save to Supabase database
   */
  const saveToDatabase = useCallback(
    async (data: SavedData) => {
      if (!user) return false;

      try {
        // Save profile data
        if (data.profileData.full_name) {
          const { error: profileError } = await supabase.from('profiles').upsert(
            {
              user_id: user.id,
              ...data.profileData,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'user_id',
              ignoreDuplicates: false,
            }
          );

          if (profileError) throw profileError;
        }

        // Save Islamic preferences
        if (data.islamicPrefs.prayer_frequency) {
          const { error: prefsError } = await supabase.from('islamic_preferences').upsert(
            {
              user_id: user.id,
              ...data.islamicPrefs,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'user_id',
              ignoreDuplicates: false,
            }
          );

          if (prefsError) throw prefsError;
        }

        logger.log('Saved to Supabase');
        return true;
      } catch (error) {
        logger.error('Failed to save to Supabase', error);
        return false;
      }
    },
    [user]
  );

  /**
   * Main save function
   */
  const save = useCallback(
    async (skipDebounce = false) => {
      if (!user) return;

      const dataToSave = skipDebounce
        ? { profileData, islamicPrefs, currentStep, skippedSections }
        : {
            profileData: debouncedProfileData,
            islamicPrefs: debouncedIslamicPrefs,
            currentStep: debouncedStep,
            skippedSections: debouncedSkippedSections,
          };

      // Check if data actually changed
      const serialized = JSON.stringify(dataToSave);
      if (serialized === lastSavedDataRef.current) return;

      const savedData: SavedData = {
        ...dataToSave,
        timestamp: new Date().toISOString(),
        sessionId: getSessionId(),
      };

      setSaveStatus('saving');
      window.dispatchEvent(new CustomEvent('onboarding:save:start'));

      try {
        // Save to both localStorage and database in parallel
        const [localSuccess, dbSuccess] = await Promise.all([
          saveToLocalStorage(savedData),
          saveToDatabase(savedData),
        ]);

        if (localSuccess || dbSuccess) {
          lastSavedDataRef.current = serialized;
          setLastSaveTime(new Date());
          setSaveStatus('saved');
          window.dispatchEvent(new CustomEvent('onboarding:save:success'));

          // Reset to idle after 2 seconds
          setTimeout(() => setSaveStatus('idle'), 2000);
        } else {
          throw new Error('All save operations failed');
        }
      } catch (error) {
        logger.error('Save failed', error);
        setSaveStatus('error');
        window.dispatchEvent(new CustomEvent('onboarding:save:error'));

        // Reset to idle after 3 seconds
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    },
    [
      user,
      profileData,
      islamicPrefs,
      currentStep,
      skippedSections,
      debouncedProfileData,
      debouncedIslamicPrefs,
      debouncedStep,
      debouncedSkippedSections,
      getSessionId,
      saveToLocalStorage,
      saveToDatabase,
    ]
  );

  /**
   * Intelligent restore with priority: DB > Emergency > Standard
   */
  const restore = useCallback(async (): Promise<Partial<SavedData> | null> => {
    if (!user) return null;

    try {
      // Check if already restored in this session
      const restoredKey = 'onboarding_restored';
      if (sessionStorage.getItem(restoredKey)) {
        logger.log('Already restored in this session');
        return null;
      }

      // Priority 1: Try database first
      const [profileResult, prefsResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('islamic_preferences').select('*').eq('user_id', user.id).single(),
      ]);

      if (profileResult.data || prefsResult.data) {
        logger.log('Restored from database');
        sessionStorage.setItem(restoredKey, 'true');

        return {
          profileData: profileResult.data as any,
          islamicPrefs: prefsResult.data as any,
          currentStep: 0, // Will be overridden by localStorage step if available
          skippedSections: [],
        };
      }

      // Priority 2: Try emergency localStorage keys
      const sessionId = getSessionId();
      const emergencyKeys = [
        `emergency_onboarding_${sessionId}`,
        `emergency_onboarding_${user.email?.replace('@', '_')}`,
        `emergency_onboarding_${new Date().toISOString().split('T')[0]}`,
      ];

      for (const key of emergencyKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data) as SavedData;

          // Check if data is recent (within 24 hours)
          const timestamp = new Date(parsed.timestamp);
          if (Date.now() - timestamp.getTime() < 24 * 60 * 60 * 1000) {
            logger.log('Restored from emergency backup', key);
            sessionStorage.setItem(restoredKey, 'true');
            return parsed;
          }
        }
      }

      // Priority 3: Try standard localStorage
      const standardKey = `onboarding_data_${user.id}`;
      const standardData = localStorage.getItem(standardKey);
      if (standardData) {
        const parsed = JSON.parse(standardData) as SavedData;

        // Check if data is recent (within 7 days)
        const timestamp = new Date(parsed.timestamp);
        if (Date.now() - timestamp.getTime() < 7 * 24 * 60 * 60 * 1000) {
          logger.log('Restored from standard localStorage');
          sessionStorage.setItem(restoredKey, 'true');
          return parsed;
        }
      }

      logger.log('No saved data found');
      return null;
    } catch (error) {
      logger.error('Failed to restore data', error);
      return null;
    }
  }, [user, getSessionId]);

  /**
   * Clear all saved data
   */
  const clearAll = useCallback(() => {
    if (!user) return;

    try {
      // Clear localStorage
      const keysToRemove = Object.keys(localStorage).filter(
        (key) => key.includes('onboarding') || key.includes('emergency')
      );
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      // Clear session storage
      sessionStorage.removeItem('onboarding_session_id');
      sessionStorage.removeItem('onboarding_restored');

      // Reset refs
      lastSavedDataRef.current = '';
      sessionIdRef.current = '';
      setLastSaveTime(null);
      setSaveStatus('idle');

      logger.log('Cleared all onboarding data');
    } catch (error) {
      logger.error('Failed to clear data', error);
    }
  }, [user]);

  /**
   * Clean old emergency backups (older than 7 days)
   */
  const cleanOldBackups = useCallback(() => {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();
      const weekMs = 7 * 24 * 60 * 60 * 1000;

      keys.forEach((key) => {
        if (key.startsWith('emergency_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            if (data.timestamp) {
              const age = now - new Date(data.timestamp).getTime();
              if (age > weekMs) {
                localStorage.removeItem(key);
                logger.log('Removed old backup', key);
              }
            }
          } catch {
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      logger.error('Failed to clean old backups', error);
    }
  }, []);

  // Auto-save when debounced data changes
  useEffect(() => {
    if (user) {
      save();
    }
  }, [debouncedProfileData, debouncedIslamicPrefs, debouncedStep, debouncedSkippedSections]);

  // Clean old backups on mount
  useEffect(() => {
    cleanOldBackups();
  }, [cleanOldBackups]);

  // Save immediately on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user) {
        save(true); // Skip debounce for immediate save
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [user, save]);

  return {
    save,
    restore,
    clearAll,
    saveStatus,
    lastSaveTime,
    hasSavedData: lastSaveTime !== null,
  };
};
