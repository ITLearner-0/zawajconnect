// @ts-nocheck
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMatchingPreferences } from '@/hooks/useMatchingPreferences';
import { fetchMatchingProfiles } from '@/utils/matchingUtils';
import { useMatchingHistory, MatchProfile } from '@/hooks/useMatchingHistory';
import { useUnifiedCompatibility } from '@/hooks/useUnifiedCompatibility';
import MatchingPreferencesPanel from './MatchingPreferencesPanel';
import MatchResultsGrid from './MatchResultsGrid';
import MatchingHistoryPanel from './MatchingHistoryPanel';

const AdvancedMatchingEngine = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { preferences } = useMatchingPreferences();
  const { saveSearchToHistory } = useMatchingHistory();
  const { batchCalculateCompatibility } = useUnifiedCompatibility();
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const runAdvancedMatching = async () => {
    if (!user) return;
    
    setLoading(true);
    setAnalyzing(true);
    
    try {
      // Simulate AI-powered matching analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Get current user's profile to determine gender
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('gender')
        .eq('user_id', user.id)
        .maybeSingle();

      // Determine opposite gender
      const oppositeGender = currentUserProfile?.gender === 'male' ? 'female' : 'male';
      
      // Get all Wali user IDs to exclude them from matching
      const { data: waliUsers } = await supabase
        .from('family_members')
        .select('invited_user_id')
        .eq('is_wali', true)
        .eq('invitation_status', 'accepted')
        .not('invited_user_id', 'is', null);

      const waliUserIds = waliUsers?.map(w => w.invited_user_id).filter(Boolean) || [];
      
      // Fetch potential matches with AI scoring (opposite gender only, excluding Walis)
      const { data: profiles } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          age,
          location,
          profession,
          avatar_url,
          bio
        `)
        .neq('user_id', user.id)
        .eq('gender', oppositeGender)
        .not('user_id', 'in', waliUserIds.length > 0 ? `(${waliUserIds.join(',')})` : '()')
        .limit(20);

      if (profiles) {
        // Use real unified compatibility scoring
        const userIds = profiles.map(p => p.user_id);
        const compatibilityResults = await batchCalculateCompatibility(userIds, preferences);
        
        const scoredMatches: MatchProfile[] = profiles.map(profile => {
          const compatibilityData = compatibilityResults[profile.user_id] || {
            compatibility_score: 0,
            islamic_score: 0,
            cultural_score: 0,
            personality_score: 0,
            matching_reasons: [],
            potential_concerns: []
          };

          return {
            ...profile,
            ...compatibilityData
          };
        });

        // Filter by minimum compatibility
        const filteredMatches = scoredMatches
          .filter(match => match.compatibility_score >= preferences.min_compatibility)
          .sort((a, b) => b.compatibility_score - a.compatibility_score)
          .slice(0, 10);

        setMatches(filteredMatches);
        
        // Save to history
        await saveSearchToHistory(filteredMatches, preferences);
        
        toast({
          title: "Analyse terminée",
          description: `${filteredMatches.length} matches compatibles trouvés avec l'IA`,
        });
      }
    } catch (error) {
      console.error('Error running advanced matching:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'exécuter l'analyse de compatibilité",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* AI Matching Controls */}
          <MatchingPreferencesPanel 
            onRunMatching={runAdvancedMatching}
            analyzing={analyzing}
            loading={loading}
          />

          {/* Progress Indicator */}
          {analyzing && (
            <Card>
              <CardContent className="py-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Brain className="h-4 w-4 animate-pulse" />
                    Analyse des profils avec intelligence artificielle...
                  </div>
                  <Progress value={66} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Matches Results */}
          <MatchResultsGrid 
            matches={matches}
            familyApprovalRequired={preferences.family_approval_required}
            analyzing={analyzing}
          />

          {/* Empty State */}
          {matches.length === 0 && !loading && !analyzing && (
            <Card>
              <CardContent className="text-center py-12">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Moteur IA Prêt</h3>
                <p className="text-muted-foreground mb-4">
                  Lancez l'analyse IA pour découvrir vos matches les plus compatibles selon les valeurs islamiques
                </p>
                <Button onClick={runAdvancedMatching} disabled={loading}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Commencer l'analyse
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* History Panel */}
        <div className="lg:col-span-1">
          <MatchingHistoryPanel />
        </div>
      </div>
    </div>
  );
};

export default AdvancedMatchingEngine;