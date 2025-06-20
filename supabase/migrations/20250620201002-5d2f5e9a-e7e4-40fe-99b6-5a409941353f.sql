
-- Drop existing policies to avoid conflicts before creating new ones
DROP POLICY IF EXISTS "Users can view their own wali profile" ON public.wali_profiles;
DROP POLICY IF EXISTS "Users can update their own wali profile" ON public.wali_profiles;
DROP POLICY IF EXISTS "Users can insert their own wali profile" ON public.wali_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view other visible profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Enable RLS on all critical tables that don't have it yet
ALTER TABLE public.wali_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wali_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wali_registrations (Admin and related users only)
CREATE POLICY "Only admins can view wali registrations"
  ON public.wali_registrations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admins can insert wali registrations"
  ON public.wali_registrations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admins can update wali registrations"
  ON public.wali_registrations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- RLS Policies for match_notifications (Users can only see their own)
CREATE POLICY "Users can view their own match notifications"
  ON public.match_notifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can create match notifications"
  ON public.match_notifications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own match notifications"
  ON public.match_notifications
  FOR UPDATE
  USING (user_id = auth.uid());

-- RLS Policies for video_calls (Participants only)
CREATE POLICY "Users can view video calls they participate in"
  ON public.video_calls
  FOR SELECT
  USING (
    initiator_id = auth.uid() OR 
    receiver_id = auth.uid() OR
    conversation_id IN (
      SELECT id FROM public.conversations 
      WHERE auth.uid() = ANY(participants::uuid[])
    )
  );

CREATE POLICY "Users can create video calls for their conversations"
  ON public.video_calls
  FOR INSERT
  WITH CHECK (
    initiator_id = auth.uid() AND
    conversation_id IN (
      SELECT id FROM public.conversations 
      WHERE auth.uid() = ANY(participants::uuid[])
    )
  );

CREATE POLICY "Participants can update video calls"
  ON public.video_calls
  FOR UPDATE
  USING (
    initiator_id = auth.uid() OR 
    receiver_id = auth.uid()
  );

-- RLS Policies for subscribers (Users can only access their own subscription data)
CREATE POLICY "Users can view their own subscription data"
  ON public.subscribers
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own subscription data"
  ON public.subscribers
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can create subscription records"
  ON public.subscribers
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Additional security policies for content_flags
CREATE POLICY "Users can create content flags"
  ON public.content_flags
  FOR INSERT
  WITH CHECK (flagged_by = auth.uid());

CREATE POLICY "Users can view their own content reports"
  ON public.content_flags
  FOR SELECT
  USING (flagged_by = auth.uid());

CREATE POLICY "Moderators can view all content flags"
  ON public.content_flags
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Enhanced wali_profiles policies
CREATE POLICY "Users can view their own wali profile"
  ON public.wali_profiles
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own wali profile"
  ON public.wali_profiles
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own wali profile"
  ON public.wali_profiles
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Enhanced profiles policies for security
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can view other visible profiles"
  ON public.profiles
  FOR SELECT
  USING (
    id != auth.uid() AND 
    is_visible = true AND
    (NOT (auth.uid()::text = ANY(blocked_users)) OR blocked_users IS NULL)
  );

-- Messages table enhanced policies
CREATE POLICY "Users can view their messages"
  ON public.messages
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations 
      WHERE auth.uid() = ANY(participants::uuid[])
    )
  );

CREATE POLICY "Users can send messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT id FROM public.conversations 
      WHERE auth.uid() = ANY(participants::uuid[])
    )
  );

-- User roles security
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin'
    )
  );
