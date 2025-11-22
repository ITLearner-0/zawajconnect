-- Create personality questionnaire table for matching algorithm
-- This replaces the placeholder personality score with real data

CREATE TABLE IF NOT EXISTS personality_questionnaire (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Life Goals & Ambitions (1-5 scale)
  career_ambition INTEGER CHECK (career_ambition BETWEEN 1 AND 5),
  family_priority INTEGER CHECK (family_priority BETWEEN 1 AND 5),
  religious_growth INTEGER CHECK (religious_growth BETWEEN 1 AND 5),
  community_involvement INTEGER CHECK (community_involvement BETWEEN 1 AND 5),

  -- Communication & Conflict Resolution (1-5 scale)
  communication_style INTEGER CHECK (communication_style BETWEEN 1 AND 5), -- 1=Direct, 5=Indirect
  conflict_resolution INTEGER CHECK (conflict_resolution BETWEEN 1 AND 5), -- 1=Avoidant, 5=Confrontational
  emotional_expression INTEGER CHECK (emotional_expression BETWEEN 1 AND 5), -- 1=Reserved, 5=Expressive

  -- Financial Management (1-5 scale)
  spending_habits INTEGER CHECK (spending_habits BETWEEN 1 AND 5), -- 1=Saver, 5=Spender
  financial_planning INTEGER CHECK (financial_planning BETWEEN 1 AND 5), -- 1=Spontaneous, 5=Planner

  -- Social & Lifestyle (1-5 scale)
  social_energy INTEGER CHECK (social_energy BETWEEN 1 AND 5), -- 1=Introvert, 5=Extrovert
  adventure_level INTEGER CHECK (adventure_level BETWEEN 1 AND 5), -- 1=Homebody, 5=Explorer
  organization_level INTEGER CHECK (organization_level BETWEEN 1 AND 5), -- 1=Spontaneous, 5=Organized

  -- Family Roles & Responsibilities (1-5 scale)
  household_roles INTEGER CHECK (household_roles BETWEEN 1 AND 5), -- 1=Traditional, 5=Equal
  decision_making INTEGER CHECK (decision_making BETWEEN 1 AND 5), -- 1=Independent, 5=Consultative
  parenting_style INTEGER CHECK (parenting_style BETWEEN 1 AND 5), -- 1=Strict, 5=Lenient

  -- Metadata
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one questionnaire per user
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_personality_questionnaire_user_id ON personality_questionnaire(user_id);

-- Enable Row Level Security
ALTER TABLE personality_questionnaire ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own questionnaire
CREATE POLICY "Users can view their own personality questionnaire"
  ON personality_questionnaire
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own questionnaire
CREATE POLICY "Users can insert their own personality questionnaire"
  ON personality_questionnaire
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own questionnaire
CREATE POLICY "Users can update their own personality questionnaire"
  ON personality_questionnaire
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own questionnaire
CREATE POLICY "Users can delete their own personality questionnaire"
  ON personality_questionnaire
  FOR DELETE
  USING (auth.uid() = user_id);

-- Allow users to view questionnaires of potential matches (opposite gender, not Wali)
CREATE POLICY "Users can view questionnaires of potential matches"
  ON personality_questionnaire
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p1, profiles p2
      WHERE p1.user_id = auth.uid()
        AND p2.user_id = personality_questionnaire.user_id
        AND p1.gender != p2.gender
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_personality_questionnaire_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER personality_questionnaire_updated_at
  BEFORE UPDATE ON personality_questionnaire
  FOR EACH ROW
  EXECUTE FUNCTION update_personality_questionnaire_updated_at();

COMMENT ON TABLE personality_questionnaire IS 'Stores personality questionnaire responses for matching algorithm compatibility scoring';
COMMENT ON COLUMN personality_questionnaire.career_ambition IS '1=Work to live, 5=Live to work';
COMMENT ON COLUMN personality_questionnaire.family_priority IS '1=Low priority, 5=Top priority';
COMMENT ON COLUMN personality_questionnaire.communication_style IS '1=Direct/Blunt, 5=Indirect/Diplomatic';
COMMENT ON COLUMN personality_questionnaire.conflict_resolution IS '1=Avoid conflict, 5=Address immediately';
COMMENT ON COLUMN personality_questionnaire.emotional_expression IS '1=Reserved/Private, 5=Open/Expressive';
COMMENT ON COLUMN personality_questionnaire.spending_habits IS '1=Frugal saver, 5=Free spender';
COMMENT ON COLUMN personality_questionnaire.financial_planning IS '1=Live in moment, 5=Plan everything';
COMMENT ON COLUMN personality_questionnaire.social_energy IS '1=Introvert/Small groups, 5=Extrovert/Large groups';
COMMENT ON COLUMN personality_questionnaire.adventure_level IS '1=Routine/Comfort, 5=Adventure/Novelty';
COMMENT ON COLUMN personality_questionnaire.organization_level IS '1=Spontaneous/Flexible, 5=Organized/Structured';
COMMENT ON COLUMN personality_questionnaire.household_roles IS '1=Traditional gender roles, 5=Equal partnership';
COMMENT ON COLUMN personality_questionnaire.decision_making IS '1=Make own decisions, 5=Always consult partner';
COMMENT ON COLUMN personality_questionnaire.parenting_style IS '1=Strict/Disciplinarian, 5=Lenient/Permissive';
