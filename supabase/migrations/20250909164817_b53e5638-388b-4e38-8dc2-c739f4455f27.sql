-- Fix missing updated_at column in family_reviews table that's causing the trigger error
ALTER TABLE public.family_reviews 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Ensure the trigger exists for automatic timestamp updates
DROP TRIGGER IF EXISTS update_family_reviews_updated_at ON public.family_reviews;
CREATE TRIGGER update_family_reviews_updated_at
    BEFORE UPDATE ON public.family_reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();