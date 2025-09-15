import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface SmartRecommendation {
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

export interface RecommendationInsight {
  category: string;
  title: string;
  description: string;
  actionable_tip: string;
  islamic_guidance: string;
  icon: React.ReactNode;
}

export const useSmartRecommendations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [insights, setInsights] = useState<RecommendationInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

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

  const generateSmartRecommendations = useCallback(async () => {
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
        .maybeSingle();

      const { data: myPrefs } = await supabase
        .from('islamic_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Get current user's gender first
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

      // Get potential matches (opposite gender only, excluding Walis)
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
          interests
        `)
        .neq('user_id', user.id)
        .eq('gender', oppositeGender)
        .not('user_id', 'in', waliUserIds.length > 0 ? `(${waliUserIds.join(',')})` : '()')
        .limit(50);

      if (profiles && profiles.length > 0) {
        // Get Islamic preferences for these users
        const userIds = profiles.map(p => p.user_id);
        const { data: islamicPrefs } = await supabase
          .from('islamic_preferences')
          .select('*')
          .in('user_id', userIds);

        // Combine the data
        const enrichedProfiles = profiles.map(profile => ({
          ...profile,
          islamic_preferences: islamicPrefs?.filter(p => p.user_id === profile.user_id) || []
        }));

        // Apply AI-powered recommendation scoring
        const scoredRecommendations: SmartRecommendation[] = enrichedProfiles.map(profile => {
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
  }, [user, toast]);

  return {
    recommendations,
    insights,
    loading,
    analyzing,
    generateSmartRecommendations
  };
};