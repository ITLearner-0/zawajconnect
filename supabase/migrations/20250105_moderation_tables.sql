-- Content Moderation Tables Migration
-- Created: 2025-01-05
-- Purpose: Create tables for content moderation rules and violations

-- Create moderation_rules table
CREATE TABLE IF NOT EXISTS moderation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('keyword', 'pattern', 'length', 'format', 'content_type')),
  pattern TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  action VARCHAR(20) NOT NULL CHECK (action IN ('warn', 'block', 'escalate', 'auto_moderate')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create moderation_violations table
CREATE TABLE IF NOT EXISTS moderation_violations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('message', 'profile', 'bio', 'photo', 'comment')),
  rules_violated TEXT[] NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  action_taken VARCHAR(20) NOT NULL CHECK (action_taken IN ('warned', 'blocked', 'escalated', 'auto_moderated')),
  auto_moderated_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_moderation_rules_type ON moderation_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_moderation_rules_severity ON moderation_rules(severity);
CREATE INDEX IF NOT EXISTS idx_moderation_rules_active ON moderation_rules(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_violations_user_id ON moderation_violations(user_id);
CREATE INDEX IF NOT EXISTS idx_violations_content_type ON moderation_violations(content_type);
CREATE INDEX IF NOT EXISTS idx_violations_severity ON moderation_violations(severity);
CREATE INDEX IF NOT EXISTS idx_violations_created_at ON moderation_violations(created_at DESC);

-- Enable Row Level Security
ALTER TABLE moderation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_violations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for moderation_rules
-- Only admins can view/modify rules
CREATE POLICY "Admins can view moderation rules"
  ON moderation_rules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can insert moderation rules"
  ON moderation_rules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can update moderation rules"
  ON moderation_rules FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for moderation_violations
-- Admins can view all violations
CREATE POLICY "Admins can view all violations"
  ON moderation_violations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Users can view their own violations
CREATE POLICY "Users can view own violations"
  ON moderation_violations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Service role can insert violations (for automated moderation)
CREATE POLICY "Service can insert violations"
  ON moderation_violations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add updated_at trigger for moderation_rules
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_moderation_rules_updated_at
  BEFORE UPDATE ON moderation_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE moderation_rules IS 'Rules for automated content moderation';
COMMENT ON TABLE moderation_violations IS 'Log of content moderation violations';
COMMENT ON COLUMN moderation_rules.pattern IS 'Regex pattern or condition for matching content';
COMMENT ON COLUMN moderation_violations.rules_violated IS 'Array of rule IDs that were violated';
