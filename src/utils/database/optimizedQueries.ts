import { supabase } from '@/integrations/supabase/client';

/**
 * Optimized query utilities that leverage database indexes
 */

// Compatibility queries optimized for indexes
export const getCompatibilityMatches = async (
  userId: string,
  minScore: number = 70,
  limit: number = 20
) => {
  // Uses idx_compatibility_results_user_score index
  const { data, error } = await supabase
    .from('compatibility_results')
    .select('user_id, score, answers, preferences, created_at')
    .neq('user_id', userId)
    .gte('score', minScore)
    .order('score', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data, error };
};

// Profile queries optimized for indexes
export const getVisibleProfiles = async (
  filters: {
    gender?: string;
    location?: string;
    minAge?: number;
    maxAge?: number;
    religiousPractice?: string;
    educationLevel?: string;
    emailVerified?: boolean;
    phoneVerified?: boolean;
  } = {},
  limit: number = 50
) => {
  let query = supabase.from('profiles').select('*').eq('is_visible', true); // Uses idx_profiles_is_visible

  // Apply filters that use specific indexes
  if (filters.gender) {
    query = query.eq('gender', filters.gender); // Uses idx_profiles_visible_gender
  }

  if (filters.location) {
    query = query.eq('location', filters.location); // Uses idx_profiles_visible_location
  }

  if (filters.religiousPractice) {
    query = query.eq('religious_practice_level', filters.religiousPractice); // Uses idx_profiles_religious_practice
  }

  if (filters.educationLevel) {
    query = query.eq('education_level', filters.educationLevel); // Uses idx_profiles_education
  }

  if (filters.emailVerified !== undefined) {
    query = query.eq('email_verified', filters.emailVerified); // Uses idx_profiles_verified_visible
  }

  if (filters.phoneVerified !== undefined) {
    query = query.eq('phone_verified', filters.phoneVerified); // Uses idx_profiles_verified_visible
  }

  // Age filtering using birth_date index
  if (filters.minAge || filters.maxAge) {
    const currentDate = new Date();

    if (filters.maxAge) {
      const minBirthDate = new Date(
        currentDate.getFullYear() - filters.maxAge,
        currentDate.getMonth(),
        currentDate.getDate()
      );
      query = query.gte('birth_date', minBirthDate.toISOString().split('T')[0]);
    }

    if (filters.minAge) {
      const maxBirthDate = new Date(
        currentDate.getFullYear() - filters.minAge,
        currentDate.getMonth(),
        currentDate.getDate()
      );
      query = query.lte('birth_date', maxBirthDate.toISOString().split('T')[0]);
    }
  }

  const { data, error } = await query.order('created_at', { ascending: false }).limit(limit);

  return { data, error };
};

// Message queries optimized for indexes
export const getConversationMessages = async (
  conversationId: string,
  limit: number = 50,
  before?: string
) => {
  let query = supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId) // Uses idx_messages_conversation_id
    .order('created_at', { ascending: false }); // Uses idx_messages_conversation_created

  if (before) {
    query = query.lt('created_at', before);
  }

  const { data, error } = await query.limit(limit);

  return { data, error };
};

export const getUserConversations = async (userId: string) => {
  // Uses idx_conversations_participants GIN index
  const { data, error } = await supabase
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

  return { data, error };
};

// Notification queries optimized for indexes
export const getUnreadNotifications = async (userId: string, limit: number = 20) => {
  // Uses idx_match_notifications_user_unread composite index
  const { data, error } = await (supabase as any)
    .from('match_notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('is_read', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data, error };
};

export const getRecentNotifications = async (userId: string, limit: number = 50) => {
  // Uses idx_match_notifications_user_id and idx_match_notifications_created_at
  const { data, error } = await (supabase as any)
    .from('match_notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data, error };
};

// Chat request queries optimized for indexes
export const getPendingChatRequests = async (recipientId: string) => {
  // Uses idx_chat_requests_recipient_id and idx_chat_requests_status
  const { data, error } = await (supabase as any)
    .from('chat_requests')
    .select('*')
    .eq('recipient_id', recipientId)
    .eq('status', 'pending')
    .order('requested_at', { ascending: false }); // Uses idx_chat_requests_requested_at

  return { data, error };
};

export const getWaliChatRequests = async (waliId: string) => {
  // Uses idx_chat_requests_wali_id
  const { data, error } = await (supabase as any)
    .from('chat_requests')
    .select('*')
    .eq('wali_id', waliId)
    .order('requested_at', { ascending: false })
    .limit(50);

  return { data, error };
};

// Content moderation queries optimized for indexes
export const getUnresolvedFlags = async (limit: number = 100) => {
  // Uses idx_content_flags_resolved
  const { data, error } = await supabase
    .from('content_flags')
    .select('*')
    .eq('resolved', false)
    .order('created_at', { ascending: false }) // Uses idx_content_flags_created_at
    .limit(limit);

  return { data, error };
};

export const getFlagsByContentId = async (contentId: string) => {
  // Uses idx_content_flags_content_id
  const { data, error } = await supabase
    .from('content_flags')
    .select('*')
    .eq('content_id', contentId)
    .order('created_at', { ascending: false });

  return { data, error };
};

// Video call queries optimized for indexes
export const getConversationVideoCalls = async (conversationId: string) => {
  // Uses idx_video_calls_conversation_id
  const { data, error } = await supabase
    .from('video_calls')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('started_at', { ascending: false }); // Uses idx_video_calls_started_at

  return { data, error };
};

export const getUserVideoCallHistory = async (userId: string, limit: number = 20) => {
  // Uses idx_video_calls_initiator_id and idx_video_calls_receiver_id
  const { data: initiatedCalls, error: error1 } = await supabase
    .from('video_calls')
    .select('*')
    .eq('initiator_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit);

  const { data: receivedCalls, error: error2 } = await supabase
    .from('video_calls')
    .select('*')
    .eq('receiver_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error1 || error2) {
    return { data: null, error: error1 || error2 };
  }

  // Combine and sort by start_time
  const allCalls = [...(initiatedCalls || []), ...(receivedCalls || [])]
    .sort((a, b) => new Date(b.start_time || '').getTime() - new Date(a.start_time || '').getTime())
    .slice(0, limit);

  return { data: allCalls, error: null };
};

// Wali profile queries optimized for indexes
export const getVerifiedWalis = async () => {
  // Uses idx_wali_profiles_is_verified
  const { data, error } = await supabase
    .from('wali_profiles')
    .select('*')
    .eq('is_verified', true)
    .order('last_active', { ascending: false }); // Uses idx_wali_profiles_last_active

  return { data, error };
};

export const getWaliByUserId = async (userId: string) => {
  // Uses idx_wali_profiles_user_id
  const { data, error } = await supabase
    .from('wali_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  return { data, error };
};
