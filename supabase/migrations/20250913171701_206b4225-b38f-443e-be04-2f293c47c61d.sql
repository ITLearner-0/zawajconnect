-- Add updated_at column to matches table
ALTER TABLE public.matches 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();