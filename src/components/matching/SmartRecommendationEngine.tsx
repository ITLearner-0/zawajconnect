import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Sparkles, Target, TrendingUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useSmartRecommendations } from '@/hooks/useSmartRecommendations';
import { RecommendationCard } from './RecommendationCard';
import { InsightCard } from './InsightCard';

const SmartRecommendationEngine = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    recommendations, 
    insights, 
    loading, 
    analyzing, 
    generateSmartRecommendations 
  } = useSmartRecommendations();

  return (
    <div className="space-y-6">
      {/* Generate Button */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Moteur de Recommandations Intelligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Utilisez l'IA pour découvrir vos matches les plus prometteurs selon vos valeurs islamiques
            </p>
            
            {analyzing && (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Brain className="h-4 w-4 animate-pulse" />
                  Analyse IA en cours...
                </div>
                <Progress value={75} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Évaluation de la compatibilité islamique et des traits de personnalité
                </p>
              </div>
            )}
            
            <Button 
              onClick={generateSmartRecommendations}
              disabled={loading}
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              {analyzing ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Générer mes Recommandations IA
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {recommendations.length > 0 && (
        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Recommandations ({recommendations.length})
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Insights ({insights.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              {recommendations.map((recommendation) => (
                <RecommendationCard
                  key={recommendation.user_id}
                  recommendation={recommendation}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {insights.map((insight, index) => (
                <InsightCard
                  key={index}
                  insight={insight}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Empty State */}
      {recommendations.length === 0 && !loading && !analyzing && (
        <Card>
          <CardContent className="text-center py-12">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Moteur IA Prêt</h3>
            <p className="text-muted-foreground mb-4">
              Lancez l'analyse IA pour découvrir vos matches les plus compatibles selon les valeurs islamiques
            </p>
            <Button onClick={generateSmartRecommendations} disabled={loading}>
              <Sparkles className="h-4 w-4 mr-2" />
              Commencer l'analyse
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartRecommendationEngine;