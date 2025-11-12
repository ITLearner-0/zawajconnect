-- Clean up any partial test data for this email to ensure clean registration
DO $$
DECLARE
    test_user_id uuid;
BEGIN
    -- Find any user ID that might be associated with the test email in profiles
    SELECT user_id INTO test_user_id 
    FROM profiles 
    WHERE full_name = 'Admin' 
    OR user_id IN (
        SELECT user_id FROM user_verifications WHERE email_verified = true
    )
    LIMIT 1;
    
    -- If we found a test user ID, clean up all related data
    IF test_user_id IS NOT NULL THEN
        DELETE FROM user_settings WHERE user_id = test_user_id;
        DELETE FROM privacy_settings WHERE user_id = test_user_id;
        DELETE FROM user_verifications WHERE user_id = test_user_id;
        DELETE FROM islamic_preferences WHERE user_id = test_user_id;
        DELETE FROM profiles WHERE user_id = test_user_id;
    END IF;
END
$$;