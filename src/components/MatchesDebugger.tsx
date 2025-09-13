import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const MatchesDebugger = () => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runDebug = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // 1. Get user profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // 2. Get all matches for this user
      const { data: allMatches } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      // 3. Get mutual matches specifically
      const { data: mutualMatches } = await supabase
        .from('matches')
        .select('*')
        .eq('is_mutual', true)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      // 4. Check for any mutual matches in system
      const { data: allMutualInSystem } = await supabase
        .from('matches')
        .select('*')
        .eq('is_mutual', true);

      // 5. Check if user exists as wali
      const { data: isWali } = await supabase
        .from('family_members')
        .select('*')
        .eq('invited_user_id', user.id)
        .eq('is_wali', true);

      setDebugInfo({
        userId: user.id,
        userEmail: user.email,
        userProfile,
        allMatches: allMatches || [],
        mutualMatches: mutualMatches || [],
        allMutualInSystem: allMutualInSystem || [],
        isWali: isWali || [],
        totalMatches: allMatches?.length || 0,
        mutualCount: mutualMatches?.length || 0
      });

    } catch (error) {
      console.error('Debug error:', error);
      setDebugInfo({ error: error.message });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      runDebug();
    }
  }, [user]);

  if (!user) {
    return <div>Utilisateur non connecté</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Matches Debugger
            <Button onClick={runDebug} disabled={loading}>
              {loading ? 'Debug en cours...' : 'Refresh Debug'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Informations utilisateur :</h4>
            <div className="text-sm space-y-1">
              <div>ID: {debugInfo.userId}</div>
              <div>Email: {debugInfo.userEmail}</div>
              <div>Profil: {debugInfo.userProfile ? JSON.stringify(debugInfo.userProfile.full_name) : 'Pas de profil'}</div>
              <div>Est Wali: {debugInfo.isWali?.length > 0 ? 'Oui' : 'Non'}</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Statistiques Matches :</h4>
            <div className="flex gap-2 mb-2">
              <Badge>Total: {debugInfo.totalMatches}</Badge>
              <Badge variant="secondary">Mutuels: {debugInfo.mutualCount}</Badge>
              <Badge variant="outline">Système mutuels: {debugInfo.allMutualInSystem?.length}</Badge>
            </div>
          </div>

          {debugInfo.allMatches && debugInfo.allMatches.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Tous les matches :</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {debugInfo.allMatches.map((match: any) => (
                  <div key={match.id} className="p-2 border rounded text-xs">
                    <div>ID: {match.id}</div>
                    <div>User1: {match.user1_id} (Liked: {match.user1_liked ? 'Oui' : 'Non'})</div>
                    <div>User2: {match.user2_id} (Liked: {match.user2_liked ? 'Oui' : 'Non'})</div>
                    <div>Mutuel: {match.is_mutual ? 'OUI' : 'NON'}</div>
                    <div>Score: {match.match_score}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {debugInfo.allMutualInSystem && debugInfo.allMutualInSystem.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Tous les matches mutuels du système :</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {debugInfo.allMutualInSystem.map((match: any) => (
                  <div key={match.id} className="p-2 border rounded text-xs bg-green-50">
                    <div>User1: {match.user1_id}</div>
                    <div>User2: {match.user2_id}</div>
                    <div>Score: {match.match_score}</div>
                    <div>Créé: {match.created_at}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {debugInfo.error && (
            <div className="text-red-600 text-sm">
              Erreur: {debugInfo.error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchesDebugger;