-- Remove duplicate index on family_members
-- Keep idx_family_members_invited_user_id and drop idx_family_members_invited_user
-- Both indexes covered the same column(s), causing redundant storage and slower writes

DROP INDEX IF EXISTS public.idx_family_members_invited_user;