-- Add missing columns to moderation_actions table
ALTER TABLE public.moderation_actions 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS reversed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reversal_reason TEXT;

-- Add index on status for better query performance
CREATE INDEX IF NOT EXISTS idx_moderation_actions_status ON public.moderation_actions(status);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_user_status ON public.moderation_actions(user_id, status);

-- Add missing column to moderation_appeals table
ALTER TABLE public.moderation_appeals 
ADD COLUMN IF NOT EXISTS additional_context TEXT;

-- Create user_bans table
CREATE TABLE IF NOT EXISTS public.user_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ban_type TEXT NOT NULL CHECK (ban_type IN ('temporary_ban', 'permanent_ban')),
  reason TEXT NOT NULL,
  banned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  lifted_at TIMESTAMP WITH TIME ZONE,
  lift_reason TEXT,
  banned_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for user_bans
CREATE INDEX IF NOT EXISTS idx_user_bans_user_id ON public.user_bans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bans_is_active ON public.user_bans(is_active);
CREATE INDEX IF NOT EXISTS idx_user_bans_user_active ON public.user_bans(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_bans_expires_at ON public.user_bans(expires_at) WHERE is_active = true;

-- Enable RLS on user_bans
ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_bans
CREATE POLICY "Users can view their own bans"
  ON public.user_bans
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bans"
  ON public.user_bans
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator', 'super_admin')
    )
  );

CREATE POLICY "Admins can create bans"
  ON public.user_bans
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator', 'super_admin')
    )
  );

CREATE POLICY "Admins can update bans"
  ON public.user_bans
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator', 'super_admin')
    )
  );

-- Create appeal_activities table
CREATE TABLE IF NOT EXISTS public.appeal_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appeal_id UUID NOT NULL REFERENCES public.moderation_appeals(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('submitted', 'under_review', 'approved', 'rejected', 'updated', 'commented')),
  performed_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for appeal_activities
CREATE INDEX IF NOT EXISTS idx_appeal_activities_appeal_id ON public.appeal_activities(appeal_id);
CREATE INDEX IF NOT EXISTS idx_appeal_activities_performed_by ON public.appeal_activities(performed_by);
CREATE INDEX IF NOT EXISTS idx_appeal_activities_created_at ON public.appeal_activities(created_at DESC);

-- Enable RLS on appeal_activities
ALTER TABLE public.appeal_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for appeal_activities
CREATE POLICY "Users can view activities for their appeals"
  ON public.appeal_activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.moderation_appeals ma
      WHERE ma.id = appeal_activities.appeal_id
      AND ma.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all appeal activities"
  ON public.appeal_activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator', 'super_admin')
    )
  );

CREATE POLICY "System can create appeal activities"
  ON public.appeal_activities
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update appeal activities"
  ON public.appeal_activities
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator', 'super_admin')
    )
  );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_user_bans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at on user_bans
DROP TRIGGER IF EXISTS update_user_bans_updated_at_trigger ON public.user_bans;
CREATE TRIGGER update_user_bans_updated_at_trigger
  BEFORE UPDATE ON public.user_bans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_bans_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.user_bans IS 'Stores user ban information including temporary and permanent bans';
COMMENT ON TABLE public.appeal_activities IS 'Logs all activities related to moderation appeals for audit trail';
COMMENT ON COLUMN public.moderation_actions.status IS 'Status of the moderation action: active, reversed, or expired';
COMMENT ON COLUMN public.moderation_actions.reversed_at IS 'Timestamp when the action was reversed';
COMMENT ON COLUMN public.moderation_actions.reversal_reason IS 'Reason for reversing the moderation action';
COMMENT ON COLUMN public.moderation_appeals.additional_context IS 'Additional context provided by the user in their appeal';