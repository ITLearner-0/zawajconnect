-- Ajouter le statut 'deleted' pour permettre la suppression soft des utilisateurs
ALTER TABLE public.user_status 
DROP CONSTRAINT IF EXISTS user_status_status_check;

ALTER TABLE public.user_status 
ADD CONSTRAINT user_status_status_check 
CHECK (status IN ('active', 'suspended', 'blocked', 'banned', 'deleted'));