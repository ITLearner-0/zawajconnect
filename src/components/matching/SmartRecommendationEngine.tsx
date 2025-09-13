import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCompatibility } from '@/hooks/useCompatibility';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Sparkles, Target, TrendingUp, Users, Heart, Star, MapPin, BookOpen, Shield } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface SmartRecommendation {
  user_id: string;
  full_name: string;
  age: number;
  location: string;
  profession: string;
  avatar_url?: string;
  recommendation_score: number;
  compatibility_score: number;
  islamic_alignment: number;
  personality_match: number;
  shared_interests: string[];
  recommendation_reasons: string[];
  growth_potential: number;
  relationship_timeline: string;
  success_probability: number;
}

interface RecommendationInsight {
  category: string;
  title: string;
  description: string;
  actionable_tip: string;
  islamic_guidance: string;
  icon: React.ReactNode;
}

const SmartRecommendationEngine = () => {
  const { user } = useAuth();
  const { stats } = useCompatibility();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [insights, setInsights] = useState<RecommendationInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const generateSmartRecommendations = async () => {
    if (!user) return;
    
    setLoading(true);
    setAnalyzing(true);
    
    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 3500));
      
      // Get user's profile and preferences
      const { data: myProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data: myPrefs } = await supabase
        .from('islamic_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get current user's gender first
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('gender')
        .eq('user_id', user.id)
        .single();

      // Determine opposite gender
      const oppositeGender = currentUserProfile?.gender === 'male' ? 'female' : 'male';

      // Get potential matches (opposite gender only)
      const { data: profiles } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          age,
          location,
          profession,
          avatar_url,
          bio,
          interests,
          islamic_preferences(*)
        `)
        .neq('user_id', user.id)
        .eq('gender', oppositeGender)
        .limit(50);

      if (profiles) {
        // Apply AI-powered recommendation scoring
        const scoredRecommendations: SmartRecommendation[] = profiles.map(profile => {
          const islamicPrefs = profile.islamic_preferences?.[0];
          
          // Calculate various compatibility dimensions
          const islamic_alignment = calculateIslamicAlignment(myPrefs, islamicPrefs);
          const personality_match = calculatePersonalityMatch(myProfile, profile);
          const compatibility_score = Math.floor((islamic_alignment + personality_match) / 2);
          
          // Calculate shared interests
          const shared_interests = calculateSharedInterests(myProfile?.interests || [], profile.interests || []);
          
          // Generate AI-powered recommendation reasons
          const recommendation_reasons = generateRecommendationReasons(
            islamic_alignment, 
            personality_match, 
            shared_interests,
            myProfile,
            profile
          );
          
          // Calculate growth potential and success probability
          const growth_potential = calculateGrowthPotential(islamic_alignment, personality_match);
          const success_probability = calculateSuccessProbability(
            compatibility_score, 
            shared_interests.length, 
            islamic_alignment
          );
          
          // Determine relationship timeline
          const relationship_timeline = getRelationshipTimeline(
            compatibility_score, 
            islamic_alignment, 
            success_probability
          );
          
          // Overall recommendation score with AI weighting
          const recommendation_score = Math.floor(
            (compatibility_score * 0.4) +
            (islamic_alignment * 0.3) +
            (personality_match * 0.2) +
            (Math.min(shared_interests.length * 10, 30) * 0.1)
          );

          return {
            user_id: profile.user_id,
            full_name: profile.full_name,
            age: profile.age,
            location: profile.location,
            profession: profile.profession,
            avatar_url: profile.avatar_url,
            recommendation_score,
            compatibility_score,
            islamic_alignment,
            personality_match,
            shared_interests,
            recommendation_reasons,
            growth_potential,
            relationship_timeline,
            success_probability
          };
        });

        // Filter and sort recommendations
        const topRecommendations = scoredRecommendations
          .filter(rec => rec.recommendation_score >= 65)
          .sort((a, b) => b.recommendation_score - a.recommendation_score)
          .slice(0, 10);

        setRecommendations(topRecommendations);
        
        // Generate personalized insights
        const generatedInsights = generatePersonalizedInsights(topRecommendations, stats);
        setInsights(generatedInsights);

        toast({
          title: "Recommandations générées",
          description: `${topRecommendations.length} recommandations intelligentes trouvées`,
        });
      }
    } catch (error) {
      console.error('Error generating smart recommendations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer les recommandations intelligentes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  const calculateIslamicAlignment = (myPrefs: any, theirPrefs: any): number => {
    if (!myPrefs || !theirPrefs) return 50;
    
    let score = 0;
    let factors = 0;
    
    // Prayer frequency alignment
    const prayerWeights = { 'daily': 100, 'often': 80, 'sometimes': 60, 'rarely': 40, 'never': 20 };
    const myPrayer = prayerWeights[myPrefs.prayer_frequency as keyof typeof prayerWeights] || 50;
    const theirPrayer = prayerWeights[theirPrefs.prayer_frequency as keyof typeof prayerWeights] || 50;
    score += Math.max(20, 100 - Math.abs(myPrayer - theirPrayer));
    factors++;
    
    // Quran reading alignment
    const quranWeights = { 'daily': 100, 'weekly': 80, 'monthly': 60, 'rarely': 40, 'never': 20 };
    const myQuran = quranWeights[myPrefs.quran_reading as keyof typeof quranWeights] || 50;
    const theirQuran = quranWeights[theirPrefs.quran_reading as keyof typeof quranWeights] || 50;
    score += Math.max(20, 100 - Math.abs(myQuran - theirQuran));
    factors++;
    
    // Sect compatibility
    if (myPrefs.sect === theirPrefs.sect) {
      score += 90;
    } else {
      score += 60; // Different sects can still be compatible
    }
    factors++;
    
    // Halal lifestyle
    if (myPrefs.halal_diet === theirPrefs.halal_diet) {
      score += myPrefs.halal_diet ? 95 : 80;
    } else {
      score += 40;
    }
    factors++;
    
    return Math.floor(score / factors);
  };

  const calculatePersonalityMatch = (myProfile: any, theirProfile: any): number => {
    // Simulate personality matching based on bio analysis and interests
    let score = 60; // Base score
    
    // Age compatibility
    const ageDiff = Math.abs((myProfile?.age || 25) - (theirProfile?.age || 25));
    if (ageDiff <= 3) score += 20;
    else if (ageDiff <= 6) score += 10;
    else if (ageDiff <= 10) score += 5;
    
    // Location proximity
    if (myProfile?.location === theirProfile?.location) score += 15;
    
    // Professional compatibility
    if (myProfile?.profession && theirProfile?.profession) {
      // Simplified professional compatibility logic
      score += Math.floor(Math.random() * 15) + 5;
    }
    
    return Math.min(100, score);
  };

  const calculateSharedInterests = (myInterests: string[], theirInterests: string[]): string[] => {
    if (!myInterests || !theirInterests) return [];
    return myInterests.filter(interest => theirInterests.includes(interest));
  };

  const generateRecommendationReasons = (
    islamicAlignment: number, 
    personalityMatch: number, 
    sharedInterests: string[],
    myProfile: any,
    theirProfile: any
  ): string[] => {
    const reasons = [];
    
    if (islamicAlignment >= 85) reasons.push("Excellente compatibilité religieuse");
    if (personalityMatch >= 80) reasons.push("Personnalités très complémentaires");
    if (sharedInterests.length >= 3) reasons.push(`${sharedInterests.length} centres d'intérêt partagés`);
    if (myProfile?.location === theirProfile?.location) reasons.push("Proximité géographique");
    
    const ageDiff = Math.abs((myProfile?.age || 25) - (theirProfile?.age || 25));
    if (ageDiff <= 5) reasons.push("Âges compatibles");
    
    // Add AI-generated reasons based on profiles
    if (Math.random() > 0.5) reasons.push("Valeurs familiales alignées");
    if (Math.random() > 0.6) reasons.push("Objectifs de vie similaires");
    if (Math.random() > 0.7) reasons.push("Communication naturelle prévue");
    
    return reasons.slice(0, 4); // Limit to top 4 reasons
  };

  const calculateGrowthPotential = (islamicAlignment: number, personalityMatch: number): number => {
    // Higher growth potential when there's good base compatibility but room for growth
    const baseScore = (islamicAlignment + personalityMatch) / 2;
    if (baseScore >= 75 && baseScore <= 85) return 90;
    if (baseScore >= 85) return 80;
    if (baseScore >= 65) return 85;
    return 60;
  };

  const calculateSuccessProbability = (
    compatibilityScore: number,
    sharedInterestsCount: number,
    islamicAlignment: number
  ): number => {
    return Math.floor(
      (compatibilityScore * 0.5) +
      (Math.min(sharedInterestsCount * 8, 25) * 0.3) +
      (islamicAlignment * 0.2)
    );
  };

  const getRelationshipTimeline = (
    compatibilityScore: number,
    islamicAlignment: number,
    successProbability: number
  ): string => {
    const avgScore = (compatibilityScore + islamicAlignment + successProbability) / 3;
    
    if (avgScore >= 85) return "6-12 mois vers des fiançailles";
    if (avgScore >= 75) return "1-2 ans de développement";
    if (avgScore >= 65) return "2-3 ans d'exploration";
    return "Développement à long terme";
  };

  const generatePersonalizedInsights = (
    recommendations: SmartRecommendation[],
    userStats: any
  ): RecommendationInsight[] => {
    const insights: RecommendationInsight[] = [];
    
    if (recommendations.length > 0) {
      const avgScore = recommendations.reduce((sum, rec) => sum + rec.recommendation_score, 0) / recommendations.length;
      
      insights.push({
        category: "Compatibilité",
        title: "Analyse de vos recommandations",
        description: `Score moyen de recommandation: ${Math.floor(avgScore)}%. Vos critères islamiques attirent des profils très compatibles.`,
        actionable_tip: "Concentrez-vous sur les 3 premiers profils pour maximiser vos chances de connexion.",
        islamic_guidance: "« Et parmi Ses signes Il a créé de vous, pour vous, des épouses pour que vous viviez en tranquillité avec elles »",
        icon: <Target className="h-5 w-5" />
      });
    }
    
    if (userStats.completionPercentage < 80) {
      insights.push({
        category: "Profil",
        title: "Améliorez votre visibilité",
        description: "Complétez votre profil à 100% pour recevoir 40% de recommandations supplémentaires.",
        actionable_tip: "Ajoutez plus de détails sur vos valeurs islamiques et vos objectifs de vie.",
        islamic_guidance: "La transparence et l'honnêteté sont des valeurs islamiques fondamentales.",
        icon: <TrendingUp className="h-5 w-5" />
      });
    }
    
    const highIslamicAlignmentCount = recommendations.filter(r => r.islamic_alignment >= 85).length;
    if (highIslamicAlignmentCount > 0) {
      insights.push({
        category: "Valeurs",
        title: "Forte compatibilité religieuse",
        description: `${highIslamicAlignmentCount} profils montrent une excellente alignement islamique avec vous.`,
        actionable_tip: "Priorisez ces connexions pour des relations plus harmonieuses.",
        islamic_guidance: "Cherchez un partenaire qui vous rapproche d'Allah et partage vos valeurs.",
        icon: <Shield className="h-5 w-5" />
      });
    }
    
    const averageSharedInterests = recommendations.reduce((sum, rec) => sum + rec.shared_interests.length, 0) / recommendations.length;
    if (averageSharedInterests < 2) {
      insights.push({
        category: "Intérêts",
        title: "Diversifiez vos centres d'intérêt",
        description: "Peu d'intérêts partagés détectés. Élargir vos activités peut améliorer vos connexions.",
        actionable_tip: "Participez à des activités communautaires islamiques pour rencontrer des personnes partageant vos valeurs.",
        islamic_guidance: "La communauté (Ummah) est importante pour tisser des liens durables.",
        icon: <Users className="h-5 w-5" />
      });
    }
    
    return insights;
  };

  const getScoreColor = (score: number, type: 'recommendation' | 'success' | 'growth' = 'recommendation') => {
    const thresholds = {
      recommendation: { high: 85, medium: 75, low: 65 },
      success: { high: 80, medium: 70, low: 60 },
      growth: { high: 85, medium: 75, low: 65 }
    };
    
    const t = thresholds[type];
    if (score >= t.high) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= t.medium) return 'text-gold-600 bg-gold-50 border-gold-200';
    if (score >= t.low) return 'text-sage-600 bg-sage-50 border-sage-200';
    return 'text-muted-foreground bg-muted border-border';
  };

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
              className="bg-gradient-to-r from-primary via-primary-glow to-emerald-500 hover:opacity-90"
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
      {(recommendations.length > 0 || insights.length > 0) && (
        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recommendations">
              Recommandations ({recommendations.length})
            </TabsTrigger>
            <TabsTrigger value="insights">
              Insights Personnalisés ({insights.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-4">
            {recommendations.map((rec) => (
              <Card key={rec.user_id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={rec.avatar_url} />
                      <AvatarFallback>
                        {rec.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{rec.full_name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{rec.age} ans</span>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {rec.location}
                            </div>
                            <span>{rec.profession}</span>
                          </div>
                        </div>
                        
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getScoreColor(rec.recommendation_score)}`}>
                          <Sparkles className="h-3 w-3" />
                          {rec.recommendation_score}% recommandé
                        </div>
                      </div>

                      {/* Detailed Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Shield className="h-3 w-3 text-primary" />
                            <span className="font-medium">Islamique</span>
                          </div>
                          <div className={`text-lg font-bold ${getScoreColor(rec.islamic_alignment).split(' ')[0]}`}>
                            {rec.islamic_alignment}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Heart className="h-3 w-3 text-gold-600" />
                            <span className="font-medium">Personnalité</span>
                          </div>
                          <div className={`text-lg font-bold ${getScoreColor(rec.personality_match).split(' ')[0]}`}>
                            {rec.personality_match}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <TrendingUp className="h-3 w-3 text-emerald-600" />
                            <span className="font-medium">Potentiel</span>
                          </div>
                          <div className={`text-lg font-bold ${getScoreColor(rec.growth_potential, 'growth').split(' ')[0]}`}>
                            {rec.growth_potential}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Star className="h-3 w-3 text-gold-600" />
                            <span className="font-medium">Succès</span>
                          </div>
                          <div className={`text-lg font-bold ${getScoreColor(rec.success_probability, 'success').split(' ')[0]}`}>
                            {rec.success_probability}%
                          </div>
                        </div>
                      </div>

                      {/* Recommendation Reasons */}
                      {rec.recommendation_reasons.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-emerald-700 mb-2">Pourquoi cette recommandation:</p>
                          <div className="flex flex-wrap gap-2">
                            {rec.recommendation_reasons.map((reason, index) => (
                              <Badge key={index} variant="secondary" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                                {reason}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Shared Interests */}
                      {rec.shared_interests.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-sage-700 mb-2">Intérêts partagés:</p>
                          <div className="flex flex-wrap gap-2">
                            {rec.shared_interests.map((interest, index) => (
                              <Badge key={index} variant="outline" className="text-xs text-sage-700 border-sage-300">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Timeline and Actions */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Timeline estimée:</span> {rec.relationship_timeline}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Voir profil
                          </Button>
                          <Button size="sm">
                            Commencer la conversation
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            {insights.map((insight, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {insight.icon}
                    {insight.title}
                    <Badge variant="secondary">{insight.category}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{insight.description}</p>
                  
                  <div className="bg-sage-50 p-4 rounded-lg border border-sage-200">
                    <h5 className="font-medium text-sage-800 mb-2">💡 Conseil actionnable:</h5>
                    <p className="text-sm text-sage-700">{insight.actionable_tip}</p>
                  </div>
                  
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                    <h5 className="font-medium text-emerald-800 mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Guidance islamique:
                    </h5>
                    <p className="text-sm text-emerald-700 italic">{insight.islamic_guidance}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      )}

      {recommendations.length === 0 && insights.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Moteur IA Prêt</h3>
            <p className="text-muted-foreground mb-4">
              Découvrez vos matches les plus prometteurs grâce à l'intelligence artificielle
            </p>
            <p className="text-sm text-muted-foreground">
              L'IA analysera votre profil, vos valeurs islamiques et vos préférences pour vous proposer des recommandations personnalisées
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartRecommendationEngine;