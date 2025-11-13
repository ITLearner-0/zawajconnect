-- Create messages table with proper schema and RLS
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  encrypted BOOLEAN DEFAULT true,
  message_type TEXT DEFAULT 'text',
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Users can view messages in their matches"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.matches m
    WHERE m.id = messages.match_id
    AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages in their matches"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.matches m
    WHERE m.id = messages.match_id
    AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    AND m.is_mutual = true
  )
);

CREATE POLICY "Users can update their own messages"
ON public.messages
FOR UPDATE
USING (auth.uid() = sender_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_match_id ON public.messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_match_created ON public.messages(match_id, created_at);

-- Create match_notifications table
CREATE TABLE IF NOT EXISTS public.match_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  match_id UUID,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.match_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications"
ON public.match_notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.match_notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.match_notifications
FOR INSERT
WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_match_notifications_user_id ON public.match_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_match_notifications_created_at ON public.match_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_match_notifications_user_unread ON public.match_notifications(user_id, is_read);

-- Create chat_requests table
CREATE TABLE IF NOT EXISTS public.chat_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  wali_id UUID,
  status TEXT DEFAULT 'pending',
  message TEXT,
  response_message TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view chat requests involving them"
ON public.chat_requests
FOR SELECT
USING (
  auth.uid() = requester_id 
  OR auth.uid() = recipient_id 
  OR auth.uid() = wali_id
);

CREATE POLICY "Users can create chat requests"
ON public.chat_requests
FOR INSERT
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Recipients and walis can update chat requests"
ON public.chat_requests
FOR UPDATE
USING (
  auth.uid() = recipient_id 
  OR auth.uid() = wali_id
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_requests_requester_id ON public.chat_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_chat_requests_recipient_id ON public.chat_requests(recipient_id);
CREATE INDEX IF NOT EXISTS idx_chat_requests_wali_id ON public.chat_requests(wali_id);
CREATE INDEX IF NOT EXISTS idx_chat_requests_status ON public.chat_requests(status);
CREATE INDEX IF NOT EXISTS idx_chat_requests_requested_at ON public.chat_requests(requested_at);
CREATE INDEX IF NOT EXISTS idx_chat_requests_recipient_status ON public.chat_requests(recipient_id, status);

-- Update video_calls table to use start_time instead of started_at
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'video_calls' 
    AND column_name = 'started_at'
  ) THEN
    ALTER TABLE public.video_calls RENAME COLUMN started_at TO start_time;
  END IF;
END $$;

-- Add start_time if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'video_calls' 
    AND column_name = 'start_time'
  ) THEN
    ALTER TABLE public.video_calls ADD COLUMN start_time TIMESTAMP WITH TIME ZONE DEFAULT now();
  END IF;
END $$;