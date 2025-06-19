
-- Create optimized indexes for better query performance

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_visible_gender ON profiles(is_visible, gender) WHERE is_visible = true;
CREATE INDEX IF NOT EXISTS idx_profiles_visible_location ON profiles(is_visible, location) WHERE is_visible = true;
CREATE INDEX IF NOT EXISTS idx_profiles_verified_visible ON profiles(email_verified, phone_verified, is_visible) WHERE is_visible = true;
CREATE INDEX IF NOT EXISTS idx_profiles_religious_practice ON profiles(religious_practice_level) WHERE religious_practice_level IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_education ON profiles(education_level) WHERE education_level IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_birth_date ON profiles(birth_date) WHERE birth_date IS NOT NULL;

-- Compatibility results indexes
CREATE INDEX IF NOT EXISTS idx_compatibility_results_user_score ON compatibility_results(user_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_compatibility_results_score ON compatibility_results(score DESC) WHERE score >= 70;

-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_created ON messages(sender_id, created_at DESC);

-- Conversations table indexes
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING GIN(participants);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);

-- Chat requests indexes
CREATE INDEX IF NOT EXISTS idx_chat_requests_recipient_id ON chat_requests(recipient_id);
CREATE INDEX IF NOT EXISTS idx_chat_requests_wali_id ON chat_requests(wali_id) WHERE wali_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chat_requests_status ON chat_requests(status);
CREATE INDEX IF NOT EXISTS idx_chat_requests_requested_at ON chat_requests(requested_at DESC);

-- Match notifications indexes
CREATE INDEX IF NOT EXISTS idx_match_notifications_user_id ON match_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_match_notifications_user_unread ON match_notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_match_notifications_created_at ON match_notifications(created_at DESC);

-- Content flags indexes
CREATE INDEX IF NOT EXISTS idx_content_flags_content_id ON content_flags(content_id);
CREATE INDEX IF NOT EXISTS idx_content_flags_resolved ON content_flags(resolved) WHERE resolved = false;
CREATE INDEX IF NOT EXISTS idx_content_flags_created_at ON content_flags(created_at DESC);

-- Video calls indexes
CREATE INDEX IF NOT EXISTS idx_video_calls_conversation_id ON video_calls(conversation_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_initiator_id ON video_calls(initiator_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_receiver_id ON video_calls(receiver_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_started_at ON video_calls(started_at DESC);

-- Wali profiles indexes
CREATE INDEX IF NOT EXISTS idx_wali_profiles_user_id ON wali_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_wali_profiles_is_verified ON wali_profiles(is_verified) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_wali_profiles_last_active ON wali_profiles(last_active DESC);
