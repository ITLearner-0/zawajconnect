
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
