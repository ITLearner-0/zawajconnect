-- Moderation Rules Seed Data
-- Created: 2025-01-05
-- Purpose: Populate moderation_rules table with default Islamic content rules

-- Clear existing rules (optional - use with caution in production)
-- TRUNCATE TABLE moderation_rules;

-- High severity: Inappropriate relationship terminology
INSERT INTO moderation_rules (rule_type, pattern, severity, action, is_active, description)
VALUES
  ('keyword', '\b(dating|hookup|girlfriend|boyfriend|one night stand|casual|fling)\b', 'high', 'block', true,
   'Inappropriate relationship terminology that goes against Islamic marriage values'),

-- Critical severity: Explicit content
  ('keyword', '\b(sex|sexual|nude|naked|porn|xxx|nsfw)\b', 'critical', 'block', true,
   'Explicit sexual content strictly forbidden'),

-- High severity: Haram activities
  ('keyword', '\b(alcohol|bar|nightclub|party|drinking|drunk|wine|beer|vodka)\b', 'high', 'warn', true,
   'References to haram (forbidden) activities'),

  ('keyword', '\b(gambl|casino|bet|poker|lottery)\b', 'high', 'warn', true,
   'References to gambling and games of chance'),

-- Medium severity: External links
  ('pattern', '(http|https)://(?!zawajconnect\.)', 'medium', 'escalate', true,
   'External links that may lead to inappropriate content'),

  ('pattern', '(www\.|\.com|\.net|\.org)', 'medium', 'escalate', true,
   'Web addresses that may redirect outside platform'),

-- Medium severity: Contact information sharing (premature)
  ('pattern', '\b\d{10,}\b', 'medium', 'warn', true,
   'Phone numbers - users should get to know each other on platform first'),

  ('pattern', '\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', 'medium', 'warn', true,
   'Email addresses - communication should happen through platform initially'),

-- Low severity: Excessive message length
  ('length', '^.{500,}$', 'low', 'warn', true,
   'Message too long - consider breaking into multiple messages'),

-- Medium severity: Excessive capitalization
  ('format', 'excessive_caps', 'low', 'warn', true,
   'Excessive use of capital letters (appears aggressive)'),

-- Low severity: Excessive punctuation
  ('format', 'excessive_punctuation', 'low', 'warn', true,
   'Too many exclamation marks or question marks'),

-- Medium severity: Repeated characters
  ('format', 'repeated_characters', 'low', 'auto_moderate', true,
   'Repeated characters (like "heeeeey") will be automatically normalized'),

-- High severity: Offensive language
  ('keyword', '\b(stupid|idiot|fool|ugly|fat|loser|hate)\b', 'high', 'block', true,
   'Offensive or insulting language towards others'),

-- Medium severity: Pressure for personal info
  ('keyword', '\b(send me|give me|share your|what''s your) (photo|picture|pic|number|phone|email|address)\b', 'medium', 'warn', true,
   'Pressuring for personal information too early'),

-- High severity: Financial requests
  ('keyword', '\b(send money|need money|loan|borrow|pay me|cash|transfer)\b', 'high', 'block', true,
   'Financial requests or scam indicators'),

-- Critical severity: Violence or threats
  ('keyword', '\b(kill|murder|hurt|harm|violence|threat|die)\b', 'critical', 'block', true,
   'Threats or references to violence'),

-- Medium severity: Inappropriate questions
  ('keyword', '\b(virgin|virginity|body count|past relationships)\b', 'medium', 'warn', true,
   'Inappropriate personal questions that should be discussed with wali/guardian');

-- Add timestamp comments
COMMENT ON TABLE moderation_rules IS 'Last seeded: 2025-01-05';

-- Display summary
DO $$
DECLARE
  rule_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO rule_count FROM moderation_rules WHERE is_active = true;
  RAISE NOTICE 'Successfully seeded % active moderation rules', rule_count;
END $$;
