-- Add missing profile columns for nationality, mother tongue, children, marital status,
-- religious level, and niyyah timestamp.
-- Applied to production on 2026-03-22.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS nationality TEXT,
  ADD COLUMN IF NOT EXISTS mother_tongue TEXT,
  ADD COLUMN IF NOT EXISTS has_children BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS marital_status TEXT
    CHECK (marital_status IN ('célibataire','divorcé','veuf','séparé')),
  ADD COLUMN IF NOT EXISTS religious_level TEXT,
  ADD COLUMN IF NOT EXISTS niyyah_stated_at TIMESTAMPTZ;

-- CHECK constraint on religious_level (applied separately)
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_religious_level_check;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_religious_level_check
  CHECK (religious_level IS NULL OR religious_level IN ('non pratiquant', 'peu pratiquant', 'pratiquant', 'très pratiquant'));
