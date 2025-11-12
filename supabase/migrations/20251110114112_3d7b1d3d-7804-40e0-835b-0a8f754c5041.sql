-- Create email_ab_tests table to manage different email variants
CREATE TABLE IF NOT EXISTS public.email_ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name TEXT NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('7days', '3days', '1day')),
  variant_name TEXT NOT NULL,
  subject_line TEXT NOT NULL,
  offer_percentage INTEGER NOT NULL,
  promo_code TEXT NOT NULL,
  email_tone TEXT NOT NULL CHECK (email_tone IN ('friendly', 'urgent', 'professional', 'dramatic')),
  cta_text TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  traffic_allocation INTEGER NOT NULL DEFAULT 50 CHECK (traffic_allocation >= 0 AND traffic_allocation <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  notes TEXT,
  UNIQUE(test_name, variant_name)
);

-- Create email_ab_test_results table to track performance
CREATE TABLE IF NOT EXISTS public.email_ab_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ab_test_id UUID NOT NULL REFERENCES public.email_ab_tests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  subscription_id UUID NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  renewed_at TIMESTAMP WITH TIME ZONE,
  renewal_amount DECIMAL(10,2),
  promo_code_used TEXT,
  days_until_expiry INTEGER NOT NULL,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_ab_test_results_ab_test_id ON public.email_ab_test_results(ab_test_id);
CREATE INDEX idx_ab_test_results_user_id ON public.email_ab_test_results(user_id);
CREATE INDEX idx_ab_test_results_sent_at ON public.email_ab_test_results(sent_at);
CREATE INDEX idx_ab_test_results_renewed_at ON public.email_ab_test_results(renewed_at);

-- Create view for A/B test analytics
CREATE OR REPLACE VIEW public.email_ab_test_analytics AS
SELECT 
  abt.id,
  abt.test_name,
  abt.variant_name,
  abt.reminder_type,
  abt.subject_line,
  abt.offer_percentage,
  abt.email_tone,
  abt.traffic_allocation,
  COUNT(abr.id) as total_sent,
  COUNT(abr.opened_at) as total_opened,
  COUNT(abr.clicked_at) as total_clicked,
  COUNT(abr.renewed_at) as total_renewed,
  SUM(abr.renewal_amount) as total_revenue,
  ROUND(COUNT(abr.opened_at)::NUMERIC / NULLIF(COUNT(abr.id), 0) * 100, 2) as open_rate,
  ROUND(COUNT(abr.clicked_at)::NUMERIC / NULLIF(COUNT(abr.id), 0) * 100, 2) as click_rate,
  ROUND(COUNT(abr.renewed_at)::NUMERIC / NULLIF(COUNT(abr.id), 0) * 100, 2) as conversion_rate,
  ROUND(SUM(abr.renewal_amount) / NULLIF(COUNT(abr.id), 0), 2) as revenue_per_email,
  abt.is_active,
  abt.created_at
FROM public.email_ab_tests abt
LEFT JOIN public.email_ab_test_results abr ON abt.id = abr.ab_test_id
GROUP BY abt.id, abt.test_name, abt.variant_name, abt.reminder_type, 
         abt.subject_line, abt.offer_percentage, abt.email_tone, 
         abt.traffic_allocation, abt.is_active, abt.created_at;

-- Enable RLS
ALTER TABLE public.email_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_ab_test_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_ab_tests
CREATE POLICY "Admins can manage A/B tests"
  ON public.email_ab_tests
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "System can read active A/B tests"
  ON public.email_ab_tests
  FOR SELECT
  USING (is_active = true);

-- RLS Policies for email_ab_test_results
CREATE POLICY "Admins can view A/B test results"
  ON public.email_ab_test_results
  FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "System can insert A/B test results"
  ON public.email_ab_test_results
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own A/B test results"
  ON public.email_ab_test_results
  FOR SELECT
  USING (auth.uid() = user_id);

-- Function to select A/B test variant based on traffic allocation
CREATE OR REPLACE FUNCTION public.select_ab_test_variant(p_reminder_type TEXT)
RETURNS TABLE(
  ab_test_id UUID,
  variant_name TEXT,
  subject_line TEXT,
  offer_percentage INTEGER,
  promo_code TEXT,
  email_tone TEXT,
  cta_text TEXT
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_random INTEGER;
  v_cumulative INTEGER := 0;
  v_variant RECORD;
BEGIN
  -- Generate random number between 1 and 100
  v_random := floor(random() * 100 + 1)::INTEGER;
  
  -- Get variants ordered by traffic allocation
  FOR v_variant IN 
    SELECT 
      id,
      variant_name,
      subject_line,
      offer_percentage,
      promo_code,
      email_tone,
      cta_text,
      traffic_allocation
    FROM public.email_ab_tests
    WHERE reminder_type = p_reminder_type 
      AND is_active = true
    ORDER BY created_at
  LOOP
    v_cumulative := v_cumulative + v_variant.traffic_allocation;
    
    IF v_random <= v_cumulative THEN
      RETURN QUERY SELECT 
        v_variant.id,
        v_variant.variant_name,
        v_variant.subject_line,
        v_variant.offer_percentage,
        v_variant.promo_code,
        v_variant.email_tone,
        v_variant.cta_text;
      RETURN;
    END IF;
  END LOOP;
  
  -- Fallback to first variant if no match
  RETURN QUERY 
  SELECT 
    id,
    variant_name,
    subject_line,
    offer_percentage,
    promo_code,
    email_tone,
    cta_text
  FROM public.email_ab_tests
  WHERE reminder_type = p_reminder_type 
    AND is_active = true
  LIMIT 1;
END;
$$;

-- Insert default A/B test variants for each reminder type
INSERT INTO public.email_ab_tests (test_name, reminder_type, variant_name, subject_line, offer_percentage, promo_code, email_tone, cta_text, traffic_allocation, notes) VALUES
-- 7 days variants
('7days_test_v1', '7days', 'control', '⏰ Votre abonnement expire dans 7 jours - Offre de renouvellement', 10, 'RENOUVELLEMENT10', 'friendly', '🎁 Renouveler Maintenant', 50, 'Version originale friendly'),
('7days_test_v1', '7days', 'urgent', '🚨 ALERTE : Plus que 7 jours avant expiration !', 15, 'URGENCE15', 'urgent', '⚡ Profiter de l''Offre', 50, 'Version urgente avec meilleure offre'),

-- 3 days variants
('3days_test_v1', '3days', 'control', '⚠️ Attention : 3 jours avant expiration', 10, 'RENOUVELLEMENT10', 'professional', '📋 Renouveler Mon Abonnement', 50, 'Version professionnelle'),
('3days_test_v1', '3days', 'dramatic', '🔴 URGENT : Il ne reste que 3 JOURS !', 15, 'DERNIER15', 'dramatic', '🔥 AGIR MAINTENANT', 50, 'Version dramatique'),

-- 1 day variants
('1day_test_v1', '1day', 'control', '🚨 DERNIÈRE CHANCE - Expiration demain !', 15, 'RENOUVELLEMENT15', 'urgent', '🔥 Renouveler Immédiatement', 50, 'Version contrôle urgente'),
('1day_test_v1', '1day', 'extreme', '⏰💥 C''EST MAINTENANT OU JAMAIS - DEMAIN IL SERA TROP TARD', 20, 'LASTCHANCE20', 'dramatic', '🚀 SAUVER MON ABONNEMENT', 50, 'Version extrême avec meilleure offre');

COMMENT ON TABLE public.email_ab_tests IS 'Stores different variants for A/B testing email reminders';
COMMENT ON TABLE public.email_ab_test_results IS 'Tracks performance metrics for each A/B test variant';
COMMENT ON VIEW public.email_ab_test_analytics IS 'Provides aggregated analytics for A/B test performance';