-- Add call supervision parameters to family_members table
ALTER TABLE public.family_members 
ADD COLUMN IF NOT EXISTS max_call_duration_minutes INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS require_call_approval BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allow_video_calls BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_on_calls BOOLEAN DEFAULT true;

COMMENT ON COLUMN public.family_members.max_call_duration_minutes IS 'Maximum call duration in minutes (null = unlimited)';
COMMENT ON COLUMN public.family_members.require_call_approval IS 'Require wali approval before initiating calls';
COMMENT ON COLUMN public.family_members.allow_video_calls IS 'Allow video calls (if false, only audio calls allowed)';
COMMENT ON COLUMN public.family_members.notify_on_calls IS 'Send real-time notifications to wali when calls happen';