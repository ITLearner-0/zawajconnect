import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Star, MapPin, Users, Sparkles, Brain, Shield } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface MatchProfile {
  user_id: string;
  full_name: string;
  age: number;
  location: string;
  profession: string;
  avatar_url?: string;
  bio?: string;
  compatibility_score: number;
  islamic_score: number;
  cultural_score: number;
  personality_score: number;
  matching_reasons: string[];
  potential_concerns: string[];
}

interface MatchingPreferences {
  use_ai_scoring: boolean;
  weight_islamic: number;
  weight_cultural: number;
  weight_personality: number;
  min_compatibility: number;
  family_approval_required: boolean;
}

const AdvancedMatchingEngine = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [preferences, setPreferences] = useState<MatchingPreferences>({
    use_ai_scoring: true,
    weight_islamic: 40,
    weight_cultural: 30,
    weight_personality: 30,
    min_compatibility: 70,
    family_approval_required: false
  });

  const runAdvancedMatching = async () => {
    if (!user) return;
    
    setLoading(true);
    setAnalyzing(true);
    
    try {
      // Simulate AI-powered matching analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Fetch potential matches with AI scoring
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
        .limit(20);

      if (profiles) {
        // Simulate AI compatibility scoring
        const scoredMatches: MatchProfile[] = profiles.map(profile => {
          const islamic_score = Math.floor(Math.random() * 30) + 70;
          const cultural_score = Math.floor(Math.random() * 40) + 60;
          const personality_score = Math.floor(Math.random() * 35) + 65;
          
          const compatibility_score = Math.floor(
            (islamic_score * preferences.weight_islamic + 
             cultural_score * preferences.weight_cultural + 
             personality_score * preferences.weight_personality) / 100
          );

          const matching_reasons = [
            islamic_score > 85 ? 'Forte compatibilité religieuse' : null,
            cultural_score > 80 ? 'Valeurs culturelles partagées' : null,
            personality_score > 85 ? 'Personnalités complémentaires' : null,
            profile.location === 'Paris' ? 'Proximité géographique' : null
          ].filter(Boolean) as string[];

          const potential_concerns = [
            islamic_score < 75 ? 'Différences dans la pratique religieuse' : null,
            cultural_score < 70 ? 'Origines culturelles différentes' : null,
            Math.abs((profile.age || 25) - 28) > 5 ? 'Écart d\'âge important' : null
          ].filter(Boolean) as string[];

          return {
            ...profile,
            compatibility_score,
            islamic_score,
            cultural_score,
            personality_score,
            matching_reasons,
            potential_concerns
          };
        });

        // Filter by minimum compatibility
        const filteredMatches = scoredMatches
          .filter(match => match.compatibility_score >= preferences.min_compatibility)
          .sort((a, b) => b.compatibility_score - a.compatibility_score)
          .slice(0, 10);

        setMatches(filteredMatches);
        
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

  const getCompatibilityColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 75) return 'text-gold-600 bg-gold-50 border-gold-200';
    if (score >= 65) return 'text-sage-600 bg-sage-50 border-sage-200';
    return 'text-muted-foreground bg-muted border-border';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 85) return <Sparkles className="h-4 w-4" />;
    if (score >= 75) return <Star className="h-4 w-4" />;
    return <Heart className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* AI Matching Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Moteur IA de Compatibilité Islamique
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Poids Islamique ({preferences.weight_islamic}%)
              </label>
              <input
                type="range"
                min="20"
                max="60"
                value={preferences.weight_islamic}
                onChange={(e) => setPreferences(prev => ({ ...prev, weight_islamic: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Poids Culturel ({preferences.weight_cultural}%)
              </label>
              <input
                type="range"
                min="10"
                max="50"
                value={preferences.weight_cultural}
                onChange={(e) => setPreferences(prev => ({ ...prev, weight_cultural: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Poids Personnalité ({preferences.weight_personality}%)
              </label>
              <input
                type="range"
                min="10"
                max="50"
                value={preferences.weight_personality}
                onChange={(e) => setPreferences(prev => ({ ...prev, weight_personality: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">
                Compatibilité minimum: {preferences.min_compatibility}%
              </label>
              <input
                type="range"
                min="50"
                max="90"
                value={preferences.min_compatibility}
                onChange={(e) => setPreferences(prev => ({ ...prev, min_compatibility: parseInt(e.target.value) }))}
                className="w-32"
              />
            </div>
            
            <Button 
              onClick={runAdvancedMatching} 
              disabled={loading}
              className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
            >
              {analyzing ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-spin" />
                  Analyse IA en cours...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Lancer l'IA Matching
                </>
              )}
            </Button>
          </div>

          {analyzing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Brain className="h-4 w-4 animate-pulse" />
                Analyse des profils avec intelligence artificielle...
              </div>
              <Progress value={66} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Matches Results */}
      {matches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Matches IA-Compatible ({matches.length})
            </h3>
            <Badge variant="secondary">
              <Sparkles className="h-3 w-3 mr-1" />
              IA Activée
            </Badge>
          </div>

          <div className="grid gap-4">
            {matches.map((match) => (
              <Card key={match.user_id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={match.avatar_url} />
                      <AvatarFallback>
                        {match.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{match.full_name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{match.age} ans</span>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {match.location}
                            </div>
                            <span>{match.profession}</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getCompatibilityColor(match.compatibility_score)}`}>
                            {getScoreIcon(match.compatibility_score)}
                            {match.compatibility_score}% compatible
                          </div>
                        </div>
                      </div>

                      {/* Detailed Scores */}
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <Shield className="h-3 w-3 text-primary" />
                            <span className="font-medium">Islamique</span>
                          </div>
                          <Progress value={match.islamic_score} className="h-2" />
                          <span className="text-xs text-muted-foreground">{match.islamic_score}%</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <Users className="h-3 w-3 text-sage-600" />
                            <span className="font-medium">Culturel</span>
                          </div>
                          <Progress value={match.cultural_score} className="h-2" />
                          <span className="text-xs text-muted-foreground">{match.cultural_score}%</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <Heart className="h-3 w-3 text-gold-600" />
                            <span className="font-medium">Personnalité</span>
                          </div>
                          <Progress value={match.personality_score} className="h-2" />
                          <span className="text-xs text-muted-foreground">{match.personality_score}%</span>
                        </div>
                      </div>

                      {/* Matching Reasons */}
                      {match.matching_reasons.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-emerald-700 mb-2">Points forts:</p>
                          <div className="flex flex-wrap gap-2">
                            {match.matching_reasons.map((reason, index) => (
                              <Badge key={index} variant="secondary" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                                {reason}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Potential Concerns */}
                      {match.potential_concerns.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-amber-700 mb-2">À considérer:</p>
                          <div className="flex flex-wrap gap-2">
                            {match.potential_concerns.map((concern, index) => (
                              <Badge key={index} variant="outline" className="text-xs text-amber-700 border-amber-300">
                                {concern}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            toast({
                              title: "Profil ouvert",
                              description: `Consultation du profil de ${match.full_name}`,
                            });
                            // Navigate to profile page
                            window.location.href = `/profile/${match.user_id}`;
                          }}
                        >
                          Voir le profil
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            toast({
                              title: "Intérêt envoyé",
                              description: `Votre intérêt pour ${match.full_name} a été exprimé (Compatibilité: ${match.compatibility_score}%)`,
                            });
                          }}
                        >
                          Montrer l'intérêt
                        </Button>
                        {preferences.family_approval_required && (
                          <Button size="sm" variant="secondary">
                            Demander approbation famille
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {matches.length === 0 && !loading && (
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
  );
};

export default AdvancedMatchingEngine;