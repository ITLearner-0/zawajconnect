
-- Add indexes for user compatibility queries
CREATE INDEX IF NOT EXISTS idx_compatibility_results_user_id ON compatibility_results(user_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_results_score ON compatibility_results(score DESC);
CREATE INDEX IF NOT EXISTS idx_compatibility_results_created_at ON compatibility_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_compatibility_results_user_score ON compatibility_results(user_id, score DESC);

-- Add indexes for profile queries used in compatibility matching
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_religious_practice ON profiles(religious_practice_level);
CREATE INDEX IF NOT EXISTS idx_profiles_education ON profiles(education_level);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location);
CREATE INDEX IF NOT EXISTS idx_profiles_birth_date ON profiles(birth_date);
CREATE INDEX IF NOT EXISTS idx_profiles_is_visible ON profiles(is_visible);
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON profiles(email_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_phone_verified ON profiles(phone_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_id_verified ON profiles(id_verified);

-- Composite indexes for common filtering combinations
CREATE INDEX IF NOT EXISTS idx_profiles_visible_gender ON profiles(is_visible, gender) WHERE is_visible = true;
CREATE INDEX IF NOT EXISTS idx_profiles_visible_location ON profiles(is_visible, location) WHERE is_visible = true;
CREATE INDEX IF NOT EXISTS idx_profiles_verified_visible ON profiles(email_verified, phone_verified, is_visible) WHERE is_visible = true;

-- Add indexes for messaging queries
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING GIN(participants);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at DESC);

-- Add indexes for notification queries
CREATE INDEX IF NOT EXISTS idx_match_notifications_user_id ON match_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_match_notifications_created_at ON match_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_match_notifications_user_unread ON match_notifications(user_id, is_read, created_at DESC);

-- Add indexes for content moderation
CREATE INDEX IF NOT EXISTS idx_content_flags_content_id ON content_flags(content_id);
CREATE INDEX IF NOT EXISTS idx_content_flags_content_type ON content_flags(content_type);
CREATE INDEX IF NOT EXISTS idx_content_flags_resolved ON content_flags(resolved);
CREATE INDEX IF NOT EXISTS idx_content_flags_created_at ON content_flags(created_at DESC);

-- Add indexes for chat requests and wali functionality
CREATE INDEX IF NOT EXISTS idx_chat_requests_requester_id ON chat_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_chat_requests_recipient_id ON chat_requests(recipient_id);
CREATE INDEX IF NOT EXISTS idx_chat_requests_wali_id ON chat_requests(wali_id);
CREATE INDEX IF NOT EXISTS idx_chat_requests_status ON chat_requests(status);
CREATE INDEX IF NOT EXISTS idx_chat_requests_requested_at ON chat_requests(requested_at DESC);

-- Add indexes for wali profiles
CREATE INDEX IF NOT EXISTS idx_wali_profiles_user_id ON wali_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_wali_profiles_is_verified ON wali_profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_wali_profiles_last_active ON wali_profiles(last_active DESC);

-- Add indexes for video calls
CREATE INDEX IF NOT EXISTS idx_video_calls_conversation_id ON video_calls(conversation_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_initiator_id ON video_calls(initiator_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_receiver_id ON video_calls(receiver_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_started_at ON video_calls(started_at DESC);

-- Analyze tables to update statistics for the query planner
ANALYZE compatibility_results;
ANALYZE profiles;
ANALYZE conversations;
ANALYZE messages;
ANALYZE match_notifications;
ANALYZE content_flags;
ANALYZE chat_requests;
ANALYZE wali_profiles;
ANALYZE video_calls;
