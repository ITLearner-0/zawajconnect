import { supabase } from '@/integrations/supabase/client';

/**
 * Trigger verification approved email
 * This should be called when an admin approves a verification
 * or when the verification score reaches certain thresholds
 */
export const triggerVerificationApprovedEmail = async (
  userId: string,
  verificationType: 'email' | 'phone' | 'id',
  verificationScore: number
) => {
  try {
    const { error } = await supabase.functions.invoke('send-verification-approved-email', {
      body: {
        user_id: userId,
        verification_type: verificationType,
        verification_score: verificationScore
      }
    });

    if (error) {
      console.error('Failed to send verification approved email:', error);
      throw error;
    }

    console.log(`Verification approved email sent for ${verificationType}`);
  } catch (error) {
    console.error('Error triggering verification email:', error);
  }
};

/**
 * Check if verification email should be sent based on score changes
 */
export const checkVerificationMilestone = async (
  userId: string,
  oldScore: number,
  newScore: number
) => {
  // Send email when reaching certain milestones
  if (oldScore < 60 && newScore >= 60) {
    await triggerVerificationApprovedEmail(userId, 'email', newScore);
  } else if (oldScore < 85 && newScore >= 85) {
    await triggerVerificationApprovedEmail(userId, 'id', newScore);
  }
};
