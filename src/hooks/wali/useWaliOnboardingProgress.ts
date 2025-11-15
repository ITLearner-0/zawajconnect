import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WaliOnboardingProgress {
  id: string;
  wali_id: string;
  user_id: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  step_personal_info: boolean;
  step_verification: boolean;
  step_preferences: boolean;
  step_family_setup: boolean;
  step_guidelines: boolean;
  completion_percentage: number;
  started_at?: string;
  completed_at?: string;
  last_active_step?: string;
  created_at: string;
  updated_at: string;
}

export const useWaliOnboardingProgress = (waliId?: string) => {
  const [progress, setProgress] = useState<WaliOnboardingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!waliId) {
      setLoading(false);
      return;
    }
    fetchProgress();
  }, [waliId]);

  const fetchProgress = async () => {
    if (!waliId) return;

    try {
      setLoading(true);

      const { data, error } = await (supabase as any)
        .from('wali_onboarding_progress')
        .select('*')
        .eq('wali_id', waliId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      setProgress(data as WaliOnboardingProgress | null);
    } catch (err) {
      console.error('Error fetching onboarding progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const initializeProgress = async (userId: string) => {
    if (!waliId) return null;

    try {
      const { data, error } = await (supabase as any)
        .from('wali_onboarding_progress')
        .insert({
          wali_id: waliId,
          user_id: userId,
          status: 'in_progress',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setProgress(data as WaliOnboardingProgress);
      return data as WaliOnboardingProgress;
    } catch (err) {
      console.error('Error initializing progress:', err);
      return null;
    }
  };

  const updateStep = async (step: keyof WaliOnboardingProgress, completed: boolean) => {
    if (!progress) return;

    const updates: Partial<WaliOnboardingProgress> = {
      [step]: completed,
      last_active_step: step,
    };

    // Calculate completion percentage
    const steps = [
      progress.step_personal_info,
      progress.step_verification,
      progress.step_preferences,
      progress.step_family_setup,
      progress.step_guidelines,
    ];

    const completedSteps = steps.filter(Boolean).length + (completed ? 1 : 0);
    updates.completion_percentage = Math.round((completedSteps / 5) * 100);

    if (updates.completion_percentage === 100) {
      updates.status = 'completed';
      updates.completed_at = new Date().toISOString();
    }

    try {
      const { data, error } = await (supabase as any)
        .from('wali_onboarding_progress')
        .update(updates)
        .eq('id', progress.id)
        .select()
        .single();

      if (error) throw error;

      const typedData = data as WaliOnboardingProgress;
      setProgress(typedData);

      if (typedData.completion_percentage === 100) {
        toast({
          title: '🎉 Onboarding Complete!',
          description: 'You have completed the Wali onboarding process.',
        });
      }

      return typedData;
    } catch (err) {
      console.error('Error updating step:', err);
      toast({
        title: 'Error',
        description: 'Failed to update progress',
        variant: 'destructive',
      });
      return null;
    }
  };

  return {
    progress,
    loading,
    refetch: fetchProgress,
    initializeProgress,
    updateStep,
  };
};
