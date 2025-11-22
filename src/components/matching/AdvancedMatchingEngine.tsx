import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Brain, Sparkles, History, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMatchingPreferences } from '@/hooks/useMatchingPreferences';
import { fetchMatchingProfiles } from '@/utils/matchingUtils';
import { useMatchingHistory, MatchProfile } from '@/hooks/useMatchingHistory';
import { useUnifiedCompatibility } from '@/hooks/useUnifiedCompatibility';
import MatchingPreferencesPanel from './MatchingPreferencesPanel';
import MatchResultsGrid from './MatchResultsGrid';
import MatchingHistoryPanel from './MatchingHistoryPanel';
import { useIsMobile } from '@/hooks/use-mobile';

const AdvancedMatchingEngine = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { preferences } = useMatchingPreferences();
  const { saveSearchToHistory } = useMatchingHistory();
  const { batchCalculateCompatibility } = useUnifiedCompatibility();
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [historySidebarOpen, setHistorySidebarOpen] = useState(true);

  const runAdvancedMatching = async () => {
    if (!user) return;

    setLoading(true);
    setAnalyzing(true);

    try {
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

      const waliUserIds = waliUsers?.map((w) => w.invited_user_id).filter(Boolean) || [];

      // Fetch potential matches with AI scoring (opposite gender only, excluding Walis)
      let query = supabase
        .from('profiles')
        .select(
          `
          user_id,
          full_name,
          age,
          location,
          profession,
          avatar_url,
          bio
        `
        )
        .neq('user_id', user.id)
        .eq('gender', oppositeGender);

      // Exclude Walis only if there are any
      if (waliUserIds.length > 0) {
        query = query.not('user_id', 'in', `(${waliUserIds.join(',')})`);
      }

      const { data: profiles } = await query.limit(20);

      if (profiles) {
        // Use real unified compatibility scoring
        const userIds = profiles.map((p) => p.user_id);
        const compatibilityResults = await batchCalculateCompatibility(userIds, preferences);

        const scoredMatches: MatchProfile[] = profiles.map((profile) => {
          const compatibilityData = compatibilityResults[profile.user_id] || {
            compatibility_score: 0,
            islamic_score: 0,
            cultural_score: 0,
            personality_score: 0,
            matching_reasons: [],
            potential_concerns: [],
          };

          return {
            ...profile,
            ...compatibilityData,
          };
        });

        // Filter by minimum compatibility
        const filteredMatches = scoredMatches
          .filter((match) => match.compatibility_score >= preferences.min_compatibility)
          .sort((a, b) => b.compatibility_score - a.compatibility_score)
          .slice(0, 10);

        setMatches(filteredMatches);

        // Save to history
        await saveSearchToHistory(filteredMatches, preferences);

        toast({
          title: 'Analyse terminée',
          description: `${filteredMatches.length} matches compatibles trouvés avec l'IA`,
        });
      }
    } catch (error) {
      console.error('Error running advanced matching:', error);
      toast({
        title: 'Erreur',
        description: "Impossible d'exécuter l'analyse de compatibilité",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-6 relative">
        {/* Main Content Area - Flexible Width */}
        <div
          className={`flex-1 space-y-6 transition-all duration-300 ${
            !isMobile && historySidebarOpen ? 'lg:mr-80' : ''
          }`}
        >
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
                  Lancez l'analyse IA pour découvrir vos matches les plus compatibles
                </p>
                <Button onClick={runAdvancedMatching} disabled={loading}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Commencer l'analyse
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* History Panel - Mobile: Sheet, Desktop: Collapsible Sidebar */}
        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="fixed bottom-20 right-4 h-12 w-12 rounded-full shadow-lg z-50 bg-background border-2"
              >
                <History className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-96 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Historique des Recherches</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <MatchingHistoryPanel />
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <>
            {/* Toggle Button - Desktop */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setHistorySidebarOpen(!historySidebarOpen)}
              className={`fixed top-32 z-50 h-10 w-10 rounded-l-lg rounded-r-none shadow-md transition-all duration-300 ${
                historySidebarOpen ? 'right-80' : 'right-0'
              }`}
            >
              {historySidebarOpen ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>

            {/* Sidebar Panel - Desktop */}
            <div
              className={`fixed top-32 right-0 h-[calc(100vh-8rem)] w-80 bg-background border-l transition-transform duration-300 overflow-hidden z-40 ${
                historySidebarOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <div className="h-full overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Historique</h3>
                  <History className="h-5 w-5 text-muted-foreground" />
                </div>
                <MatchingHistoryPanel />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdvancedMatchingEngine;
