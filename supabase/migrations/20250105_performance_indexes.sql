-- Performance Optimization Indexes Migration
-- Created: 2025-01-05
-- Purpose: Add database indexes to improve query performance

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location);
CREATE INDEX IF NOT EXISTS idx_profiles_age ON profiles(age);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- Islamic preferences indexes
CREATE INDEX IF NOT EXISTS idx_islamic_prefs_sect ON islamic_preferences(sect);
CREATE INDEX IF NOT EXISTS idx_islamic_prefs_madhab ON islamic_preferences(madhab);
CREATE INDEX IF NOT EXISTS idx_islamic_prefs_prayer ON islamic_preferences(prayer_frequency);

-- Matches table indexes
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_matches_user1_status ON matches(user1_id, status);
CREATE INDEX IF NOT EXISTS idx_matches_user2_status ON matches(user2_id, status);
CREATE INDEX IF NOT EXISTS idx_profiles_gender_age ON profiles(gender, age);

-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_messages_match_id ON messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Subscriptions table indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON subscriptions(end_date);

-- Payments table indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- User verifications indexes
CREATE INDEX IF NOT EXISTS idx_verifications_user_id ON user_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_verifications_score ON user_verifications(verification_score);

-- Add comments for documentation
COMMENT ON INDEX idx_profiles_gender IS 'Used for filtering potential matches by gender';
COMMENT ON INDEX idx_matches_user1_status IS 'Composite index for user match queries with status filter';
COMMENT ON INDEX idx_islamic_prefs_prayer IS 'Used for Islamic compatibility matching';
COMMENT ON INDEX idx_messages_match_id IS 'Used for retrieving messages in a conversation';
