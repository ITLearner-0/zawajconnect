/**
 * Onboarding Analytics Hook
 *
 * Tracks user behavior during the onboarding process:
 * - Step navigation (start, complete, abandon)
 * - Time spent on each step
 * - Validation errors
 * - Overall completion
 */

import { useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface ValidationError {
  field: string;
  rule: string;
  message: string;
}

interface AnalyticsEvent {
  event_type:
    | 'step_started'
    | 'step_completed'
    | 'step_abandoned'
    | 'validation_error'
    | 'onboarding_completed';
  step_number?: number;
  step_name?: string;
  validation_errors?: ValidationError[];
  time_spent_seconds?: number;
  metadata?: Record<string, any>;
}

export const useOnboardingAnalytics = () => {
  const { user } = useAuth();
  const stepStartTimeRef = useRef<number | null>(null);
  const currentStepRef = useRef<number | null>(null);
  const sessionStartTimeRef = useRef<number>(Date.now());

  const stepNames = [
    'Informations personnelles',
    'Profil détaillé',
    'Préférences islamiques',
    'Objectifs',
  ];

  /**
   * Track an analytics event
   */
  const trackEvent = useCallback(
    async (event: AnalyticsEvent) => {
      if (!user) {
        logger.warn('Cannot track analytics: user not authenticated');
        return;
      }

      try {
        const { error } = await supabase.from('onboarding_analytics').insert([
          {
            user_id: user.id,
            event_type: event.event_type,
            step_number: event.step_number ?? null,
            step_name: event.step_name ?? null,
            validation_errors: (event.validation_errors || []) as any,
            time_spent_seconds: event.time_spent_seconds ?? null,
            metadata: (event.metadata || {}) as any,
          },
        ]);

        if (error) {
          logger.error('Failed to track analytics event', error);
        } else {
          logger.log('Analytics event tracked', event.event_type);
        }
      } catch (error) {
        logger.error('Error tracking analytics event', error);
      }
    },
    [user]
  );

  /**
   * Track step start
   */
  const trackStepStart = useCallback(
    (stepNumber: number) => {
      stepStartTimeRef.current = Date.now();
      currentStepRef.current = stepNumber;

      trackEvent({
        event_type: 'step_started',
        step_number: stepNumber,
        step_name: stepNames[stepNumber - 1],
      });
    },
    [trackEvent]
  );

  /**
   * Track step completion
   */
  const trackStepComplete = useCallback(
    (stepNumber: number) => {
      const timeSpent = stepStartTimeRef.current
        ? Math.round((Date.now() - stepStartTimeRef.current) / 1000)
        : undefined;

      trackEvent({
        event_type: 'step_completed',
        step_number: stepNumber,
        step_name: stepNames[stepNumber - 1],
        time_spent_seconds: timeSpent,
      });

      // Reset timer for next step
      stepStartTimeRef.current = null;
    },
    [trackEvent]
  );

  /**
   * Track step abandonment
   */
  const trackStepAbandon = useCallback(
    (stepNumber: number, reason?: string) => {
      const timeSpent = stepStartTimeRef.current
        ? Math.round((Date.now() - stepStartTimeRef.current) / 1000)
        : undefined;

      trackEvent({
        event_type: 'step_abandoned',
        step_number: stepNumber,
        step_name: stepNames[stepNumber - 1],
        time_spent_seconds: timeSpent,
        metadata: reason ? { reason } : {},
      });
    },
    [trackEvent]
  );

  /**
   * Track validation errors
   */
  const trackValidationErrors = useCallback(
    (stepNumber: number, errors: ValidationError[]) => {
      if (errors.length === 0) return;

      trackEvent({
        event_type: 'validation_error',
        step_number: stepNumber,
        step_name: stepNames[stepNumber - 1],
        validation_errors: errors,
      });
    },
    [trackEvent]
  );

  /**
   * Track onboarding completion
   */
  const trackOnboardingComplete = useCallback(() => {
    const totalTimeSpent = Math.round((Date.now() - sessionStartTimeRef.current) / 1000);

    trackEvent({
      event_type: 'onboarding_completed',
      time_spent_seconds: totalTimeSpent,
    });
  }, [trackEvent]);

  /**
   * Track page unload (potential abandonment)
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentStepRef.current !== null) {
        // Use sendBeacon for reliable tracking on page unload
        const event = {
          user_id: user?.id,
          event_type: 'step_abandoned',
          step_number: currentStepRef.current,
          step_name: stepNames[currentStepRef.current - 1],
          time_spent_seconds: stepStartTimeRef.current
            ? Math.round((Date.now() - stepStartTimeRef.current) / 1000)
            : null,
          metadata: { reason: 'page_unload' },
        };

        // Try to send with sendBeacon (best for unload events)
        if (navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify(event)], { type: 'application/json' });
          navigator.sendBeacon(
            `https://dgfctwtivkqcfhwqgkya.supabase.co/rest/v1/onboarding_analytics`,
            blob
          );
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [user]);

  return {
    trackStepStart,
    trackStepComplete,
    trackStepAbandon,
    trackValidationErrors,
    trackOnboardingComplete,
  };
};
