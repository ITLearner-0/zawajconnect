import { supabase } from '@/integrations/supabase/client';

/**
 * Query optimizer that leverages database indexes for better performance
 */
export class QueryOptimizer {
  /**
   * Optimized profile search using composite indexes
   */
  static async searchProfiles(
    filters: {
      gender?: string;
      location?: string;
      minAge?: number;
      maxAge?: number;
      religiousPractice?: string;
      educationLevel?: string;
      verified?: boolean;
    },
    limit: number = 20
  ) {
    let query = supabase.from('profiles').select('*').eq('is_visible', true); // Uses idx_profiles_visible_gender/location

    // Apply filters in order of index selectivity
    if (filters.gender) {
      query = query.eq('gender', filters.gender);
    }

    if (filters.location) {
      query = query.eq('location', filters.location);
    }

    if (filters.verified) {
      query = query.eq('email_verified', true).eq('phone_verified', true);
    }

    if (filters.religiousPractice) {
      query = query.eq('religious_practice_level', filters.religiousPractice);
    }

    if (filters.educationLevel) {
      query = query.eq('education_level', filters.educationLevel);
    }

    // Age filtering using birth_date index
    if (filters.minAge || filters.maxAge) {
      const currentDate = new Date();

      if (filters.maxAge) {
        const minBirthDate = new Date(currentDate.getFullYear() - filters.maxAge, 0, 1);
        query = query.gte('birth_date', minBirthDate.toISOString().split('T')[0]);
      }

      if (filters.minAge) {
        const maxBirthDate = new Date(currentDate.getFullYear() - filters.minAge, 11, 31);
        query = query.lte('birth_date', maxBirthDate.toISOString().split('T')[0]);
      }
    }

    return await query.order('created_at', { ascending: false }).limit(limit);
  }

  /**
   * Optimized compatibility matches using score index
   */
  static async getCompatibilityMatches(userId: string, minScore: number = 70, limit: number = 20) {
    // Uses idx_compatibility_results_score index
    return await supabase
      .from('compatibility_results')
      .select('user_id, score, answers, preferences')
      .neq('user_id', userId)
      .gte('score', minScore)
      .order('score', { ascending: false })
      .limit(limit);
  }

  /**
   * Optimized conversation messages with pagination
   */
  static async getConversationMessages(
    conversationId: string,
    limit: number = 50,
    before?: string
  ) {
    let query = supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId) // Uses idx_messages_conversation_id
      .order('created_at', { ascending: false }); // Uses idx_messages_conversation_created

    if (before) {
      query = query.lt('created_at', before);
    }

    return await query.limit(limit);
  }

  /**
   * Optimized user conversations with latest message
   */
  static async getUserConversations(userId: string) {
    // Uses idx_conversations_participants GIN index
    return await supabase
      .from('conversations')
      .select(
        `
        id,
        participants,
        wali_supervised,
        encryption_enabled,
        created_at,
        messages!inner(
          id,
          content,
          created_at,
          sender_id,
          is_read
        )
      `
      )
      .contains('participants', [userId])
      .order('created_at', { ascending: false }); // Uses idx_conversations_created_at
  }

  /**
   * Optimized unread notifications
   */
  static async getUnreadNotifications(userId: string, limit: number = 20) {
    // Uses idx_match_notifications_user_unread composite index
    return await supabase
      .from('match_notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(limit);
  }

  /**
   * Optimized chat requests for recipients
   */
  static async getPendingChatRequests(recipientId: string) {
    // Uses idx_chat_requests_recipient_id and idx_chat_requests_status
    return await supabase
      .from('chat_requests')
      .select('*')
      .eq('recipient_id', recipientId)
      .eq('status', 'pending')
      .order('requested_at', { ascending: false }); // Uses idx_chat_requests_requested_at
  }

  /**
   * Optimized wali chat requests
   */
  static async getWaliChatRequests(waliId: string) {
    // Uses idx_chat_requests_wali_id
    return await supabase
      .from('chat_requests')
      .select('*')
      .eq('wali_id', waliId)
      .order('requested_at', { ascending: false })
      .limit(50);
  }

  /**
   * Optimized content moderation queries
   */
  static async getUnresolvedFlags(limit: number = 100) {
    // Uses idx_content_flags_resolved
    return await supabase
      .from('content_flags')
      .select('*')
      .eq('resolved', false)
      .order('created_at', { ascending: false }) // Uses idx_content_flags_created_at
      .limit(limit);
  }

  /**
   * Optimized video call history
   */
  static async getUserVideoCallHistory(userId: string, limit: number = 20) {
    // Uses idx_video_calls_initiator_id and idx_video_calls_receiver_id
    const [initiatedCalls, receivedCalls] = await Promise.all([
      supabase
        .from('video_calls')
        .select('*')
        .eq('initiator_id', userId)
        .order('started_at', { ascending: false })
        .limit(limit),
      supabase
        .from('video_calls')
        .select('*')
        .eq('receiver_id', userId)
        .order('started_at', { ascending: false })
        .limit(limit),
    ]);

    if (initiatedCalls.error || receivedCalls.error) {
      return { data: null, error: initiatedCalls.error || receivedCalls.error };
    }

    // Combine and sort by started_at
    const allCalls = [...(initiatedCalls.data || []), ...(receivedCalls.data || [])]
      .sort(
        (a, b) => new Date(b.started_at || '').getTime() - new Date(a.started_at || '').getTime()
      )
      .slice(0, limit);

    return { data: allCalls, error: null };
  }

  /**
   * Optimized verified walis query
   */
  static async getVerifiedWalis() {
    // Uses idx_wali_profiles_is_verified
    return await supabase
      .from('wali_profiles')
      .select('*')
      .eq('is_verified', true)
      .order('last_active', { ascending: false }); // Uses idx_wali_profiles_last_active
  }
}
