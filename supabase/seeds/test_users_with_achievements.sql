-- ============================================
-- Seed Script: Test Users with Achievements
-- ============================================
-- Creates test users with pre-unlocked achievements for Phase 5 testing
-- ⚠️ IMPORTANT: You must create the auth users in Supabase Dashboard FIRST!
--    Emails: test-phase5-beginner@zawajconnect.me
--            test-phase5-intermediate@zawajconnect.me  
--            test-phase5-advanced@zawajconnect.me
--    Password: TestPhase5!2024

-- Clean up existing test data (respecting foreign keys)
DELETE FROM achievement_unlocks WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE 'test-phase5-%@zawajconnect.me'
);
DELETE FROM insight_actions WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE 'test-phase5-%@zawajconnect.me'
);
DELETE FROM insights_analytics WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE 'test-phase5-%@zawajconnect.me'
);
DELETE FROM user_progression WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE 'test-phase5-%@zawajconnect.me'
);
DELETE FROM islamic_preferences WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE 'test-phase5-%@zawajconnect.me'
);
DELETE FROM user_settings WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE 'test-phase5-%@zawajconnect.me'
);
DELETE FROM profiles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE 'test-phase5-%@zawajconnect.me'
);

-- ============================================
-- Get User IDs from Auth
-- ============================================
DO $$
DECLARE
  user1_id UUID;
  user2_id UUID;
  user3_id UUID;
BEGIN
  -- Get user IDs from auth.users
  SELECT id INTO user1_id FROM auth.users WHERE email = 'test-phase5-beginner@zawajconnect.me';
  SELECT id INTO user2_id FROM auth.users WHERE email = 'test-phase5-intermediate@zawajconnect.me';
  SELECT id INTO user3_id FROM auth.users WHERE email = 'test-phase5-advanced@zawajconnect.me';

  IF user1_id IS NULL OR user2_id IS NULL OR user3_id IS NULL THEN
    RAISE EXCEPTION '❌ Auth users not found! Please create them in Supabase Dashboard first.';
  END IF;

-- ============================================
-- Insert Test User 1: Beginner (1 achievement)
-- ============================================
INSERT INTO profiles (
  user_id, full_name, gender, date_of_birth, location,
  bio, interests, education, profession, 
  profile_completed
) VALUES (
  user1_id,
  'Ahmed Test Beginner',
  'male',
  '1995-01-15',
  'Paris, France',
  'Test user with beginner achievements for Phase 5 testing',
  ARRAY['Reading', 'Sports', 'Technology'],
  'Bachelor''s Degree',
  'Software Engineer',
  true
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
  user_id, full_name, gender, date_of_birth, location,
  bio, interests, education, profession,
  profile_completed
) VALUES (
  user2_id,
  'Fatima Test Intermediate',
  'female',
  '1993-05-20',
  'Lyon, France',
  'Test user with intermediate achievements for Phase 5 testing',
  ARRAY['Travel', 'Cooking', 'Art', 'Charity'],
  'Master''s Degree',
  'Teacher',
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
  user_id, full_name, gender, date_of_birth, location,
  bio, interests, education, profession,
  profile_completed
) VALUES (
  user3_id,
  'Youssef Test Advanced',
  'male',
  '1990-08-10',
  'Casablanca, Maroc',
  'Test user with advanced achievements for Phase 5 testing - power user',
  ARRAY['Business', 'Technology', 'Islamic Studies', 'Fitness', 'Volunteering'],
  'PhD',
  'Business Consultant',
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

  RAISE NOTICE '✅ Test users seeded successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '- Beginner: test-phase5-beginner@zawajconnect.me (1 achievement, 100 points)';
  RAISE NOTICE '- Intermediate: test-phase5-intermediate@zawajconnect.me (3 achievements, 350 points)';
  RAISE NOTICE '- Advanced: test-phase5-advanced@zawajconnect.me (6 achievements, 950 points)';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Password: TestPhase5!2024';
  RAISE NOTICE '🎯 Next: Log in with any test user to see their achievements!';
END $$;

-- ============================================
-- Verification Queries (uncomment to verify)
-- ============================================
-- SELECT 
--   au.email,
--   p.full_name,
--   up.total_points,
--   up.current_level,
--   up.achievements_count,
--   ia.view_count,
--   ia.share_count,
--   ia.export_count
-- FROM auth.users au
-- JOIN profiles p ON p.user_id = au.id
-- LEFT JOIN user_progression up ON up.user_id = au.id
-- LEFT JOIN insights_analytics ia ON ia.user_id = au.id
-- WHERE au.email LIKE 'test-phase5-%@zawajconnect.me'
-- ORDER BY up.total_points DESC;
