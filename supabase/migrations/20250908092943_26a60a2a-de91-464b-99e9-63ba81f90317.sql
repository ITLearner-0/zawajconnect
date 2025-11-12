-- Optimiser la fonction handle_new_user_complete pour éviter les lenteurs
CREATE OR REPLACE FUNCTION public.handle_new_user_complete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Utiliser une seule transaction avec des UPSERT optimisés
  
  -- 1. Profile avec UPSERT optimisé
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''))
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = COALESCE(NEW.raw_user_meta_data ->> 'full_name', profiles.full_name)
  WHERE profiles.full_name IS NULL OR profiles.full_name = '';
  
  -- 2. Islamic preferences avec UPSERT simple
  INSERT INTO public.islamic_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- 3. User verifications avec email vérifié
  INSERT INTO public.user_verifications (user_id, email_verified)
  VALUES (NEW.id, NEW.email_confirmed_at IS NOT NULL)
  ON CONFLICT (user_id) DO UPDATE SET
    email_verified = NEW.email_confirmed_at IS NOT NULL
  WHERE user_verifications.email_verified = false;
  
  -- 4. Privacy settings avec défauts
  INSERT INTO public.privacy_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- 5. User settings avec défauts
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- 6. Rôle utilisateur par défaut
  INSERT INTO public.user_roles (user_id, role, assigned_by)
  VALUES (NEW.id, 'user', NEW.id)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log l'erreur mais ne bloque pas l'inscription
    RAISE WARNING 'Erreur dans handle_new_user_complete pour user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;