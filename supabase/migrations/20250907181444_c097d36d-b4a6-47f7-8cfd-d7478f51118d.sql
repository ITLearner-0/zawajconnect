-- Table pour stocker les règles de modération islamiques
CREATE TABLE public.islamic_moderation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name TEXT NOT NULL,
  rule_description TEXT NOT NULL,
  keywords JSONB NOT NULL DEFAULT '[]',
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  action TEXT NOT NULL DEFAULT 'warn' CHECK (action IN ('warn', 'block', 'escalate')),
  islamic_value TEXT NOT NULL CHECK (islamic_value IN ('respect', 'modesty', 'truthfulness', 'no_vulgarity', 'kindness')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les logs de modération
CREATE TABLE public.moderation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.messages(id),
  user_id UUID NOT NULL,
  content_analyzed TEXT NOT NULL,
  ai_analysis JSONB NOT NULL DEFAULT '{}',
  rules_triggered JSONB NOT NULL DEFAULT '[]',
  action_taken TEXT NOT NULL CHECK (action_taken IN ('approved', 'blocked', 'escalated', 'warned')),
  confidence_score DECIMAL(3,2) NOT NULL DEFAULT 0.0,
  human_reviewed BOOLEAN NOT NULL DEFAULT false,
  human_reviewer_id UUID,
  human_decision TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les suggestions d'amélioration
CREATE TABLE public.message_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_message TEXT NOT NULL,
  suggested_message TEXT NOT NULL,
  improvement_reason TEXT NOT NULL,
  islamic_guidance TEXT,
  user_id UUID NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS sur toutes les tables
ALTER TABLE public.islamic_moderation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_suggestions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour islamic_moderation_rules
CREATE POLICY "Admins can manage moderation rules"
ON public.islamic_moderation_rules
FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Users can view active rules"
ON public.islamic_moderation_rules
FOR SELECT
USING (is_active = true);

-- Politiques RLS pour moderation_logs
CREATE POLICY "Admins can view all moderation logs"
ON public.moderation_logs
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own moderation logs"
ON public.moderation_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Politiques RLS pour message_suggestions
CREATE POLICY "Users can manage their own suggestions"
ON public.message_suggestions
FOR ALL
USING (auth.uid() = user_id);

-- Insérer les règles de modération islamiques par défaut
INSERT INTO public.islamic_moderation_rules (rule_name, rule_description, keywords, severity, action, islamic_value) VALUES
('Vulgarité et grossièreté', 'Détecte les mots vulgaires et grossiers contraires à l''adab islamique', '["vulgar", "crude", "offensive", "inappropriate language"]', 'high', 'block', 'no_vulgarity'),
('Manque de respect', 'Identifie les messages irrespectueux envers autrui', '["disrespect", "insult", "mockery", "contempt"]', 'medium', 'warn', 'respect'),
('Contraire à la pudeur', 'Détecte le contenu immodeste ou sexuellement explicite', '["immodest", "sexual", "inappropriate", "haram content"]', 'high', 'block', 'modesty'),
('Mensonge et tromperie', 'Identifie les tentatives de mensonge ou de tromperie', '["lie", "deception", "false information", "misleading"]', 'medium', 'escalate', 'truthfulness'),
('Manque de gentillesse', 'Détecte les messages durs ou sans compassion', '["harsh", "cruel", "unkind", "mean"]', 'low', 'warn', 'kindness');

-- Triggers pour updated_at
CREATE TRIGGER update_islamic_moderation_rules_updated_at
BEFORE UPDATE ON public.islamic_moderation_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour améliorer les performances
CREATE INDEX idx_moderation_logs_user_id ON public.moderation_logs(user_id);
CREATE INDEX idx_moderation_logs_created_at ON public.moderation_logs(created_at);
CREATE INDEX idx_message_suggestions_user_id ON public.message_suggestions(user_id);