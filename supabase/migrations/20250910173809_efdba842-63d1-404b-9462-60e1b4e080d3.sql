-- Fix the duplicate profile issue by cleaning up and ensuring proper UPSERT behavior
-- Remove the existing profile to allow proper UPSERT
DELETE FROM profiles WHERE user_id = '7c3840cd-94a9-40be-9ef9-f23aba588770';