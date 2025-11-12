-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true);

-- Create storage policies for profile photos
CREATE POLICY "Anyone can view profile photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can upload their own profile photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('new_match', 'new_message', 'profile_view', 'mutual_like')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  related_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  related_match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  target_user_id UUID,
  notification_type TEXT,
  notification_title TEXT,
  notification_content TEXT,
  sender_user_id UUID DEFAULT NULL,
  match_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    content,
    related_user_id,
    related_match_id
  ) VALUES (
    target_user_id,
    notification_type,
    notification_title,
    notification_content,
    sender_user_id,
    match_id
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger function for new matches
CREATE OR REPLACE FUNCTION public.notify_new_match()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify when a match becomes mutual
  IF NEW.is_mutual = true AND OLD.is_mutual = false THEN
    -- Notify both users
    PERFORM public.create_notification(
      NEW.user1_id,
      'mutual_like',
      'Nouveau match !',
      'Vous avez un nouveau match mutuel ! Commencez à discuter.',
      NEW.user2_id,
      NEW.id
    );
    
    PERFORM public.create_notification(
      NEW.user2_id,
      'mutual_like',
      'Nouveau match !',
      'Vous avez un nouveau match mutuel ! Commencez à discuter.',
      NEW.user1_id,
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for new matches
CREATE TRIGGER notify_match_update
  AFTER UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_match();

-- Trigger function for new messages
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  match_record RECORD;
  recipient_id UUID;
BEGIN
  -- Get match details
  SELECT * INTO match_record FROM public.matches WHERE id = NEW.match_id;
  
  -- Determine recipient
  recipient_id := CASE 
    WHEN match_record.user1_id = NEW.sender_id THEN match_record.user2_id
    ELSE match_record.user1_id
  END;
  
  -- Create notification for recipient
  PERFORM public.create_notification(
    recipient_id,
    'new_message',
    'Nouveau message',
    'Vous avez reçu un nouveau message.',
    NEW.sender_id,
    NEW.match_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for new messages
CREATE TRIGGER notify_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_message();