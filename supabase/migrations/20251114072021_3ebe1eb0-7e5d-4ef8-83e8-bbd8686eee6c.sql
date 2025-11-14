-- Create table for saved filters
CREATE TABLE public.wali_saved_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wali_saved_filters ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own saved filters"
  ON public.wali_saved_filters
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own saved filters"
  ON public.wali_saved_filters
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own saved filters"
  ON public.wali_saved_filters
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own saved filters"
  ON public.wali_saved_filters
  FOR DELETE
  USING (user_id = auth.uid());

-- Create index
CREATE INDEX idx_wali_saved_filters_user_id ON public.wali_saved_filters(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_wali_saved_filters_updated_at
  BEFORE UPDATE ON public.wali_saved_filters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();