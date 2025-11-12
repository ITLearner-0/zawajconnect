import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UseQuestionnaireStateProps {
  autoSaveDelay?: number;
  storageKey?: string;
}

export const useQuestionnaireState = ({ 
  autoSaveDelay = 2000, 
  storageKey = 'questionnaire_responses' 
}: UseQuestionnaireStateProps = {}) => {
  const { user } = useAuth();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<Record<string, string>>({});
  const fullStorageKey = user ? `${storageKey}_${user.id}` : storageKey;

  // Load from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedResponses = localStorage.getItem(fullStorageKey);
      if (savedResponses) {
        try {
          const parsedResponses = JSON.parse(savedResponses);
          setResponses(parsedResponses);
          lastSavedRef.current = parsedResponses;
        } catch (error) {
          console.error('Error parsing saved responses:', error);
          localStorage.removeItem(fullStorageKey);
        }
      }
    }
  }, [user, fullStorageKey]);

  // Auto-save to localStorage when responses change
  useEffect(() => {
    if (user && Object.keys(responses).length > 0) {
      try {
        localStorage.setItem(fullStorageKey, JSON.stringify(responses));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }, [responses, user, fullStorageKey]);

  // Auto-save to database with debouncing
  const autoSaveToDatabase = useCallback(async () => {
    if (!user || saving) return;
    
    // Check if there are new responses to save
    const hasNewResponses = Object.keys(responses).some(
      key => responses[key] !== lastSavedRef.current[key]
    );
    
    if (!hasNewResponses || Object.keys(responses).length === 0) return;

    setSaving(true);
    try {
      const responseArray = Object.entries(responses).map(([questionKey, responseValue]) => ({
        user_id: user.id,
        question_key: questionKey,
        response_value: responseValue
      }));

      const { error } = await supabase
        .from('user_compatibility_responses')
        .upsert(responseArray, {
          onConflict: 'user_id,question_key',
          ignoreDuplicates: false
        });

      if (error) throw error;

      lastSavedRef.current = { ...responses };
      
    } catch (error) {
      console.error('Auto-save error:', error);
      // Don't show toast for auto-save errors to avoid spam
    } finally {
      setSaving(false);
    }
  }, [user, responses, saving]);

  // Update responses with auto-save
  const updateResponse = useCallback((questionKey: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionKey]: value
    }));
    
    // Auto-save after delay
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      autoSaveToDatabase();
    }, autoSaveDelay);
  }, [autoSaveToDatabase, autoSaveDelay]);

  // Manual save
  const saveToDatabase = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    setSaving(true);
    try {
      const responseArray = Object.entries(responses).map(([questionKey, responseValue]) => ({
        user_id: user.id,
        question_key: questionKey,
        response_value: responseValue
      }));

      const { error } = await supabase
        .from('user_compatibility_responses')
        .upsert(responseArray, {
          onConflict: 'user_id,question_key',
          ignoreDuplicates: false
        });

      if (error) throw error;

      lastSavedRef.current = { ...responses };
      
      // Clear localStorage backup since data is now saved
      localStorage.removeItem(fullStorageKey);
      
      return true;
    } catch (error) {
      console.error('Save error:', error);
      return false;
    } finally {
      setSaving(false);
    }
  }, [user, responses, fullStorageKey]);

  // Load existing responses from database
  const loadFromDatabase = useCallback(async () => {
    if (!user) return;

    try {
      const { data: responsesData, error } = await supabase
        .from('user_compatibility_responses')
        .select('question_key, response_value')
        .eq('user_id', user.id);

      if (error) throw error;

      const existingResponses: Record<string, string> = {};
      responsesData?.forEach(response => {
        existingResponses[response.question_key] = response.response_value;
      });
      
      // Merge with localStorage responses, prioritizing database responses
      setResponses(prev => ({
        ...prev,
        ...existingResponses
      }));
      lastSavedRef.current = existingResponses;
    } catch (error) {
      console.error('Error loading responses:', error);
    }
  }, [user]);

  // Clear all responses
  const clearResponses = useCallback(() => {
    setResponses({});
    lastSavedRef.current = {};
    if (user) {
      localStorage.removeItem(fullStorageKey);
    }
  }, [user, fullStorageKey]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    responses,
    updateResponse,
    saveToDatabase,
    loadFromDatabase,
    clearResponses,
    saving,
    hasUnsavedChanges: Object.keys(responses).some(
      key => responses[key] !== lastSavedRef.current[key]
    )
  };
};