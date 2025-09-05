import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Lightbulb, BookOpen, ArrowRight } from 'lucide-react';
import { useCompatibility } from '@/hooks/useCompatibility';
import { Link } from 'react-router-dom';

const InsightsPreviewCard = () => {
  const { stats, loading } = useCompatibility();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isComplete = stats.completionPercentage === 100;

  return (
    <Card className="bg-gradient-to-br from-emerald/5 via-emerald/10 to-sage/5 border-emerald/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-emerald" />
            <CardTitle className="text-emerald-dark">Insights de Compatibilité</CardTitle>
          </div>
          {isComplete && (
            <Badge variant="default" className="bg-emerald text-white">
              Disponible
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {isComplete 
            ? "Découvrez des analyses personnalisées basées sur vos réponses et recevez des conseils pour optimiser votre recherche de partenaire."
            : "Complétez le test de compatibilité pour débloquer des insights personnalisés sur votre profil et vos préférences."
          }
        </p>

        {isComplete && (
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center space-x-2 p-2 bg-white/50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-emerald flex-shrink-0" />
              <span className="text-emerald-dark">Analyse de compatibilité</span>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-white/50 rounded-lg">
              <Lightbulb className="h-4 w-4 text-gold flex-shrink-0" />
              <span className="text-gold-dark">Suggestions d'amélioration</span>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-white/50 rounded-lg">
              <BookOpen className="h-4 w-4 text-sage flex-shrink-0" />
              <span className="text-sage-dark">Guidance islamique</span>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-white/50 rounded-lg">
              <Brain className="h-4 w-4 text-emerald flex-shrink-0" />
              <span className="text-emerald-dark">Profil de personnalité</span>
            </div>
          </div>
        )}

        <div className="pt-2">
          <Link to={isComplete ? "/compatibility-insights" : "/compatibility-test"}>
            <Button 
              className={`w-full ${
                isComplete 
                  ? 'bg-gradient-to-r from-emerald to-emerald/80 hover:from-emerald-dark hover:to-emerald' 
                  : 'bg-gradient-to-r from-primary to-primary/80'
              }`}
            >
              {isComplete ? (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Voir mes Insights
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Commencer le test
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </Link>
        </div>

        {!isComplete && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">{stats.answeredQuestions}/{stats.totalQuestions}</span> questions complétées
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InsightsPreviewCard;