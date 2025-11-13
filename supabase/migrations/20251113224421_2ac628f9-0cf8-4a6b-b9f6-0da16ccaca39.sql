-- Table pour les commentaires sur les inscriptions Wali
CREATE TABLE IF NOT EXISTS public.wali_registration_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES public.wali_registrations(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table pour l'historique des actions sur les inscriptions Wali
CREATE TABLE IF NOT EXISTS public.wali_registration_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES public.wali_registrations(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  action_description TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_wali_comments_registration ON public.wali_registration_comments(registration_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wali_activity_registration ON public.wali_registration_activity_log(registration_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wali_comments_admin ON public.wali_registration_comments(admin_id);
CREATE INDEX IF NOT EXISTS idx_wali_activity_admin ON public.wali_registration_activity_log(admin_id);

-- Enable RLS
ALTER TABLE public.wali_registration_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wali_registration_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour les commentaires
DROP POLICY IF EXISTS "Admins can view all comments" ON public.wali_registration_comments;
CREATE POLICY "Admins can view all comments"
  ON public.wali_registration_comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Admins can add comments" ON public.wali_registration_comments;
CREATE POLICY "Admins can add comments"
  ON public.wali_registration_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
    AND admin_id = auth.uid()
  );

DROP POLICY IF EXISTS "Admins can update their own comments" ON public.wali_registration_comments;
CREATE POLICY "Admins can update their own comments"
  ON public.wali_registration_comments
  FOR UPDATE
  TO authenticated
  USING (
    admin_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (admin_id = auth.uid());

DROP POLICY IF EXISTS "Admins can delete their own comments" ON public.wali_registration_comments;
CREATE POLICY "Admins can delete their own comments"
  ON public.wali_registration_comments
  FOR DELETE
  TO authenticated
  USING (
    admin_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies pour l'historique
DROP POLICY IF EXISTS "Admins can view activity log" ON public.wali_registration_activity_log;
CREATE POLICY "Admins can view activity log"
  ON public.wali_registration_activity_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "System can log activities" ON public.wali_registration_activity_log;
CREATE POLICY "System can log activities"
  ON public.wali_registration_activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Fonction pour logger automatiquement les changements de statut
CREATE OR REPLACE FUNCTION public.log_wali_registration_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status changes
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.wali_registration_activity_log (
      registration_id,
      admin_id,
      action_type,
      action_description,
      old_value,
      new_value
    ) VALUES (
      NEW.id,
      auth.uid(),
      'status_change',
      'Changement de statut de ' || OLD.status || ' à ' || NEW.status,
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status)
    );
  END IF;

  -- Log verification notes changes
  IF (TG_OP = 'UPDATE' AND OLD.verification_notes IS DISTINCT FROM NEW.verification_notes) THEN
    INSERT INTO public.wali_registration_activity_log (
      registration_id,
      admin_id,
      action_type,
      action_description,
      old_value,
      new_value
    ) VALUES (
      NEW.id,
      auth.uid(),
      'notes_update',
      'Mise à jour des notes de vérification',
      jsonb_build_object('notes', OLD.verification_notes),
      jsonb_build_object('notes', NEW.verification_notes)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger pour capturer les changements
DROP TRIGGER IF EXISTS log_wali_registration_changes ON public.wali_registrations;
CREATE TRIGGER log_wali_registration_changes
  AFTER UPDATE ON public.wali_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.log_wali_registration_status_change();

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_wali_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_wali_comment_timestamp ON public.wali_registration_comments;
CREATE TRIGGER update_wali_comment_timestamp
  BEFORE UPDATE ON public.wali_registration_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_wali_comment_updated_at();
