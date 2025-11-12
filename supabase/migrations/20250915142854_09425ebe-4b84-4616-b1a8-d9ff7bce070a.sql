-- Ajouter une table pour gérer les statuts des utilisateurs (blocage, suspension, etc.)
CREATE TABLE public.user_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'blocked', 'banned')),
  reason TEXT,
  admin_notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id)
);

-- Activer RLS sur la table user_status
ALTER TABLE public.user_status ENABLE ROW LEVEL SECURITY;

-- Politique pour que les admins puissent gérer tous les statuts
CREATE POLICY "Admins can manage all user status"
ON public.user_status
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Politique pour que les utilisateurs puissent voir leur propre statut
CREATE POLICY "Users can view their own status"
ON public.user_status
FOR SELECT
USING (auth.uid() = user_id);

-- Fonction pour créer automatiquement un statut 'active' pour les nouveaux utilisateurs
CREATE OR REPLACE FUNCTION public.handle_new_user_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_status (user_id, status)
  VALUES (NEW.id, 'active')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger pour créer automatiquement un statut actif pour les nouveaux utilisateurs
CREATE TRIGGER on_auth_user_created_status
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_status();

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_user_status_updated_at
  BEFORE UPDATE ON public.user_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer les statuts pour les utilisateurs existants
INSERT INTO public.user_status (user_id, status)
SELECT auth.users.id, 'active'
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;