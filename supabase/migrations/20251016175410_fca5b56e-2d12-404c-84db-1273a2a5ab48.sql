-- Remove duplicate index on user_verifications
-- Keep idx_user_verifications_user_id and drop idx_user_verifications_user
-- Both indexes covered the same column(s), causing redundant storage and slower writes

DROP INDEX IF EXISTS public.idx_user_verifications_user;