-- Add new profile fields: has_children, nationality, mother_tongue, marital_status
-- These columns enrich the profile for the Islamic marriage context

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS has_children boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS nationality text,
  ADD COLUMN IF NOT EXISTS mother_tongue text,
  ADD COLUMN IF NOT EXISTS marital_status text CHECK (marital_status IN ('celibataire', 'divorce', 'veuf'));
