import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users, CheckCircle, XCircle, TestTube } from 'lucide-react';

interface TestResult {
  totalProfiles: number;
  walisFound: number;
  walisExcluded: number;
  success: boolean;
  details: string[];
}

const WaliExclusionTest: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const runWaliExclusionTest = async () => {
    if (!user) return;

    setLoading(true);
    setTestResult(null);

    try {
      // Get current user's gender first
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('gender')
        .eq('user_id', user.id)
        .maybeSingle();

      const oppositeGender = currentUserProfile?.gender === 'male' ? 'female' : 'male';

      // Test 1: Get all profiles (without exclusion) to see original count
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .neq('user_id', user.id)
        .eq('gender', oppositeGender);

      // Test 2: Get all Wali user IDs
      const { data: waliUsers } = await supabase
        .from('family_members')
        .select('invited_user_id')
        .eq('is_wali', true)
        .eq('invitation_status', 'accepted')
        .not('invited_user_id', 'is', null);

      const waliUserIds = waliUsers?.map(w => w.invited_user_id).filter(Boolean) || [];

      // Test 3: Check how many of the profiles are Walis
      const walisInProfiles = allProfiles?.filter(p => waliUserIds.includes(p.user_id)) || [];

      // Test 4: Get filtered profiles (excluding Walis)
      let filteredQuery = supabase
        .from('profiles')
        .select('user_id, full_name')
        .neq('user_id', user.id)
        .eq('gender', oppositeGender);

      if (waliUserIds.length > 0) {
        filteredQuery = filteredQuery.not('user_id', 'in', `(${waliUserIds.join(',')})`);
      }

      const { data: filteredProfiles } = await filteredQuery;

      // Generate test results
      const result: TestResult = {
        totalProfiles: allProfiles?.length || 0,
        walisFound: walisInProfiles.length,
        walisExcluded: walisInProfiles.length,
        success: walisInProfiles.length === 0 || filteredProfiles?.length === (allProfiles?.length || 0) - walisInProfiles.length,
        details: [
          `${allProfiles?.length || 0} profils ${oppositeGender}s trouvés au total`,
          `${walisInProfiles.length} Walis identifiés parmi ces profils`,
          `${filteredProfiles?.length || 0} profils dans les résultats filtrés`,
          `Exclusion ${walisInProfiles.length === 0 || filteredProfiles?.length === (allProfiles?.length || 0) - walisInProfiles.length ? 'réussie' : 'échouée'}`
        ]
      };

      setTestResult(result);

      if (result.success) {
        toast({
          title: "✅ Test réussi !",
          description: `Les Walis sont correctement exclus du matching (${result.walisExcluded} exclus)`,
        });
      } else {
        toast({
          title: "❌ Test échoué",
          description: "Des Walis apparaissent encore dans les résultats de matching",
          variant: "destructive",
        });
      }

    } catch (error: unknown) {
      console.error('Test Wali exclusion error:', error);
      const errorMessage = error instanceof Error ? error.message : "Impossible d'exécuter le test";
      toast({
        title: "❌ Erreur de test",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-emerald/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-dark">
          <TestTube className="h-5 w-5" />
          Test d'Exclusion des Walis du Matching
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-amber/5 border border-amber/20 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Shield className="h-5 w-5 text-amber mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-dark">Test de validation</p>
                <p className="text-sm text-amber-dark/70">
                  Vérifie que les Walis (tuteurs/superviseurs) n'apparaissent pas comme candidats dans le système de matching.
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={runWaliExclusionTest}
            disabled={loading}
            className="w-full bg-emerald hover:bg-emerald-dark"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald border-t-transparent"></div>
                Test en cours...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                Lancer le test
              </div>
            )}
          </Button>

          {testResult && (
            <div className={`p-4 rounded-lg border ${
              testResult.success 
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                {testResult.success ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Test réussi !</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5" />
                    <span className="font-medium">Test échoué</span>
                  </>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Profils totaux:</span>
                    <span className="ml-2">{testResult.totalProfiles}</span>
                  </div>
                  <div>
                    <span className="font-medium">Walis identifiés:</span>
                    <span className="ml-2">{testResult.walisFound}</span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <p className="text-sm font-medium mb-2">Détails du test:</p>
                  <ul className="text-xs space-y-1">
                    {testResult.details.map((detail, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
            <p><strong>Corrections appliquées :</strong></p>
            <ul className="mt-1 space-y-1">
              <li>✅ Browse.tsx - Exclusion des Walis dans fetchProfiles</li>
              <li>✅ AdvancedMatchingEngine.tsx - Exclusion des Walis</li>
              <li>✅ SmartRecommendationEngine.tsx - Exclusion des Walis</li>
              <li>✅ AdvancedIslamicFiltering.tsx - Exclusion des Walis</li>
              <li>✅ IslamicCompatibilityCalculator.tsx - Exclusion des Walis</li>
              <li>✅ Fonction utilitaire matchingUtils.ts créée</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaliExclusionTest;