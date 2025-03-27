
-- Function to enable RLS on all important tables
CREATE OR REPLACE FUNCTION public.enable_rls_on_tables()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Enable RLS on profiles table
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  
  -- Enable RLS on conversations table
  ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
  
  -- Enable RLS on messages table
  ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
  
  -- Enable RLS on compatibility tables
  ALTER TABLE public.compatibility_results ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.compatibility_scores ENABLE ROW LEVEL SECURITY;
  
  -- Enable RLS on monitoring tables
  ALTER TABLE public.content_flags ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.monitoring_reports ENABLE ROW LEVEL SECURITY;
  
  -- Enable RLS on wali tables
  ALTER TABLE public.wali_profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.chat_requests ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.supervision_sessions ENABLE ROW LEVEL SECURITY;
  
  -- Enable RLS on video calls
  ALTER TABLE public.video_calls ENABLE ROW LEVEL SECURITY;
  
  -- Enable RLS on user_sessions for online status
  ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
  
  -- Enable RLS on spatial_ref_sys table
  ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;
  
  RETURN true;
END;
$$;
