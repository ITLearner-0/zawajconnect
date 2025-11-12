-- Créer la table wali_email_history pour logger tous les emails
CREATE TABLE IF NOT EXISTS public.wali_email_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wali_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sent_by UUID NOT NULL REFERENCES auth.users(id),
  email_type TEXT NOT NULL CHECK (email_type IN ('contact', 'suspension', 'warning', 'reactivation')),
  subject TEXT NOT NULL,
  message_content TEXT NOT NULL,
  delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
  resend_email_id TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wali_email_history ENABLE ROW LEVEL SECURITY;

-- Policy pour les admins peuvent voir tous les emails
CREATE POLICY "Admins can view all email history"
ON public.wali_email_history
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Policy pour les Walis peuvent voir leurs propres emails
CREATE POLICY "Walis can view their own email history"
ON public.wali_email_history
FOR SELECT
TO authenticated
USING (auth.uid() = wali_user_id);

-- Policy pour le système (service role) peut insérer
CREATE POLICY "Service role can insert email history"
ON public.wali_email_history
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy pour les admins peuvent mettre à jour le statut
CREATE POLICY "Admins can update email delivery status"
ON public.wali_email_history
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Index pour améliorer les performances
CREATE INDEX idx_wali_email_history_wali_user ON public.wali_email_history(wali_user_id);
CREATE INDEX idx_wali_email_history_sent_by ON public.wali_email_history(sent_by);
CREATE INDEX idx_wali_email_history_email_type ON public.wali_email_history(email_type);
CREATE INDEX idx_wali_email_history_delivery_status ON public.wali_email_history(delivery_status);
CREATE INDEX idx_wali_email_history_sent_at ON public.wali_email_history(sent_at DESC);

-- Fonction pour récupérer l'historique d'emails d'un Wali avec infos de l'expéditeur
CREATE OR REPLACE FUNCTION public.get_wali_email_history(
  p_wali_user_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  wali_user_id UUID,
  sent_by UUID,
  sender_name TEXT,
  email_type TEXT,
  subject TEXT,
  message_content TEXT,
  delivery_status TEXT,
  error_message TEXT,
  metadata JSONB,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérifier que l'utilisateur est admin ou le Wali concerné
  IF NOT (is_admin(auth.uid()) OR auth.uid() = p_wali_user_id) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins or the Wali can view email history';
  END IF;

  RETURN QUERY
  SELECT 
    eh.id,
    eh.wali_user_id,
    eh.sent_by,
    p.full_name as sender_name,
    eh.email_type,
    eh.subject,
    eh.message_content,
    eh.delivery_status,
    eh.error_message,
    eh.metadata,
    eh.sent_at,
    eh.delivered_at,
    eh.opened_at,
    eh.clicked_at
  FROM public.wali_email_history eh
  LEFT JOIN public.profiles p ON p.id = eh.sent_by
  WHERE eh.wali_user_id = p_wali_user_id
  ORDER BY eh.sent_at DESC
  LIMIT p_limit;
END;
$$;

-- Fonction pour obtenir les statistiques d'emails d'un Wali
CREATE OR REPLACE FUNCTION public.get_wali_email_stats(p_wali_user_id UUID)
RETURNS TABLE (
  total_emails BIGINT,
  sent_count BIGINT,
  delivered_count BIGINT,
  failed_count BIGINT,
  opened_count BIGINT,
  clicked_count BIGINT,
  last_email_sent_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can view email statistics';
  END IF;

  RETURN QUERY
  SELECT
    COUNT(*) as total_emails,
    COUNT(*) FILTER (WHERE delivery_status = 'sent' OR delivery_status = 'delivered') as sent_count,
    COUNT(*) FILTER (WHERE delivery_status = 'delivered') as delivered_count,
    COUNT(*) FILTER (WHERE delivery_status = 'failed' OR delivery_status = 'bounced') as failed_count,
    COUNT(*) FILTER (WHERE opened_at IS NOT NULL) as opened_count,
    COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) as clicked_count,
    MAX(sent_at) as last_email_sent_at
  FROM public.wali_email_history
  WHERE wali_user_id = p_wali_user_id;
END;
$$;