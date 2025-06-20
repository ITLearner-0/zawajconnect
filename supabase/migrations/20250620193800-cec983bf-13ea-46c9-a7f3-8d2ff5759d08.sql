
-- Enable RLS on conversations table if not already enabled
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid conflicts
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can insert conversations they are part of" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;

-- Create policy for viewing conversations (correct approach without type casting issues)
CREATE POLICY "Users can view their conversations"
  ON public.conversations
  FOR SELECT
  USING (auth.uid() = ANY(participants::uuid[]));

-- Create policy for creating conversations (correct approach without type casting issues)
CREATE POLICY "Users can insert conversations they are part of"
  ON public.conversations
  FOR INSERT
  WITH CHECK (auth.uid() = ANY(participants::uuid[]));

-- Create policy for updating conversations (correct approach without type casting issues)
CREATE POLICY "Users can update their conversations"
  ON public.conversations
  FOR UPDATE
  USING (auth.uid() = ANY(participants::uuid[]));
