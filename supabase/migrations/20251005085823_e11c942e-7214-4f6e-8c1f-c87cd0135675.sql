-- Table pour tracker les vues de profils quotidiennes
CREATE TABLE IF NOT EXISTS public.profile_views_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_user_id UUID NOT NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour requêtes optimisées par user et date
CREATE INDEX idx_profile_views_daily_user_viewed 
ON public.profile_views_daily(user_id, viewed_at DESC);

-- RLS : Les utilisateurs peuvent voir uniquement leurs propres vues
ALTER TABLE public.profile_views_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile views"
ON public.profile_views_daily
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own profile views"
ON public.profile_views_daily
FOR INSERT
WITH CHECK (auth.uid() = user_id);