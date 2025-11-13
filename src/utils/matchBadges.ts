/**
 * Utility functions to handle badge awarding for match milestones
 */

import { supabase } from '@/integrations/supabase/client';
import { checkAndAwardMatchBadges } from './badgeAwards';

/**
 * Count total mutual matches for a user
 */
export const countUserMutualMatches = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .eq('is_mutual', true)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    if (error) {
      console.error('Error counting mutual matches:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Exception counting mutual matches:', error);
    return 0;
  }
};

/**
 * Award match badges to both users in a mutual match
 * Should be called when is_mutual becomes true
 */
export const awardMatchBadgesToBothUsers = async (
  user1Id: string,
  user2Id: string
): Promise<void> => {
  try {
    console.log('=== AWARDING MATCH BADGES ===');
    console.log('User 1:', user1Id);
    console.log('User 2:', user2Id);

    // Count matches for both users
    const [user1Matches, user2Matches] = await Promise.all([
      countUserMutualMatches(user1Id),
      countUserMutualMatches(user2Id),
    ]);

    console.log('User 1 total matches:', user1Matches);
    console.log('User 2 total matches:', user2Matches);

    // Award badges to both users based on their match counts
    await Promise.all([
      checkAndAwardMatchBadges(user1Matches),
      checkAndAwardMatchBadges(user2Matches),
    ]);

    console.log('Match badges awarded successfully');
  } catch (error) {
    // Don't fail the match creation if badge awarding fails
    console.error('Error awarding match badges:', error);
  }
};
