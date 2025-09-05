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
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-muted-foreground">Analyse de votre profil...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Aucune analyse disponible</h3>
          <p className="text-muted-foreground mb-4">
            Complétez le test de compatibilité pour obtenir des insights personnalisés.
          </p>
          {showActions && (
            <Button onClick={() => navigate('/compatibility-test')}>
              Commencer le test
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
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

      {/* Compatibility Score Distribution */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Analyse de Compatibilité</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.compatibilityAreas.map((area) => (
            <div key={area.category} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{area.category}</span>
                <span className="text-muted-foreground">{area.score}%</span>
              </div>
              <Progress value={area.score} className="h-2" />
              <p className="text-xs text-muted-foreground">{area.description}</p>
            </div>
          ))}
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

      {/* Action Buttons */}
      {showActions && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => navigate('/compatibility-test')}
                variant="outline"
              >
                Modifier mes réponses
              </Button>
              <Button 
                onClick={() => navigate('/browse')}
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                <Users className="h-4 w-4 mr-2" />
                Découvrir des profils
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompatibilityInsights;