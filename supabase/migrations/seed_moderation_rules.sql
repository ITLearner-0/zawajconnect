-- =====================================================
-- Moderation Rules Configuration
-- =====================================================
-- Created: December 4, 2025
-- Purpose: Populate moderation_rules table with Islamic-compliant content moderation rules
--
-- These rules ensure that ZawajConnect maintains:
-- - Islamic values and guidelines
-- - Safe and respectful community
-- - Protection from inappropriate content
-- - Automated content filtering
-- =====================================================

-- Clear existing rules (if re-running this migration)
-- DELETE FROM moderation_rules WHERE id IS NOT NULL;

-- =====================================================
-- CATEGORY 1: INAPPROPRIATE RELATIONSHIP TERMINOLOGY
-- =====================================================
-- Severity: HIGH (immediate block)
-- Action: Auto-block message, flag for review

INSERT INTO moderation_rules (rule_type, pattern, severity, action, is_active, description, category)
VALUES
  -- English terms
  (
    'keyword',
    '\b(dating|hookup|girlfriend|boyfriend|one[- ]?night[- ]?stand|casual[- ]?sex|friends[- ]?with[- ]?benefits|fwb)\b',
    'high',
    'block',
    true,
    'Inappropriate relationship terminology (English)',
    'inappropriate_relationships'
  ),
  -- French terms
  (
    'keyword',
    '\b(rencard|plan[- ]?cul|petit[e]?[- ]?ami[e]?|coup[- ]?d''un[- ]?soir|sexe[- ]?sans[- ]?lendemain)\b',
    'high',
    'block',
    true,
    'Inappropriate relationship terminology (French)',
    'inappropriate_relationships'
  ),
  -- Arabic terms (transliterated)
  (
    'keyword',
    '\b(haram[- ]?relationship|zina|temporary[- ]?marriage|misyar)\b',
    'high',
    'block',
    true,
    'Inappropriate relationship terminology (Arabic transliterated)',
    'inappropriate_relationships'
  );

-- =====================================================
-- CATEGORY 2: NON-ISLAMIC ACTIVITIES
-- =====================================================
-- Severity: MEDIUM (warn user, allow with review)
-- Action: Warning + manual review

INSERT INTO moderation_rules (rule_type, pattern, severity, action, is_active, description, category)
VALUES
  -- Alcohol and intoxicants
  (
    'keyword',
    '\b(alcohol|beer|wine|vodka|whiskey|drunk|drinking|bar|nightclub|club|disco|party)\b',
    'medium',
    'warn',
    true,
    'References to alcohol and nightlife',
    'non_islamic_activities'
  ),
  -- Gambling
  (
    'keyword',
    '\b(casino|gambling|poker|bet|betting|lottery)\b',
    'medium',
    'warn',
    true,
    'References to gambling',
    'non_islamic_activities'
  ),
  -- Music/entertainment (context-dependent)
  (
    'keyword',
    '\b(concert|music[- ]?festival|rave|nightlife)\b',
    'low',
    'flag',
    true,
    'References to potentially inappropriate entertainment',
    'non_islamic_activities'
  );

-- =====================================================
-- CATEGORY 3: EXPLICIT CONTENT
-- =====================================================
-- Severity: CRITICAL (immediate block + account flag)
-- Action: Block + escalate to admin

INSERT INTO moderation_rules (rule_type, pattern, severity, action, is_active, description, category)
VALUES
  -- Sexual content (English)
  (
    'keyword',
    '\b(sex|nude|naked|porn|xxx|nsfw|explicit)\b',
    'critical',
    'block',
    true,
    'Explicit sexual content (English)',
    'explicit_content'
  ),
  -- Sexual content (French)
  (
    'keyword',
    '\b(sexe|nu[e]?|porno|cul|sexuel|érotique)\b',
    'critical',
    'block',
    true,
    'Explicit sexual content (French)',
    'explicit_content'
  ),
  -- Inappropriate body part references
  (
    'keyword',
    '\b(breasts?|boobs|butt|ass|penis|vagina|genitals?)\b',
    'critical',
    'block',
    true,
    'Inappropriate body part references',
    'explicit_content'
  );

-- =====================================================
-- CATEGORY 4: EXTERNAL LINKS & CONTACT INFO
-- =====================================================
-- Severity: MEDIUM (prevent external communication)
-- Action: Auto-moderate (remove links)

INSERT INTO moderation_rules (rule_type, pattern, severity, action, is_active, description, category)
VALUES
  -- URLs (except zawajconnect.com)
  (
    'pattern',
    '(http|https)://(?!zawajconnect\\.)',
    'medium',
    'auto_moderate',
    true,
    'External URLs (potential scams/phishing)',
    'external_contact'
  ),
  -- Email addresses
  (
    'pattern',
    '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',
    'medium',
    'auto_moderate',
    true,
    'Email addresses (circumvent platform)',
    'external_contact'
  ),
  -- Phone numbers (international format)
  (
    'pattern',
    '(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',
    'medium',
    'auto_moderate',
    true,
    'Phone numbers (circumvent platform)',
    'external_contact'
  ),
  -- Social media handles
  (
    'pattern',
    '@[a-zA-Z0-9_]{3,}|instagram|snapchat|whatsapp|telegram|signal',
    'medium',
    'warn',
    true,
    'Social media handles (circumvent platform)',
    'external_contact'
  );

-- =====================================================
-- CATEGORY 5: SPAM & EXCESSIVE CONTENT
-- =====================================================
-- Severity: LOW (likely spam)
-- Action: Flag for review

INSERT INTO moderation_rules (rule_type, pattern, severity, action, is_active, description, category)
VALUES
  -- Excessive length
  (
    'length',
    '^.{2000,}$',
    'low',
    'warn',
    true,
    'Excessively long message (potential spam)',
    'spam'
  ),
  -- Repeated characters (spam indicator)
  (
    'format',
    'repeated_characters',
    'medium',
    'auto_moderate',
    true,
    'Spam-like repeated characters (aaaaa, 11111, etc.)',
    'spam'
  ),
  -- Excessive capitals
  (
    'format',
    'excessive_caps',
    'low',
    'warn',
    true,
    'Excessive capital letters (SHOUTING)',
    'spam'
  ),
  -- Excessive punctuation
  (
    'pattern',
    '[!?]{4,}',
    'low',
    'flag',
    true,
    'Excessive punctuation (!!! or ???)',
    'spam'
  );

-- =====================================================
-- CATEGORY 6: FINANCIAL SCAMS
-- =====================================================
-- Severity: HIGH (protect users from scams)
-- Action: Block immediately

INSERT INTO moderation_rules (rule_type, pattern, severity, action, is_active, description, category)
VALUES
  -- Money requests
  (
    'keyword',
    '\b(send[- ]?money|wire[- ]?transfer|western[- ]?union|moneygram|bitcoin|crypto|paypal[- ]?me)\b',
    'high',
    'block',
    true,
    'Money transfer requests (scam protection)',
    'financial_scams'
  ),
  -- Financial emergencies
  (
    'keyword',
    '\b(emergency|urgent|hospital|stranded|visa[- ]?fee|travel[- ]?money)\b',
    'high',
    'escalate',
    true,
    'Financial emergency requests (common scam pattern)',
    'financial_scams'
  ),
  -- Investment scams
  (
    'keyword',
    '\b(investment|business[- ]?opportunity|get[- ]?rich|passive[- ]?income|mlm|pyramid)\b',
    'high',
    'block',
    true,
    'Investment/MLM schemes',
    'financial_scams'
  );

-- =====================================================
-- CATEGORY 7: HARASSMENT & HATE SPEECH
-- =====================================================
-- Severity: CRITICAL (zero tolerance)
-- Action: Block + escalate

INSERT INTO moderation_rules (rule_type, pattern, severity, action, is_active, description, category)
VALUES
  -- Insults and profanity (English)
  (
    'keyword',
    '\b(fuck|shit|bitch|bastard|asshole|damn|hell|crap)\b',
    'high',
    'block',
    true,
    'Profanity and insults (English)',
    'harassment'
  ),
  -- Insults and profanity (French)
  (
    'keyword',
    '\b(merde|putain|connard|salope|enculé|bordel)\b',
    'high',
    'block',
    true,
    'Profanity and insults (French)',
    'harassment'
  ),
  -- Threats
  (
    'keyword',
    '\b(kill|murder|hurt|attack|revenge|destroy|die)\b',
    'critical',
    'escalate',
    true,
    'Threats and violent language',
    'harassment'
  ),
  -- Racial/religious hate speech
  (
    'keyword',
    '\b(terrorist|extremist|jihadi|infidel|kafir)\b',
    'critical',
    'escalate',
    true,
    'Religious hate speech and stereotypes',
    'harassment'
  );

-- =====================================================
-- CATEGORY 8: MARRIAGE/DOWRY COMMERCIALIZATION
-- =====================================================
-- Severity: HIGH (protect Islamic marriage values)
-- Action: Warn + flag for admin review

INSERT INTO moderation_rules (rule_type, pattern, severity, action, is_active, description, category)
VALUES
  -- Dowry demands
  (
    'keyword',
    '\b(dowry[- ]?required|mahr[- ]?must[- ]?be|minimum[- ]?dowry|dowry[- ]?negotiable)\b',
    'high',
    'warn',
    true,
    'Excessive dowry demands (commercialization)',
    'marriage_commercialization'
  ),
  -- Wealth requirements
  (
    'keyword',
    '\b(must[- ]?be[- ]?rich|minimum[- ]?salary|income[- ]?requirement|gold[- ]?digger)\b',
    'medium',
    'flag',
    true,
    'Excessive wealth requirements',
    'marriage_commercialization'
  );

-- =====================================================
-- CATEGORY 9: IMPERSONATION & FAKE PROFILES
-- =====================================================
-- Severity: CRITICAL (platform integrity)
-- Action: Escalate to admin

INSERT INTO moderation_rules (rule_type, pattern, severity, action, is_active, description, category)
VALUES
  -- Celebrity names (common impersonation)
  (
    'keyword',
    '\b(sheikh|imam|doctor|ceo|prince|princess|model|actor|actress)\b',
    'low',
    'flag',
    true,
    'Potential impersonation or fake credentials',
    'impersonation'
  ),
  -- Stock photos indicators
  (
    'keyword',
    '\b(professional[- ]?model|stock[- ]?photo|internet[- ]?image)\b',
    'medium',
    'escalate',
    true,
    'Admission of using fake photos',
    'impersonation'
  );

-- =====================================================
-- CATEGORY 10: POSITIVE ISLAMIC CONTENT (WHITELIST)
-- =====================================================
-- Severity: NONE (explicitly allowed)
-- Action: Allow (no action needed, included for documentation)

-- Note: These patterns are informational and don't require moderation rules,
-- but they help identify positive Islamic content in analytics

/*
POSITIVE PATTERNS (No rules needed, automatically allowed):
- Salat/Prayer references
- Quran/Hadith mentions
- Ramadan/Eid greetings
- Islamic values (honesty, kindness, respect)
- Halal food preferences
- Hijab/modest dress
- Dua requests
- Islamic education
*/

-- =====================================================
-- PERFORMANCE INDEXES FOR MODERATION RULES
-- =====================================================

-- Index for active rules lookup
CREATE INDEX IF NOT EXISTS idx_moderation_rules_active
  ON moderation_rules(is_active, category)
  WHERE is_active = true;

-- Index for severity-based filtering
CREATE INDEX IF NOT EXISTS idx_moderation_rules_severity
  ON moderation_rules(severity, action)
  WHERE is_active = true;

-- =====================================================
-- STATISTICS UPDATE
-- =====================================================

ANALYZE moderation_rules;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Count rules by category and severity
SELECT
  category,
  severity,
  action,
  COUNT(*) as rule_count
FROM moderation_rules
WHERE is_active = true
GROUP BY category, severity, action
ORDER BY
  CASE severity
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END,
  category;

-- =====================================================
-- EXPECTED OUTPUT
-- =====================================================

/*
After running this migration, you should have approximately:

CATEGORY                          | COUNT
----------------------------------|------
inappropriate_relationships       |   3
non_islamic_activities           |   3
explicit_content                 |   3
external_contact                 |   4
spam                             |   4
financial_scams                  |   3
harassment                       |   4
marriage_commercialization       |   2
impersonation                    |   2

TOTAL RULES: ~28 active rules

SEVERITY DISTRIBUTION:
- Critical: ~6 rules
- High:     ~10 rules
- Medium:   ~8 rules
- Low:      ~4 rules

ACTION DISTRIBUTION:
- block:          ~12 rules (immediate blocking)
- escalate:       ~6 rules (admin review)
- warn:           ~6 rules (user warning)
- auto_moderate:  ~3 rules (auto-filter)
- flag:           ~1 rule (log for analytics)
*/
