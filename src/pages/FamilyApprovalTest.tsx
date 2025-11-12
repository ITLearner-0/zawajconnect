import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Brain, Users, Heart, CheckCircle, Play, Zap } from 'lucide-react';

const FamilyApprovalTest = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState({
    matchUserId: '',
    compatibilityScore: 85,
    islamicScore: 90,
    culturalScore: 78,
    personalityScore: 82,
  });

  const handleTestApprovalRequest = async () => {
    if (!user) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour tester le système',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('family-approval-request', {
        body: {
          user_id: user.id,
          match_user_id: testData.matchUserId || 'test-user-id',
          compatibility_score: testData.compatibilityScore,
          islamic_score: testData.islamicScore,
          cultural_score: testData.culturalScore,
          personality_score: testData.personalityScore,
          matching_reasons: [
            'Forte compatibilité religieuse',
            'Valeurs culturelles partagées',
            'Proximité géographique',
          ],
          potential_concerns: [
            "Différence d'âge à considérer",
            'Vérifier les objectifs matrimoniaux',
          ],
        },
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: 'Test réussi ! ✅',
          description: `${data.notifications_sent} notification(s) créée(s)${data.ai_analysis_included ? ' avec analyse IA' : ''}`,
        });
      } else {
        throw new Error(data?.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Test error:', error);
      toast({
        title: 'Erreur de test',
        description: error.message || "Une erreur s'est produite pendant le test",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary-glow/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Test du Système d'Approbation Familiale IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Cette page permet de tester le workflow complet d'approbation familiale avec analyse
              IA intégrée.
            </p>
          </CardContent>
        </Card>

        {/* Feature Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Brain className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium">Analyse IA</p>
                  <p className="text-sm text-muted-foreground">Conseils islamiques automatiques</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Notifications Famille</p>
                  <p className="text-sm text-muted-foreground">Alertes automatiques</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Heart className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Workflow Complet</p>
                  <p className="text-sm text-muted-foreground">De la demande à la décision</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Configuration du Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="matchUserId">ID du match (optionnel)</Label>
                <Input
                  id="matchUserId"
                  placeholder="ID utilisateur du match potentiel"
                  value={testData.matchUserId}
                  onChange={(e) =>
                    setTestData((prev) => ({ ...prev, matchUserId: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="compatibility">Score de compatibilité (%)</Label>
                <Input
                  id="compatibility"
                  type="number"
                  min="50"
                  max="100"
                  value={testData.compatibilityScore}
                  onChange={(e) =>
                    setTestData((prev) => ({
                      ...prev,
                      compatibilityScore: parseInt(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="islamic">Score islamique (%)</Label>
                <Input
                  id="islamic"
                  type="number"
                  min="50"
                  max="100"
                  value={testData.islamicScore}
                  onChange={(e) =>
                    setTestData((prev) => ({ ...prev, islamicScore: parseInt(e.target.value) }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cultural">Score culturel (%)</Label>
                <Input
                  id="cultural"
                  type="number"
                  min="50"
                  max="100"
                  value={testData.culturalScore}
                  onChange={(e) =>
                    setTestData((prev) => ({ ...prev, culturalScore: parseInt(e.target.value) }))
                  }
                />
              </div>
            </div>

            <Button
              onClick={handleTestApprovalRequest}
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
              size="lg"
            >
              {loading ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-spin" />
                  Envoi de la demande en cours...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Tester la Demande d'Approbation
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Comment tester :</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Assurez-vous d'avoir configuré des membres de famille dans votre profil</li>
              <li>Ajustez les scores de compatibilité ci-dessus selon vos préférences</li>
              <li>Cliquez sur "Tester la Demande d'Approbation"</li>
              <li>Vérifiez que les notifications ont été créées dans le tableau de bord famille</li>
              <li>Les membres de famille recevront des notifications avec analyse IA</li>
              <li>Ils pourront approuver, refuser ou demander une discussion</li>
            </ol>
          </CardContent>
        </Card>

        {/* Success Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Fonctionnalités Implémentées</span>
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Edge function avec analyse IA</li>
                <li>• Notifications famille en temps réel</li>
                <li>• Dashboard d'approbation complet</li>
                <li>• Workflow de décision (approuver/refuser)</li>
                <li>• Intégration avec le matching engine</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Intelligence Artificielle</span>
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Analyse de compatibilité islamique</li>
                <li>• Questions suggérées pour l'entretien</li>
                <li>• Recommandations personnalisées</li>
                <li>• Évaluation des points d'attention</li>
                <li>• Conseils conformes aux valeurs islamiques</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FamilyApprovalTest;
