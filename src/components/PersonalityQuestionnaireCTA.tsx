import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, TrendingUp, X } from 'lucide-react';
import { useState } from 'react';

interface PersonalityQuestionnaireCTAProps {
  onDismiss?: () => void;
  variant?: 'banner' | 'card';
}

const PersonalityQuestionnaireCTA = ({
  onDismiss,
  variant = 'banner'
}: PersonalityQuestionnaireCTAProps) => {
  const navigate = useNavigate();
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleStartQuestionnaire = () => {
    navigate('/personality-questionnaire');
  };

  if (isDismissed) return null;

  if (variant === 'banner') {
    return (
      <div className="relative bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 rounded-lg p-6 text-white shadow-lg overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        {/* Dismiss button */}
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Content */}
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-4">
          {/* Icon & Badge */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Badge className="bg-amber-400 text-amber-900 border-0 shadow-md">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Nouveau
                </Badge>
              </div>
            </div>
          </div>

          {/* Text content */}
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              Améliorez vos matches avec le questionnaire de personnalité
              <TrendingUp className="h-5 w-5" />
            </h3>
            <p className="text-white/90 text-sm md:text-base mb-3 md:mb-0">
              Répondez à 15 questions rapides pour obtenir des matches <strong>30% plus compatibles</strong> basés sur votre personnalité, vos valeurs et votre style de vie.
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex-shrink-0 w-full md:w-auto">
            <Button
              onClick={handleStartQuestionnaire}
              size="lg"
              className="w-full md:w-auto bg-white text-emerald-700 hover:bg-white/90 font-semibold shadow-lg"
            >
              <Brain className="h-5 w-5 mr-2" />
              Commencer maintenant
            </Button>
          </div>
        </div>

        {/* Stats badges */}
        <div className="relative z-10 flex flex-wrap gap-3 mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span>5 minutes</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span>15 questions</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span>Résultats instantanés</span>
          </div>
        </div>
      </div>
    );
  }

  // Card variant
  return (
    <Card className="relative overflow-hidden border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
      {onDismiss && (
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors z-10"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Brain className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-foreground">
                Questionnaire de personnalité
              </h3>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                Nouveau
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Obtenez des matches <strong className="text-emerald-700">30% plus compatibles</strong> en complétant votre profil de personnalité.
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Meilleurs matches
              </Badge>
              <Badge variant="secondary" className="text-xs">5 min</Badge>
              <Badge variant="secondary" className="text-xs">15 questions</Badge>
            </div>

            <Button
              onClick={handleStartQuestionnaire}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              <Brain className="h-4 w-4 mr-2" />
              Commencer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalityQuestionnaireCTA;
