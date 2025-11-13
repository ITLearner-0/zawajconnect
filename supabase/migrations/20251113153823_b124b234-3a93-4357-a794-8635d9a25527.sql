-- Create content_flags table for moderation system
CREATE TABLE IF NOT EXISTS public.content_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('profile', 'message', 'photo', 'bio')),
  flag_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  flagged_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for content_flags
CREATE INDEX IF NOT EXISTS idx_content_flags_flagged_by ON public.content_flags(flagged_by);
CREATE INDEX IF NOT EXISTS idx_content_flags_resolved ON public.content_flags(resolved);
CREATE INDEX IF NOT EXISTS idx_content_flags_severity ON public.content_flags(severity);
CREATE INDEX IF NOT EXISTS idx_content_flags_created_at ON public.content_flags(created_at);

-- Enable RLS for content_flags
ALTER TABLE public.content_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_flags
CREATE POLICY "Users can create content flags"
  ON public.content_flags FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = flagged_by);

CREATE POLICY "Admins can view all content flags"
  ON public.content_flags FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can resolve content flags"
  ON public.content_flags FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Create wali_filters table for advanced filtering system
CREATE TABLE IF NOT EXISTS public.wali_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wali_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filter_name TEXT NOT NULL,
  filter_type TEXT NOT NULL CHECK (filter_type IN ('content', 'behavior', 'time', 'contact')),
  filter_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for wali_filters
CREATE INDEX IF NOT EXISTS idx_wali_filters_wali_id ON public.wali_filters(wali_id);
CREATE INDEX IF NOT EXISTS idx_wali_filters_is_active ON public.wali_filters(is_active);

-- Enable RLS for wali_filters
ALTER TABLE public.wali_filters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wali_filters
CREATE POLICY "Walis can manage their own filters"
  ON public.wali_filters FOR ALL
  TO authenticated
  USING (auth.uid() = wali_id)
  WITH CHECK (auth.uid() = wali_id);

-- Create wali_delegations table for delegation system
CREATE TABLE IF NOT EXISTS public.wali_delegations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_wali_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delegate_wali_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  managed_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delegation_type TEXT NOT NULL CHECK (delegation_type IN ('temporary', 'emergency', 'specific_event')),
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'revoked')),
  created_at TIMESTAMPTZ DEFAULT now(),
  activated_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

-- Create indexes for wali_delegations
CREATE INDEX IF NOT EXISTS idx_wali_delegations_primary ON public.wali_delegations(primary_wali_id);
CREATE INDEX IF NOT EXISTS idx_wali_delegations_delegate ON public.wali_delegations(delegate_wali_id);
CREATE INDEX IF NOT EXISTS idx_wali_delegations_status ON public.wali_delegations(status);

-- Enable RLS for wali_delegations
ALTER TABLE public.wali_delegations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wali_delegations
CREATE POLICY "Walis can manage delegations"
  ON public.wali_delegations FOR ALL
  TO authenticated
  USING (auth.uid() = primary_wali_id OR auth.uid() = delegate_wali_id)
  WITH CHECK (auth.uid() = primary_wali_id OR auth.uid() = delegate_wali_id);

-- Create wali_profiles table (extended information for walis)
CREATE TABLE IF NOT EXISTS public.wali_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  contact_information TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for wali_profiles
CREATE INDEX IF NOT EXISTS idx_wali_profiles_user_id ON public.wali_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_wali_profiles_is_verified ON public.wali_profiles(is_verified);

-- Enable RLS for wali_profiles
ALTER TABLE public.wali_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wali_profiles
CREATE POLICY "Users can view their own wali profile"
  ON public.wali_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wali profile"
  ON public.wali_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can create their own wali profile"
  ON public.wali_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create family_relationship_verifications table
CREATE TABLE IF NOT EXISTS public.family_relationship_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wali_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  managed_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('father', 'brother', 'uncle', 'grandfather', 'other')),
  verification_method TEXT NOT NULL CHECK (verification_method IN ('document', 'witness', 'community', 'self_declaration')),
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'requires_review')),
  documents_submitted TEXT[] DEFAULT ARRAY[]::TEXT[],
  witness_contacts TEXT[],
  community_references TEXT[],
  verification_notes TEXT NOT NULL,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for family_relationship_verifications
CREATE INDEX IF NOT EXISTS idx_family_relationship_verifications_wali ON public.family_relationship_verifications(wali_id);
CREATE INDEX IF NOT EXISTS idx_family_relationship_verifications_managed ON public.family_relationship_verifications(managed_user_id);
CREATE INDEX IF NOT EXISTS idx_family_relationship_verifications_status ON public.family_relationship_verifications(verification_status);

-- Enable RLS for family_relationship_verifications
ALTER TABLE public.family_relationship_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for family_relationship_verifications
CREATE POLICY "Walis can manage their verifications"
  ON public.family_relationship_verifications FOR ALL
  TO authenticated
  USING (auth.uid() = wali_id OR auth.uid() = managed_user_id)
  WITH CHECK (auth.uid() = wali_id OR auth.uid() = managed_user_id);

CREATE POLICY "Admins can view all verifications"
  ON public.family_relationship_verifications FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Create security_events table for audit logging
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for security_events
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON public.security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at);

-- Enable RLS for security_events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for security_events
CREATE POLICY "Users can view their own security events"
  ON public.security_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all security events"
  ON public.security_events FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "System can create security events"
  ON public.security_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create sensitive_operations_audit table for high-risk operation tracking
CREATE TABLE IF NOT EXISTS public.sensitive_operations_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL,
  table_accessed TEXT NOT NULL,
  record_id UUID,
  verification_score INTEGER,
  success BOOLEAN NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for sensitive_operations_audit
CREATE INDEX IF NOT EXISTS idx_sensitive_operations_user_id ON public.sensitive_operations_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_sensitive_operations_operation_type ON public.sensitive_operations_audit(operation_type);
CREATE INDEX IF NOT EXISTS idx_sensitive_operations_risk_level ON public.sensitive_operations_audit(risk_level);
CREATE INDEX IF NOT EXISTS idx_sensitive_operations_created_at ON public.sensitive_operations_audit(created_at);

-- Enable RLS for sensitive_operations_audit
ALTER TABLE public.sensitive_operations_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sensitive_operations_audit
CREATE POLICY "Admins can view all sensitive operations"
  ON public.sensitive_operations_audit FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "System can create audit records"
  ON public.sensitive_operations_audit FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create security_audit_log table for comprehensive security auditing
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  additional_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for security_audit_log
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_action_type ON public.security_audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_table_name ON public.security_audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at);

-- Enable RLS for security_audit_log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for security_audit_log
CREATE POLICY "Admins can view all audit logs"
  ON public.security_audit_log FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "System can create audit logs"
  ON public.security_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (true);