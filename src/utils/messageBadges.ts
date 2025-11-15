/**
 * Utility functions to handle badge awarding for message milestones
 */

import { supabase } from '@/integrations/supabase/client';
import { checkAndAwardMessageBadges } from './badgeAwards';

/**
 * Count total messages sent by a user
 */
export const countUserMessages = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('sender_id', userId);

    if (error) {
      console.error('Error counting user messages:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Exception counting user messages:', error);
    return 0;
  }
};

/**
 * Check and award message badges after sending a message
 * Should be called after successfully inserting a message
 */
export const checkAndAwardMessageMilestones = async (userId: string): Promise<void> => {
  try {
    console.log('=== CHECKING MESSAGE BADGES ===');
    console.log('User ID:', userId);

    // Count total messages for this user
    const totalMessages = await countUserMessages(userId);
    console.log('Total messages sent:', totalMessages);

    // Award badges for milestones (1, 100, 500)
    await checkAndAwardMessageBadges(totalMessages);

    console.log('Message badge check completed');
  } catch (error) {
    // Don't fail the message send if badge awarding fails
    console.error('Error awarding message badges:', error);
  }
};
