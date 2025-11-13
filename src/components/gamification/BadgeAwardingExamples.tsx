/**
 * This file contains examples of how to integrate badge awarding
 * into your existing components and features.
 * 
 * IMPORTANT: These are examples - implement them in your actual feature components!
 */

import { useEffect } from 'react';
import { useAwardBadge } from '@/hooks/gamification/useAwardBadge';
import { checkAndAwardProfileCompletion, checkAndAwardMatchBadges, checkAndAwardMessageBadges } from '@/utils/badgeAwards';

// ============================================
// EXAMPLE 1: Award badge on profile completion
// ============================================
export const ProfileCompletionExample = ({ completionPercentage }: { completionPercentage: number }) => {
  const { awardProfileCompletionBadge } = useAwardBadge();

  useEffect(() => {
    // Award badge when user reaches certain completion milestones
    if ([25, 50, 75, 100].includes(completionPercentage)) {
      awardProfileCompletionBadge(completionPercentage);
    }
  }, [completionPercentage]);

  return null; // This is just a logic component
};

// ============================================
// EXAMPLE 2: Award badge on email verification
// ============================================
export const EmailVerificationExample = ({ isVerified }: { isVerified: boolean }) => {
  const { awardVerificationBadge } = useAwardBadge();

  useEffect(() => {
    if (isVerified) {
      awardVerificationBadge('email');
    }
  }, [isVerified]);

  return null;
};

// ============================================
// EXAMPLE 3: Award badge when creating first match
// ============================================
export const FirstMatchExample = () => {
  const { awardBadge } = useAwardBadge();

  const handleMatchCreated = async (totalMatches: number) => {
    // Award first match badge
    if (totalMatches === 1) {
      await awardBadge({ badge_id: 'first_match', progress_value: 1 });
    }
    
    // Award subsequent milestone badges
    if (totalMatches === 7 || totalMatches === 25) {
      await checkAndAwardMatchBadges(totalMatches);
    }
  };

  return { handleMatchCreated };
};

// ============================================
// EXAMPLE 4: Award badge when sending messages
// ============================================
export const MessageSentExample = () => {
  const { awardMessageBadge } = useAwardBadge();

  const handleMessageSent = async (totalMessages: number) => {
    // Check if user has reached any milestone
    if ([1, 100, 500].includes(totalMessages)) {
      await awardMessageBadge(totalMessages);
    }
  };

  return { handleMessageSent };
};

// ============================================
// EXAMPLE 5: Silent badge awarding (background)
// ============================================
export const SilentBadgeExample = () => {
  const handleBackgroundAction = async () => {
    // For actions where you don't want to show toast notification
    // Use the utility functions from badgeAwards.ts
    
    // Example: Award profile completion silently during auto-save
    await checkAndAwardProfileCompletion(75);
  };

  return { handleBackgroundAction };
};

// ============================================
// EXAMPLE 6: Award compatibility test badge
// ============================================
export const CompatibilityTestExample = () => {
  const { awardBadge } = useAwardBadge();

  const handleTestCompleted = async () => {
    await awardBadge({ 
      badge_id: 'test_completed',
      showToast: true, // Show celebration toast
    });
  };

  return { handleTestCompleted };
};

// ============================================
// EXAMPLE 7: Award high compatibility badge
// ============================================
export const HighCompatibilityExample = ({ compatibilityScore }: { compatibilityScore: number }) => {
  const { awardBadge } = useAwardBadge();

  useEffect(() => {
    if (compatibilityScore >= 90) {
      awardBadge({ 
        badge_id: 'high_compatibility',
        progress_value: compatibilityScore,
      });
    }
  }, [compatibilityScore]);

  return null;
};

// ============================================
// EXAMPLE 8: Manual badge awarding (admin/special)
// ============================================
export const ManualBadgeAwardExample = () => {
  const { awardBadge } = useAwardBadge();

  const awardEarlyAdopterBadge = async (userId: string) => {
    // Special badges awarded manually by admins
    await awardBadge({ badge_id: 'early_adopter' });
  };

  const awardCommunityHelperBadge = async (userId: string) => {
    await awardBadge({ badge_id: 'community_helper' });
  };

  return { awardEarlyAdopterBadge, awardCommunityHelperBadge };
};

/**
 * INTEGRATION GUIDE:
 * 
 * 1. Profile Completion:
 *    - In your profile update handler, calculate completion percentage
 *    - Call awardProfileCompletionBadge(percentage) or checkAndAwardProfileCompletion(percentage)
 * 
 * 2. Verification:
 *    - After successful email/phone/ID verification
 *    - Call awardVerificationBadge('email' | 'phone' | 'id')
 * 
 * 3. First Match:
 *    - In your match creation handler
 *    - Get total match count and call awardMatchBadge(count)
 * 
 * 4. Messages:
 *    - After sending a message
 *    - Get total message count and call awardMessageBadge(count)
 * 
 * 5. Compatibility:
 *    - After completing compatibility test
 *    - Call awardBadge({ badge_id: 'test_completed' })
 *    - For high scores (90+), award high_compatibility badge
 * 
 * 6. Family:
 *    - When adding first family member, award family_added
 *    - When wali is verified, award wali_verified
 * 
 * 7. Login Streaks:
 *    - Track consecutive logins in user_progression
 *    - Award daily_login_7 and daily_login_30 at milestones
 */
