
-- Create a dedicated wali registration table to track wali signups
CREATE TABLE public.wali_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  relationship_type TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  verification_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  managed_user_emails TEXT[] DEFAULT '{}',
  notes TEXT
);

-- Add RLS policies for wali registrations
ALTER TABLE public.wali_registrations ENABLE ROW LEVEL SECURITY;

-- Walis can view and update their own registration
CREATE POLICY "Walis can manage their own registration" 
  ON public.wali_registrations 
  FOR ALL 
  USING (auth.uid()::text = id::text OR auth.email() = email);

-- Admins can view all wali registrations
CREATE POLICY "Admins can view all wali registrations" 
  ON public.wali_registrations 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

-- Update the existing wali_profiles table to link to auth users properly
ALTER TABLE public.wali_profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS registration_id UUID REFERENCES public.wali_registrations(id);

-- Add a function to handle wali profile creation after auth signup
CREATE OR REPLACE FUNCTION public.handle_new_wali_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if this is a wali registration by looking for metadata
  IF NEW.raw_user_meta_data->>'user_type' = 'wali' THEN
    INSERT INTO public.wali_profiles (
      user_id, 
      first_name, 
      last_name, 
      relationship, 
      contact_information,
      email,
      phone,
      availability_status
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'relationship_type', 'guardian'),
      COALESCE(NEW.raw_user_meta_data->>'contact_phone', ''),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'contact_phone', ''),
      'offline'
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Update the existing trigger to handle wali users
DROP TRIGGER IF EXISTS on_auth_user_created_wali ON auth.users;
CREATE TRIGGER on_auth_user_created_wali
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_wali_user();

-- Create a function to link wali to managed users
CREATE OR REPLACE FUNCTION public.link_wali_to_user(
  wali_user_id UUID,
  managed_user_email TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  managed_user_id UUID;
BEGIN
  -- Find the managed user by email
  SELECT id INTO managed_user_id 
  FROM auth.users 
  WHERE email = managed_user_email;
  
  IF managed_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Update the managed user's profile with wali information
  UPDATE public.profiles 
  SET 
    wali_name = (SELECT first_name || ' ' || last_name FROM public.wali_profiles WHERE user_id = wali_user_id),
    wali_contact = (SELECT contact_information FROM public.wali_profiles WHERE user_id = wali_user_id),
    wali_verified = true
  WHERE id = managed_user_id;
  
  -- Add to wali's managed users list
  UPDATE public.wali_profiles 
  SET managed_users = COALESCE(managed_users, '{}') || ARRAY[managed_user_id::text]
  WHERE user_id = wali_user_id;
  
  RETURN TRUE;
END;
$$;
