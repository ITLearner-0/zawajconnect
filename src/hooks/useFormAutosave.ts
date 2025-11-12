/**
 * Enhanced Form Autosave Hook
 *
 * Automatically saves form data to localStorage and Supabase
 * Prevents data loss on navigation or crashes
 */

import { useEffect, useRef, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { announce } from '@/utils/accessibility';

interface AutosaveOptions {
  /** Unique key for storing data */
  storageKey: string;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Whether to save to Supabase */
  saveToDatabase?: boolean;
  /** Supabase table name */
  tableName?: string;
  /** User ID for database save */
  userId?: string;
  /** Callback on successful save */
  onSuccess?: () => void;
  /** Callback on save error */
  onError?: (error: Error) => void;
  /** Whether to announce saves to screen readers */
  announceChanges?: boolean;
}

interface AutosaveReturn<T> {
  /** Load saved data from storage */
  loadSaved: () => T | null;
  /** Clear saved data */
  clearSaved: () => void;
  /** Manually trigger save */
  save: (data: T) => void;
  /** Check if there's saved data */
  hasSavedData: () => boolean;
  /** Get timestamp of last save */
  getLastSaveTime: () => Date | null;
}

/**
 * Hook for automatic form data persistence
 */
export function useFormAutosave<T extends Record<string, any>>(
  formData: T,
  options: AutosaveOptions
): AutosaveReturn<T> {
  const {
    storageKey,
    debounceMs = 1000,
    saveToDatabase = false,
    tableName,
    userId,
    onSuccess,
    onError,
    announceChanges = true,
  } = options;

  const debouncedData = useDebounce(formData, debounceMs);
  const previousDataRef = useRef<T | null>(null);
  const lastSaveTimeRef = useRef<Date | null>(null);

  /**
   * Save to localStorage
   */
  const saveToLocalStorage = useCallback(
    (data: T) => {
      try {
        const savedData = {
          data,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(storageKey, JSON.stringify(savedData));
        lastSaveTimeRef.current = new Date();
        logger.log('Form data saved to localStorage', storageKey);
      } catch (error) {
        logger.error('Failed to save to localStorage', error);
        onError?.(error as Error);
      }
    },
    [storageKey, onError]
  );

  /**
   * Save to Supabase
   */
  const saveToSupabase = useCallback(
    async (data: T) => {
      if (!tableName || !userId) {
        logger.warn('Cannot save to Supabase: missing tableName or userId');
        return;
      }

      try {
        const { error } = await supabase
          .from(tableName as any)
          .upsert({
            user_id: userId,
            data: data,
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;

        logger.log('Form data saved to Supabase', tableName);
        if (announceChanges) {
          announce('Your changes have been saved');
        }
        onSuccess?.();
      } catch (error) {
        logger.error('Failed to save to Supabase', error);
        onError?.(error as Error);
      }
    },
    [tableName, userId, announceChanges, onSuccess, onError]
  );

  /**
   * Main save function
   */
  const save = useCallback(
    (data: T) => {
      // Always save to localStorage
      saveToLocalStorage(data);

      // Optionally save to database
      if (saveToDatabase) {
        saveToSupabase(data);
      }
    },
    [saveToLocalStorage, saveToSupabase, saveToDatabase]
  );

  /**
   * Auto-save when data changes
   */
  useEffect(() => {
    // Skip if data hasn't changed
    if (JSON.stringify(debouncedData) === JSON.stringify(previousDataRef.current)) {
      return;
    }

    // Skip if data is empty
    if (Object.keys(debouncedData).length === 0) {
      return;
    }

    previousDataRef.current = debouncedData;
    save(debouncedData);
  }, [debouncedData, save]);

  /**
   * Load saved data from storage
   */
  const loadSaved = useCallback((): T | null => {
    try {
      const savedItem = localStorage.getItem(storageKey);
      if (!savedItem) return null;

      const parsed = JSON.parse(savedItem);
      const data = parsed.data as T;
      const timestamp = new Date(parsed.timestamp);

      // Check if data is not too old (7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      if (timestamp < sevenDaysAgo) {
        logger.log('Saved data is too old, clearing', storageKey);
        clearSaved();
        return null;
      }

      logger.log('Loaded saved form data', storageKey);
      return data;
    } catch (error) {
      logger.error('Failed to load saved data', error);
      return null;
    }
  }, [storageKey]);

  /**
   * Clear saved data
   */
  const clearSaved = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      previousDataRef.current = null;
      lastSaveTimeRef.current = null;
      logger.log('Cleared saved data', storageKey);
      if (announceChanges) {
        announce('Saved data cleared');
      }
    } catch (error) {
      logger.error('Failed to clear saved data', error);
    }
  }, [storageKey, announceChanges]);

  /**
   * Check if there's saved data
   */
  const hasSavedData = useCallback((): boolean => {
    return localStorage.getItem(storageKey) !== null;
  }, [storageKey]);

  /**
   * Get last save time
   */
  const getLastSaveTime = useCallback((): Date | null => {
    return lastSaveTimeRef.current;
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Save one last time before unmounting
      if (Object.keys(formData).length > 0) {
        saveToLocalStorage(formData);
      }
    };
  }, [formData, saveToLocalStorage]);

  return {
    loadSaved,
    clearSaved,
    save,
    hasSavedData,
    getLastSaveTime,
  };
}