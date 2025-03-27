
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
