-- Create subscription_history table for audit trail
CREATE TABLE IF NOT EXISTS public.subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('granted', 'renewed', 'suspended', 'activated', 'cancelled', 'expired', 'updated')),
  performed_by UUID REFERENCES auth.users(id),
  old_values JSONB,
  new_values JSONB,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;

-- Only admins can view subscription history
CREATE POLICY "Admins can view subscription history"
ON public.subscription_history
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Create function to log subscription changes
CREATE OR REPLACE FUNCTION public.log_subscription_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  action_type TEXT;
  old_data JSONB;
  new_data JSONB;
BEGIN
  -- Determine action type
  IF TG_OP = 'INSERT' THEN
    action_type := 'granted';
    old_data := NULL;
    new_data := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    -- Determine specific action based on changes
    IF OLD.status != NEW.status THEN
      IF NEW.status = 'active' AND OLD.status = 'suspended' THEN
        action_type := 'activated';
      ELSIF NEW.status = 'suspended' THEN
        action_type := 'suspended';
      ELSIF NEW.status = 'cancelled' THEN
        action_type := 'cancelled';
      ELSIF NEW.status = 'expired' THEN
        action_type := 'expired';
      ELSE
        action_type := 'updated';
      END IF;
    ELSIF OLD.expires_at IS DISTINCT FROM NEW.expires_at AND NEW.expires_at > OLD.expires_at THEN
      action_type := 'renewed';
    ELSE
      action_type := 'updated';
    END IF;
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
  ELSE
    RETURN NULL;
  END IF;

  -- Insert into history
  INSERT INTO public.subscription_history (
    subscription_id,
    action,
    performed_by,
    old_values,
    new_values,
    reason
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    action_type,
    auth.uid(),
    old_data,
    new_data,
    NEW.notes
  );

  RETURN NEW;
END;
$$;

-- Create trigger on subscriptions INSERT
CREATE TRIGGER log_subscription_insert
AFTER INSERT ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.log_subscription_change();

-- Create trigger on subscriptions UPDATE
CREATE TRIGGER log_subscription_update
AFTER UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.log_subscription_change();

-- Create index for performance
CREATE INDEX idx_subscription_history_subscription_id ON public.subscription_history(subscription_id);
CREATE INDEX idx_subscription_history_performed_by ON public.subscription_history(performed_by);
CREATE INDEX idx_subscription_history_created_at ON public.subscription_history(created_at DESC);