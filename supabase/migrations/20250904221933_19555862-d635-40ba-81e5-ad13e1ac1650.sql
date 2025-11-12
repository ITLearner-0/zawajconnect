-- Enhanced Family Supervision System Database Schema

-- Add family approval columns to matches table
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS family_approved boolean DEFAULT NULL,
ADD COLUMN IF NOT EXISTS family_notes text,
ADD COLUMN IF NOT EXISTS family_reviewed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS family_reviewer_id uuid;

-- Create family_reviews table for tracking individual family member reviews
CREATE TABLE IF NOT EXISTS public.family_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  family_member_id uuid NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'needs_discussion')),
  notes text,
  reviewed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(match_id, family_member_id)
);

-- Enable RLS on family_reviews
ALTER TABLE public.family_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for family_reviews
CREATE POLICY "Family members can create their own reviews"
ON public.family_reviews
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.family_members fm
    WHERE fm.id = family_member_id 
    AND fm.user_id IN (
      SELECT m.user1_id FROM public.matches m WHERE m.id = match_id
    )
  )
);

CREATE POLICY "Family members can view reviews for their supervised users"
ON public.family_reviews
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.family_members fm
    JOIN public.matches m ON fm.user_id = m.user1_id
    WHERE m.id = match_id
  )
);

CREATE POLICY "Family members can update their own reviews"
ON public.family_reviews
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.family_members fm
    WHERE fm.id = family_member_id
  )
);

-- Create family_meetings table for scheduling discussions
CREATE TABLE IF NOT EXISTS public.family_meetings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  organizer_id uuid NOT NULL,
  scheduled_datetime timestamp with time zone NOT NULL,
  meeting_type text NOT NULL DEFAULT 'family_discussion',
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  notes text,
  meeting_link text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on family_meetings
ALTER TABLE public.family_meetings ENABLE ROW LEVEL SECURITY;

-- Create policies for family_meetings
CREATE POLICY "Family members can manage meetings for their supervised users"
ON public.family_meetings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.family_members fm
    JOIN public.matches m ON fm.user_id = m.user1_id
    WHERE m.id = match_id
  )
);

-- Create supervision_logs table for audit trail
CREATE TABLE IF NOT EXISTS public.supervision_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supervised_user_id uuid NOT NULL,
  family_member_id uuid NOT NULL,
  action_type text NOT NULL,
  details jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on supervision_logs
ALTER TABLE public.supervision_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for supervision_logs
CREATE POLICY "Family members can view logs for their supervised users"
ON public.supervision_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.family_members fm
    WHERE fm.user_id = supervised_user_id
  )
);

-- Add updated_at triggers
CREATE TRIGGER update_family_reviews_updated_at
BEFORE UPDATE ON public.family_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_family_meetings_updated_at
BEFORE UPDATE ON public.family_meetings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check if user has family supervision enabled
CREATE OR REPLACE FUNCTION public.has_family_supervision(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT allow_family_involvement FROM privacy_settings WHERE user_id = user_uuid),
    false
  )
$$;

-- Create function to get family approval status
CREATE OR REPLACE FUNCTION public.get_family_approval_status(match_uuid uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN family_approved = true THEN 'approved'
      WHEN family_approved = false THEN 'rejected'
      ELSE 'pending'
    END
  FROM matches 
  WHERE id = match_uuid
$$;

-- Create notification trigger for family reviews
CREATE OR REPLACE FUNCTION public.notify_family_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  match_record record;
  supervised_user_id uuid;
BEGIN
  -- Get match and supervised user details
  SELECT m.*, m.user1_id INTO match_record 
  FROM matches m 
  WHERE m.id = NEW.match_id;
  
  supervised_user_id := match_record.user1_id;
  
  -- Notify the supervised user about family review
  PERFORM public.create_notification(
    supervised_user_id,
    'family_review',
    CASE NEW.status
      WHEN 'approved' THEN 'Famille a approuvé le match'
      WHEN 'rejected' THEN 'Famille a des réserves'
      ELSE 'Famille demande une discussion'
    END,
    COALESCE(NEW.notes, 'Votre famille a examiné ce match.'),
    NEW.family_member_id,
    NEW.match_id
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for family review notifications
DROP TRIGGER IF EXISTS trigger_notify_family_review ON public.family_reviews;
CREATE TRIGGER trigger_notify_family_review
AFTER INSERT ON public.family_reviews
FOR EACH ROW
EXECUTE FUNCTION public.notify_family_review();