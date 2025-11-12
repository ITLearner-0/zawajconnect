-- Create islamic_guidance table for guidance articles
CREATE TABLE public.islamic_guidance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  author TEXT NOT NULL DEFAULT 'Admin',
  featured BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.islamic_guidance ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read published articles
CREATE POLICY "Anyone can view published guidance articles" 
ON public.islamic_guidance 
FOR SELECT 
USING (published = true);

-- Create policy for authenticated users to create articles (admins only in practice)
CREATE POLICY "Authenticated users can create guidance articles" 
ON public.islamic_guidance 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Create policy for authenticated users to update their articles
CREATE POLICY "Authenticated users can update guidance articles" 
ON public.islamic_guidance 
FOR UPDATE 
TO authenticated
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_islamic_guidance_updated_at
  BEFORE UPDATE ON public.islamic_guidance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample Islamic guidance articles
INSERT INTO public.islamic_guidance (title, content, category, author, featured) VALUES
('Les qualités d''un bon époux musulman', 'Un bon époux musulman doit être pieux, respectueux, responsable et bienveillant. Il doit craindre Allah dans ses relations avec son épouse et traiter sa famille avec honneur et dignité. L''Islam enseigne que les meilleurs hommes sont ceux qui traitent le mieux leurs épouses.', 'islamic_values', 'Imam Ahmad', true),
('Préparation spirituelle au mariage', 'Avant le mariage, il est essentiel de se préparer spirituellement. Cela inclut l''augmentation des prières, la lecture du Coran, et la demande de guidance à Allah. Le mariage est une moitié de la foi selon notre Prophète (PBSL).', 'marriage_prep', 'Cheikh Fatima', true),
('L''importance de la communication dans le couple', 'La communication respectueuse et bienveillante est fondamentale dans un mariage islamique. Les époux doivent s''écouter mutuellement, résoudre les conflits avec sagesse et maintenir une relation basée sur la confiance et le respect mutuel.', 'family_life', 'Dr. Youssef', false),
('Les étapes du processus de courtisation', 'La courtisation islamique implique la transparence, la présence de la famille, et le respect des limites religieuses. Il est important de connaître la personnalité, les valeurs et la pratique religieuse du futur conjoint avant de prendre une décision.', 'courtship_etiquette', 'Ustadha Aisha', false),
('Organiser un mariage selon les traditions islamiques', 'Un mariage islamique comprend le Nikah (contrat de mariage), la dot (Mahr), et la célébration (Walima). Chaque étape a sa importance spirituelle et communautaire. Il est essentiel de respecter les enseignements prophétiques dans l''organisation.', 'wedding_planning', 'Imam Hassan', false);