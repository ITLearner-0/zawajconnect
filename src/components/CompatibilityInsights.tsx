import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Heart, 
  AlertTriangle, 
  Lightbulb, 
  TrendingUp, 
  BookOpen,
  Star,
  Target,
  Users,
  Brain
} from 'lucide-react';
import { useCompatibilityInsights } from '@/hooks/useCompatibilityInsights';
import CompatibilityScoreChart from '@/components/CompatibilityScoreChart';
import InsightsActionPanel from '@/components/InsightsActionPanel';
import InsightsSummaryCard from '@/components/InsightsSummaryCard';
import MobileCompatibilityCard from '@/components/MobileCompatibilityCard';
import MobileInsightsDashboard from '@/components/MobileInsightsDashboard';
import InteractiveInsightCard from '@/components/InteractiveInsightCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface CompatibilityInsightsProps {
  userId?: string;
  showActions?: boolean;
}

const CompatibilityInsights: React.FC<CompatibilityInsightsProps> = ({ 
  userId, 
  showActions = true 
}) => {
  const { insights, loading } = useCompatibilityInsights(userId);
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className="w-full animate-pulse">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="text-muted-foreground text-center">Analyse de votre profil...</span>
          </div>
          <div className="mt-6 space-y-3">
            <div className="h-4 bg-muted rounded animate-pulse"></div>
            <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card className="w-full border-dashed border-2 hover:border-primary/50 transition-colors">
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="animate-float">
            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Aucune analyse disponible</h3>
          <p className="text-muted-foreground mb-4 text-sm sm:text-base">
            Complétez le test de compatibilité pour obtenir des insights personnalisés.
          </p>
          {showActions && (
            <Button 
              onClick={() => navigate('/compatibility-test')}
              className="animate-pulse-gentle hover:animate-none"
            >
              Commencer le test
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <InsightsSummaryCard userId={userId} />

      {/* Detailed Compatibility Chart */}
      <CompatibilityScoreChart 
        areas={insights.compatibilityAreas} 
        showTrends={true} 
      />

      {/* Profile Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-primary" />
            <CardTitle>Profil de Compatibilité</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Vos Priorités</h4>
              <div className="flex flex-wrap gap-2">
                {insights.priorities.map((priority, index) => (
                  <Badge key={index} variant="default">
                    {priority}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Style de Relation</h4>
              <p className="text-sm text-muted-foreground">
                {insights.relationshipStyle}
              </p>
            </div>
          </div>
          <Separator />
          <div>
            <h4 className="font-semibold mb-2">Résumé de Personnalité</h4>
            <p className="text-sm">{insights.summary}</p>
          </div>
        </CardContent>
      </Card>

      {/* Match Quality Predictor */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle>Prédiction de Compatibilité</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 text-green-700">
                Vous êtes le plus compatible avec des partenaires qui :
              </h4>
              <ul className="space-y-1">
                {insights.idealPartner.map((trait, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <Heart className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{trait}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Improvement Suggestions */}
      {insights.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <CardTitle>Suggestions d'Amélioration</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.suggestions.map((suggestion, index) => (
                <Alert key={index}>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription className="font-medium">
                    {suggestion.title}
                  </AlertDescription>
                  <AlertDescription className="text-sm text-muted-foreground mt-1">
                    {suggestion.description}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Red Flags Alert */}
      {insights.redFlags.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-800">Points d'Attention</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.redFlags.map((flag, index) => (
                <Alert key={index} className="border-orange-200">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="font-medium text-orange-800">
                    {flag.title}
                  </AlertDescription>
                  <AlertDescription className="text-sm text-orange-700 mt-1">
                    {flag.description}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Islamic Guidance */}
      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-emerald-800">Guidance Islamique</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.islamicGuidance.map((guidance, index) => (
              <div key={index} className="space-y-2">
                <h4 className="font-semibold text-emerald-800">{guidance.title}</h4>
                <blockquote className="border-l-4 border-emerald-300 pl-4 italic text-emerald-700">
                  "{guidance.verse}"
                </blockquote>
                <p className="text-sm text-emerald-600">{guidance.source}</p>
                <p className="text-sm text-emerald-700">{guidance.application}</p>
                {index < insights.islamicGuidance.length - 1 && (
                  <Separator className="bg-emerald-200" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons - Moved below all other content */}
      {showActions && (
        <div className="mt-8 pt-6 border-t">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => navigate('/compatibility-test')}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Modifier mes réponses
                  </Button>
                  <Button 
                    onClick={() => navigate('/browse')}
                    className="bg-gradient-to-r from-primary to-primary/80 w-full sm:w-auto"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Découvrir des profils
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <InsightsActionPanel 
              completionPercentage={100} 
              insightsAvailable={true} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CompatibilityInsights;