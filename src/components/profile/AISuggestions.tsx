import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  Loader2,
  TrendingUp,
  Zap
} from 'lucide-react';

interface Suggestion {
  type: 'urgent' | 'important' | 'optional';
  category: string;
  title: string;
  description: string;
  action: string;
  impact: string;
}

interface AISuggestionsProps {
  profile?: {
    full_name?: string;
    age?: number;
    bio?: string;
    location?: string;
    education?: string;
    profession?: string;
    interests?: string[];
    avatar_url?: string;
  };
  islamicPrefs?: {
    prayer_frequency?: string;
    quran_reading?: string;
    sect?: string;
    madhab?: string;
    importance_of_religion?: string;
  };
  completionStats: {
    overall: number;
    basicInfo: number;
    islamicPrefs: number;
    photos: number;
    compatibility: number;
    privacy: number;
    verification: number;
  };
}

const AISuggestions = ({ profile, islamicPrefs, completionStats }: AISuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'important':
        return <Info className="h-5 w-5 text-gold" />;
      case 'optional':
        return <CheckCircle2 className="h-5 w-5 text-emerald" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'border-destructive/30 bg-destructive/5';
      case 'important':
        return 'border-gold/30 bg-gold/5';
      case 'optional':
        return 'border-emerald/30 bg-emerald/5';
      default:
        return 'border-muted';
    }
  };

  const analyzeProfil = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-profile', {
        body: {
          profile,
          islamicPrefs,
          completionStats
        }
      });

      if (error) {
        if (error.message.includes('429')) {
          toast({
            title: "Limite atteinte",
            description: "Trop de requêtes. Veuillez réessayer dans quelques instants.",
            variant: "destructive"
          });
        } else if (error.message.includes('402')) {
          toast({
            title: "Crédits épuisés",
            description: "Les crédits AI sont épuisés. Contactez le support.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }

      if (data?.suggestions) {
        setSuggestions(data.suggestions);
        toast({
          title: "Analyse terminée",
          description: `${data.suggestions.length} suggestions personnalisées générées !`,
        });
      }
    } catch (error) {
      console.error('Error analyzing profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'analyser le profil. Réessayez plus tard.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Suggestions IA Personnalisées
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.length === 0 ? (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-4"
            >
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            </motion.div>
            <h3 className="font-semibold mb-2">Obtenez des suggestions personnalisées</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Notre IA analyse votre profil et vous propose des améliorations sur mesure pour maximiser vos chances de match.
            </p>
            <Button
              onClick={analyzeProfil}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Analyser mon profil
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                {suggestions.length} suggestion{suggestions.length > 1 ? 's' : ''} personnalisée{suggestions.length > 1 ? 's' : ''}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={analyzeProfil}
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                Rafraîchir
              </Button>
            </div>
            
            <AnimatePresence mode="popLayout">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className={`p-4 rounded-lg border ${getSuggestionColor(suggestion.type)} transition-all`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getSuggestionIcon(suggestion.type)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold">{suggestion.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {suggestion.description}
                      </p>
                      <div className="pt-2 space-y-1">
                        <div className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-emerald mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">
                            <span className="font-medium text-foreground">Action :</span> {suggestion.action}
                          </span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">
                            <span className="font-medium text-foreground">Impact :</span> {suggestion.impact}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AISuggestions;
