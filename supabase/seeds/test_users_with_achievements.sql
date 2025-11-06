-- ============================================
-- Seed Script: Test Users with Achievements
-- ============================================
-- Creates test users with pre-unlocked achievements for Phase 5 testing
-- Usage: Run via scripts/seed-test-users.sh or directly with Supabase CLI

-- Clean up existing test data (optional - comment out if you want to keep existing data)
DELETE FROM achievement_unlocks WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE 'test-phase5-%@zawajconnect.com'
);
DELETE FROM insight_actions WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE 'test-phase5-%@zawajconnect.com'
);
DELETE FROM insights_analytics WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE 'test-phase5-%@zawajconnect.com'
);
DELETE FROM user_progression WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE 'test-phase5-%@zawajconnect.com'
);
DELETE FROM islamic_preferences WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE 'test-phase5-%@zawajconnect.com'
);
DELETE FROM user_settings WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE 'test-phase5-%@zawajconnect.com'
);
DELETE FROM profiles WHERE email LIKE 'test-phase5-%@zawajconnect.com';

-- ============================================
-- Create Test User IDs (using gen_random_uuid)
-- ============================================
-- We'll use fixed UUIDs for reproducibility
DO $$
DECLARE
  user1_id UUID := '11111111-1111-1111-1111-111111111111';
  user2_id UUID := '22222222-2222-2222-2222-222222222222';
  user3_id UUID := '33333333-3333-3333-3333-333333333333';
BEGIN

-- ============================================
-- Insert Test User 1: Beginner (1 achievement)
-- ============================================
INSERT INTO profiles (
  id, email, full_name, gender, date_of_birth, country, city,
  bio, interests, education, profession, marital_status,
  has_children, want_children, profile_complete, is_premium
) VALUES (
  user1_id,
  'test-phase5-beginner@zawajconnect.com',
  'Ahmed Test Beginner',
  'male',
  '1995-01-15',
  'France',
  'Paris',
  'Test user with beginner achievements for Phase 5 testing',
  ARRAY['Reading', 'Sports', 'Technology'],
  'Bachelor''s Degree',
  'Software Engineer',
  'never_married',
  false,
  'yes_definitely',
  true,
  false
);

INSERT INTO islamic_preferences (
  user_id, sect, madhab, prayer_frequency, quran_reading,
  importance_of_religion, hijab_preference, halal_diet
) VALUES (
  user1_id, 'Sunni', 'Hanafi', 'five_times', 'daily',
  'very_important', 'yes_always', true
);

INSERT INTO user_settings (user_id, language, email_notifications, push_notifications)
VALUES (user1_id, 'fr', true, true);

-- Analytics for User 1
INSERT INTO insights_analytics (
  user_id, view_count, share_count, export_count, last_viewed_at
) VALUES (
  user1_id, 5, 0, 0, NOW() - INTERVAL '2 hours'
);

-- User Progression for User 1
INSERT INTO user_progression (
  user_id, total_points, current_level, achievements_count, insights_viewed
) VALUES (
  user1_id, 100, 1, 1, 5
);

-- Achievement: Premier Test (100 points)
INSERT INTO achievement_unlocks (
  user_id, achievement_id, achievement_title, points_awarded, rarity, unlocked_at
) VALUES (
  user1_id, 'first_test', 'Premier Test', 100, 'common', NOW() - INTERVAL '2 hours'
);

-- Insight Actions for User 1
INSERT INTO insight_actions (user_id, action_type, metadata)
VALUES 
  (user1_id, 'view', '{"timestamp": "2024-01-15T10:00:00Z"}'::jsonb),
  (user1_id, 'view', '{"timestamp": "2024-01-15T11:00:00Z"}'::jsonb),
  (user1_id, 'view', '{"timestamp": "2024-01-15T12:00:00Z"}'::jsonb);

-- ============================================
-- Insert Test User 2: Intermediate (3 achievements)
-- ============================================
INSERT INTO profiles (
  id, email, full_name, gender, date_of_birth, country, city,
  bio, interests, education, profession, marital_status,
  has_children, want_children, profile_complete, is_premium
) VALUES (
  user2_id,
  'test-phase5-intermediate@zawajconnect.com',
  'Fatima Test Intermediate',
  'female',
  '1993-05-20',
  'France',
  'Lyon',
  'Test user with intermediate achievements for Phase 5 testing',
  ARRAY['Travel', 'Cooking', 'Art', 'Charity'],
  'Master''s Degree',
  'Teacher',
  'never_married',
  false,
  'yes_probably',
  true,
  true
);

INSERT INTO islamic_preferences (
  user_id, sect, madhab, prayer_frequency, quran_reading,
  importance_of_religion, hijab_preference, halal_diet
) VALUES (
  user2_id, 'Sunni', 'Maliki', 'five_times', 'weekly',
  'very_important', 'yes_always', true
);

INSERT INTO user_settings (user_id, language, email_notifications, push_notifications)
VALUES (user2_id, 'fr', true, true);

-- Analytics for User 2
INSERT INTO insights_analytics (
  user_id, view_count, share_count, export_count, last_viewed_at
) VALUES (
  user2_id, 15, 2, 1, NOW() - INTERVAL '1 hour'
);

-- User Progression for User 2
INSERT INTO user_progression (
  user_id, total_points, current_level, achievements_count, insights_viewed
) VALUES (
  user2_id, 350, 2, 3, 15
);

-- Achievements for User 2
INSERT INTO achievement_unlocks (
  user_id, achievement_id, achievement_title, points_awarded, rarity, unlocked_at
) VALUES 
  (user2_id, 'first_test', 'Premier Test', 100, 'common', NOW() - INTERVAL '5 days'),
  (user2_id, 'share_master', 'Ambassadeur', 100, 'rare', NOW() - INTERVAL '3 days'),
  (user2_id, 'export_expert', 'Archiviste', 150, 'rare', NOW() - INTERVAL '1 day');

-- Insight Actions for User 2
INSERT INTO insight_actions (user_id, action_type, metadata)
VALUES 
  (user2_id, 'view', '{"timestamp": "2024-01-10T10:00:00Z"}'::jsonb),
  (user2_id, 'view', '{"timestamp": "2024-01-11T10:00:00Z"}'::jsonb),
  (user2_id, 'share', '{"platform": "whatsapp", "timestamp": "2024-01-12T10:00:00Z"}'::jsonb),
  (user2_id, 'share', '{"platform": "email", "timestamp": "2024-01-13T10:00:00Z"}'::jsonb),
  (user2_id, 'export', '{"format": "pdf", "timestamp": "2024-01-14T10:00:00Z"}'::jsonb);

-- ============================================
-- Insert Test User 3: Advanced (6 achievements)
-- ============================================
INSERT INTO profiles (
  id, email, full_name, gender, date_of_birth, country, city,
  bio, interests, education, profession, marital_status,
  has_children, want_children, profile_complete, is_premium
) VALUES (
  user3_id,
  'test-phase5-advanced@zawajconnect.com',
  'Youssef Test Advanced',
  'male',
  '1990-08-10',
  'Maroc',
  'Casablanca',
  'Test user with advanced achievements for Phase 5 testing - power user',
  ARRAY['Business', 'Technology', 'Islamic Studies', 'Fitness', 'Volunteering'],
  'PhD',
  'Business Consultant',
  'never_married',
  false,
  'yes_definitely',
  true,
  true
);

INSERT INTO islamic_preferences (
  user_id, sect, madhab, prayer_frequency, quran_reading,
  importance_of_religion, hijab_preference, halal_diet
) VALUES (
  user3_id, 'Sunni', 'Shafi''i', 'five_times', 'daily',
  'very_important', 'no_preference', true
);

INSERT INTO user_settings (user_id, language, email_notifications, push_notifications)
VALUES (user3_id, 'fr', true, true);

-- Analytics for User 3 (Power User)
INSERT INTO insights_analytics (
  user_id, view_count, share_count, export_count, last_viewed_at
) VALUES (
  user3_id, 35, 6, 4, NOW() - INTERVAL '30 minutes'
);

-- User Progression for User 3
INSERT INTO user_progression (
  user_id, total_points, current_level, achievements_count, insights_viewed
) VALUES (
  user3_id, 950, 3, 6, 35
);

-- All Achievements for User 3
INSERT INTO achievement_unlocks (
  user_id, achievement_id, achievement_title, points_awarded, rarity, unlocked_at
) VALUES 
  (user3_id, 'first_test', 'Premier Test', 100, 'common', NOW() - INTERVAL '30 days'),
  (user3_id, 'frequent_viewer', 'Observateur Assidu', 100, 'common', NOW() - INTERVAL '25 days'),
  (user3_id, 'share_master', 'Ambassadeur', 100, 'rare', NOW() - INTERVAL '20 days'),
  (user3_id, 'export_expert', 'Archiviste', 150, 'rare', NOW() - INTERVAL '15 days'),
  (user3_id, 'engagement_hero', 'Champion de l''Engagement', 200, 'epic', NOW() - INTERVAL '10 days'),
  (user3_id, 'compatibility_master', 'Maître de Compatibilité', 300, 'legendary', NOW() - INTERVAL '5 days');

-- Insight Actions for User 3 (extensive history)
INSERT INTO insight_actions (user_id, action_type, metadata)
SELECT 
  user3_id,
  CASE 
    WHEN i % 3 = 0 THEN 'view'
    WHEN i % 3 = 1 THEN 'share'
    ELSE 'export'
  END,
  jsonb_build_object(
    'timestamp', (NOW() - (i || ' days')::INTERVAL)::TEXT
  )
FROM generate_series(1, 30) AS i;

END $$;

-- ============================================
-- Verification Queries
-- ============================================
-- Uncomment to verify the seed data after insertion

-- SELECT 
--   p.email,
--   p.full_name,
--   up.total_points,
--   up.current_level,
--   up.achievements_count,
--   ia.view_count,
--   ia.share_count,
--   ia.export_count
-- FROM profiles p
-- LEFT JOIN user_progression up ON up.user_id = p.id
-- LEFT JOIN insights_analytics ia ON ia.user_id = p.id
-- WHERE p.email LIKE 'test-phase5-%@zawajconnect.com'
-- ORDER BY up.total_points DESC;

-- SELECT 
--   p.email,
--   au.achievement_title,
--   au.points_awarded,
--   au.rarity,
--   au.unlocked_at
-- FROM achievement_unlocks au
-- JOIN profiles p ON p.id = au.user_id
-- WHERE p.email LIKE 'test-phase5-%@zawajconnect.com'
-- ORDER BY p.email, au.unlocked_at;

-- ============================================
-- Success Message
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Test users with achievements seeded successfully!';
  RAISE NOTICE '📊 Created 3 test users:';
  RAISE NOTICE '   1. test-phase5-beginner@zawajconnect.com (1 achievement, 100 points)';
  RAISE NOTICE '   2. test-phase5-intermediate@zawajconnect.com (3 achievements, 350 points)';
  RAISE NOTICE '   3. test-phase5-advanced@zawajconnect.com (6 achievements, 950 points)';
  RAISE NOTICE '🔐 No passwords needed - these are profile-only test users';
  RAISE NOTICE '📝 Use these for testing the Phase 5 analytics system';
END $$;
