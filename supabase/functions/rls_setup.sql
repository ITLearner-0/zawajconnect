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

-- Function to set up profile policies
CREATE OR REPLACE FUNCTION public.setup_profile_policies()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Drop existing policies if any
  DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can view other visible profiles" ON public.profiles;
  
  -- Create policies for profiles table
  CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);
    
  CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);
    
  CREATE POLICY "Users can view other visible profiles"
    ON public.profiles
    FOR SELECT
    USING (
      id != auth.uid() AND 
      is_visible = true AND
      (NOT (auth.uid()::text = ANY(blocked_users)) OR blocked_users IS NULL)
    );
    
  RETURN true;
END;
$$;

-- Function to set up messaging policies
CREATE OR REPLACE FUNCTION public.setup_messaging_policies()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Drop existing policies if any
  DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
  DROP POLICY IF EXISTS "Users can insert conversations they are part of" ON public.conversations;
  DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
  DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
  
  -- Create policies for conversations table
  CREATE POLICY "Users can view their conversations"
    ON public.conversations
    FOR SELECT
    USING (auth.uid()::text = ANY(participants));
    
  CREATE POLICY "Users can insert conversations they are part of"
    ON public.conversations
    FOR INSERT
    WITH CHECK (auth.uid()::text = ANY(participants));
    
  -- Create policies for messages table
  CREATE POLICY "Users can view their messages"
    ON public.messages
    FOR SELECT
    USING (
      conversation_id IN (
        SELECT id FROM public.conversations 
        WHERE auth.uid()::text = ANY(participants)
      )
    );
    
  CREATE POLICY "Users can send messages"
    ON public.messages
    FOR INSERT
    WITH CHECK (
      sender_id = auth.uid() AND
      conversation_id IN (
        SELECT id FROM public.conversations 
        WHERE auth.uid()::text = ANY(participants)
      )
    );
    
  RETURN true;
END;
$$;

-- Function to set up monitoring policies
CREATE OR REPLACE FUNCTION public.setup_monitoring_policies()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Drop existing policies if any
  DROP POLICY IF EXISTS "Users can create content reports" ON public.content_reports;
  DROP POLICY IF EXISTS "Users can view reports they submitted" ON public.content_reports;
  DROP POLICY IF EXISTS "Admins can view all reports" ON public.content_reports;
  
  -- Create policies for content reports
  CREATE POLICY "Users can create content reports"
    ON public.content_reports
    FOR INSERT
    WITH CHECK (reporting_user_id = auth.uid());
    
  CREATE POLICY "Users can view reports they submitted"
    ON public.content_reports
    FOR SELECT
    USING (reporting_user_id = auth.uid());
    
  CREATE POLICY "Admins can view all reports"
    ON public.content_reports
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid() AND raw_app_meta_data->>'role' = 'admin'
      )
    );
    
  -- Monitoring reports policies
  DROP POLICY IF EXISTS "Users can view monitoring reports for their conversations" ON public.monitoring_reports;
  
  CREATE POLICY "Users can view monitoring reports for their conversations"
    ON public.monitoring_reports
    FOR SELECT
    USING (
      conversation_id IN (
        SELECT id FROM public.conversations 
        WHERE auth.uid()::text = ANY(participants)
      )
    );
    
  RETURN true;
END;
$$;

-- Create policies for spatial_ref_sys table
CREATE OR REPLACE FUNCTION public.setup_spatial_policies()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Drop existing policies if any
  DROP POLICY IF EXISTS "Allow read access to spatial_ref_sys" ON public.spatial_ref_sys;
  
  -- Create read-only policy for spatial_ref_sys
  -- This allows authenticated users to read the spatial reference data
  CREATE POLICY "Allow read access to spatial_ref_sys"
    ON public.spatial_ref_sys
    FOR SELECT
    USING (auth.role() = 'authenticated');
    
  RETURN true;
END;
$$;

-- Function to check if RLS policies are properly set up
CREATE OR REPLACE FUNCTION public.check_rls_policies()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rls_enabled_count integer;
  expected_tables integer := 14; -- Updated count with spatial_ref_sys
BEGIN
  -- Count tables with RLS enabled
  SELECT COUNT(*) INTO rls_enabled_count
  FROM pg_tables t
  JOIN pg_class c ON t.tablename = c.relname
  WHERE t.schemaname = 'public'
  AND c.relrowsecurity = true
  AND t.tablename IN (
    'profiles', 'conversations', 'messages', 'compatibility_results',
    'compatibility_scores', 'content_flags', 'content_reports',
    'monitoring_reports', 'wali_profiles', 'chat_requests',
    'supervision_sessions', 'video_calls', 'user_sessions', 'spatial_ref_sys'
  );
  
  -- Check if all expected tables have RLS enabled
  RETURN rls_enabled_count = expected_tables;
END;
$$;
