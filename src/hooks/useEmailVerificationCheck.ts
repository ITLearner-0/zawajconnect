/**
 * Hook to check email verification status and award badge
 * Monitors auth.users.email_confirmed_at and syncs with user_verifications
 */

import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { awardBadgeSilent } from '@/utils/badgeAwards';

export const useEmailVerificationCheck = () => {
  useEffect(() => {
    const checkEmailVerification = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        // Check if email is confirmed in auth
        const emailConfirmed = user.email_confirmed_at !== null;

        if (!emailConfirmed) return;

        // Check if user_verifications record exists and email_verified status
        const { data: verificationData, error: fetchError } = await supabase
          .from('user_verifications')
          .select('email_verified')
          .eq('user_id', user.id)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching verification status:', fetchError);
          return;
        }

        // If email is confirmed but not marked as verified in user_verifications
        if (verificationData && !verificationData.email_verified) {
          console.log('[EmailVerification] Email confirmed but not verified in DB, updating...');

          // Update user_verifications (score will be recalculated by trigger)
          const { error: updateError } = await supabase
            .from('user_verifications')
            .update({
              email_verified: true,
            })
            .eq('user_id', user.id);

          if (updateError) {
            console.error('Error updating email verification:', updateError);
            return;
          }

          // Award email verification badge
          console.log('[EmailVerification] Awarding email verification badge');
          await awardBadgeSilent('email_verified');
        }
      } catch (error) {
        console.error('Error in email verification check:', error);
      }
    };

    // Run check on mount
    checkEmailVerification();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        checkEmailVerification();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
};
