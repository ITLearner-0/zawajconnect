
-- Table pour la vérification des relations familiales
CREATE TABLE public.family_relationship_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wali_id UUID NOT NULL REFERENCES public.wali_profiles(id) ON DELETE CASCADE,
  managed_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('father', 'brother', 'uncle', 'grandfather', 'other')),
  verification_method TEXT NOT NULL CHECK (verification_method IN ('document', 'witness', 'community', 'self_declaration')),
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'requires_review')),
  documents_submitted TEXT[] DEFAULT '{}',
  witness_contacts TEXT[] DEFAULT '{}',
  community_references TEXT[] DEFAULT '{}',
  verification_notes TEXT NOT NULL DEFAULT '',
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour le progrès de formation des walis
CREATE TABLE public.wali_onboarding_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wali_id UUID NOT NULL REFERENCES public.wali_profiles(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed')),
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  quiz_score INTEGER CHECK (quiz_score >= 0 AND quiz_score <= 100),
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(wali_id, module_id)
);

-- Table pour les délégations de wali
CREATE TABLE public.wali_delegations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  primary_wali_id UUID NOT NULL REFERENCES public.wali_profiles(id) ON DELETE CASCADE,
  delegate_wali_id UUID NOT NULL REFERENCES public.wali_profiles(id) ON DELETE CASCADE,
  managed_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delegation_type TEXT NOT NULL CHECK (delegation_type IN ('temporary', 'emergency', 'specific_event')),
  permissions JSONB NOT NULL DEFAULT '[]',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'revoked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  activated_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  CHECK (end_date > start_date),
  CHECK (primary_wali_id != delegate_wali_id)
);

-- Table pour les filtres avancés des walis
CREATE TABLE public.wali_filters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wali_id UUID NOT NULL REFERENCES public.wali_profiles(id) ON DELETE CASCADE,
  filter_name TEXT NOT NULL,
  filter_type TEXT NOT NULL CHECK (filter_type IN ('content', 'behavior', 'time', 'contact')),
  filter_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.family_relationship_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wali_onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wali_delegations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wali_filters ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour family_relationship_verifications
CREATE POLICY "Walis can view their own verification requests"
  ON public.family_relationship_verifications
  FOR SELECT
  USING (
    wali_id IN (SELECT id FROM public.wali_profiles WHERE user_id = auth.uid()) OR
    managed_user_id = auth.uid()
  );

CREATE POLICY "Walis can create verification requests"
  ON public.family_relationship_verifications
  FOR INSERT
  WITH CHECK (wali_id IN (SELECT id FROM public.wali_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Walis can update their own verification requests"
  ON public.family_relationship_verifications
  FOR UPDATE
  USING (wali_id IN (SELECT id FROM public.wali_profiles WHERE user_id = auth.uid()));

-- Politiques RLS pour wali_onboarding_progress
CREATE POLICY "Walis can view their own onboarding progress"
  ON public.wali_onboarding_progress
  FOR SELECT
  USING (wali_id IN (SELECT id FROM public.wali_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Walis can update their own onboarding progress"
  ON public.wali_onboarding_progress
  FOR ALL
  USING (wali_id IN (SELECT id FROM public.wali_profiles WHERE user_id = auth.uid()));

-- Politiques RLS pour wali_delegations
CREATE POLICY "Walis can view delegations involving them"
  ON public.wali_delegations
  FOR SELECT
  USING (
    primary_wali_id IN (SELECT id FROM public.wali_profiles WHERE user_id = auth.uid()) OR
    delegate_wali_id IN (SELECT id FROM public.wali_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Primary walis can create delegations"
  ON public.wali_delegations
  FOR INSERT
  WITH CHECK (primary_wali_id IN (SELECT id FROM public.wali_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Walis can update delegations involving them"
  ON public.wali_delegations
  FOR UPDATE
  USING (
    primary_wali_id IN (SELECT id FROM public.wali_profiles WHERE user_id = auth.uid()) OR
    delegate_wali_id IN (SELECT id FROM public.wali_profiles WHERE user_id = auth.uid())
  );

-- Politiques RLS pour wali_filters
CREATE POLICY "Walis can manage their own filters"
  ON public.wali_filters
  FOR ALL
  USING (wali_id IN (SELECT id FROM public.wali_profiles WHERE user_id = auth.uid()));

-- Index pour améliorer les performances
CREATE INDEX idx_family_verifications_wali_id ON public.family_relationship_verifications(wali_id);
CREATE INDEX idx_family_verifications_managed_user_id ON public.family_relationship_verifications(managed_user_id);
CREATE INDEX idx_onboarding_progress_wali_id ON public.wali_onboarding_progress(wali_id);
CREATE INDEX idx_delegations_primary_wali_id ON public.wali_delegations(primary_wali_id);
CREATE INDEX idx_delegations_delegate_wali_id ON public.wali_delegations(delegate_wali_id);
CREATE INDEX idx_delegations_status ON public.wali_delegations(status);
CREATE INDEX idx_wali_filters_wali_id ON public.wali_filters(wali_id);
CREATE INDEX idx_wali_filters_active ON public.wali_filters(is_active);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_family_verifications_updated_at 
    BEFORE UPDATE ON public.family_relationship_verifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_progress_updated_at 
    BEFORE UPDATE ON public.wali_onboarding_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wali_filters_updated_at 
    BEFORE UPDATE ON public.wali_filters 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
