
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { questions } from "@/data/compatibilityQuestions";
import { CompatibilityMatch } from "@/types/compatibility";
import { useToast } from "@/components/ui/use-toast";

export function useEnhancedCompatibilityMatches() {
  const [matchScores, setMatchScores] = useState<CompatibilityMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setLoading(false);
          return;
        }

        const { data: results, error } = await supabase
          .from('compatibility_results')
          .select('user_id, answers, preferences')
          .neq('user_id', session.user.id);

        if (error) {
          toast({
            title: "Error",
            description: "Failed to fetch potential matches",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        if (!results?.length) {
          setLoading(false);
          return;
        }

        // Get current user's latest results
        const { data: myResults } = await supabase
          .from('compatibility_results')
          .select('answers, preferences')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!myResults) {
          setLoading(false);
          return;
        }

        // Get profile information for all matches
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, gender, location, education_level, religious_practice_level, birth_date, email_verified, phone_verified, id_verified');
        
        if (profileError) {
          console.error("Error fetching profiles:", profileError);
          setLoading(false);
          return;
        }

        // Enhanced compatibility scoring algorithm
        const compatibilityScores = results.map(otherResult => {
          let totalCompatibility = 0;
          let totalWeight = 0;
          let categoryScores: Record<string, { score: number; weight: number }> = {};
          let dealbreakers: string[] = [];
          let hasDealbreaker = false;

          // Process each answer with enhanced algorithm
          Object.entries(myResults.answers as Record<string, any>).forEach(([qId, myAnswer]) => {
            const otherAnswer = (otherResult.answers as Record<string, any>)[qId];
            const questionObj = questions.find(q => q.id.toString() === qId);
            
            if (!questionObj || !myAnswer || !otherAnswer) return;
            
            const category = questionObj.category;
            const effectiveWeight = myAnswer.weight || questionObj.weight;
            
            // Enhanced compatibility calculation
            const rawDifference = Math.abs(myAnswer.value - otherAnswer.value);
            
            // Apply Islamic values weighting - critical questions get exponential scoring
            let compatibility;
            if (questionObj.isBreaker) {
              // For dealbreaker questions, use stricter scoring
              compatibility = rawDifference <= 20 ? 100 : Math.max(0, 100 - (rawDifference * 2));
            } else {
              // For regular questions, use linear scoring with bonuses for high agreement
              compatibility = 100 - rawDifference;
              if (rawDifference <= 10) compatibility += 10; // Bonus for very close answers
            }
            
            // Category-based scoring
            if (!categoryScores[category]) {
              categoryScores[category] = { score: 0, weight: 0 };
            }
            categoryScores[category].score += compatibility * effectiveWeight;
            categoryScores[category].weight += effectiveWeight;
            
            totalCompatibility += (compatibility * effectiveWeight);
            totalWeight += effectiveWeight;

            // Enhanced dealbreaker detection
            if (myAnswer.isBreaker && 
                myAnswer.breakerThreshold && 
                otherAnswer.value < myAnswer.breakerThreshold) {
              dealbreakers.push(category);
              hasDealbreaker = true;
            }
          });

          // Calculate weighted score with category bonuses
          let finalScore = totalWeight > 0 ? (totalCompatibility / (totalWeight * 100)) * 100 : 0;
          
          // Apply category-based bonuses for Islamic priorities
          const criticalCategories = ['Pratique Religieuse', 'Objectifs Spirituels', 'Fidélité', 'Engagement Long Terme'];
          let categoryBonus = 0;
          
          criticalCategories.forEach(category => {
            if (categoryScores[category]) {
              const categoryPercentage = (categoryScores[category].score / (categoryScores[category].weight * 100)) * 100;
              if (categoryPercentage >= 90) categoryBonus += 5;
              else if (categoryPercentage >= 80) categoryBonus += 2;
            }
          });
          
          finalScore = Math.min(100, finalScore + categoryBonus);
          
          // Apply dealbreaker penalty
          if (hasDealbreaker) {
            finalScore = Math.max(0, finalScore - 30); // Severe penalty but not complete elimination
          }

          // Get profile info
          const profileData = profiles?.find(p => p.id === otherResult.user_id);
          let age;
          if (profileData?.birth_date) {
            const birthDate = new Date(profileData.birth_date);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
          }

          // Calculate strengths and differences with enhanced logic
          const strengths: string[] = [];
          const differences: string[] = [];
          
          Object.entries(categoryScores).forEach(([category, data]) => {
            const categoryPercentage = (data.score / (data.weight * 100)) * 100;
            if (categoryPercentage >= 85) strengths.push(category);
            else if (categoryPercentage <= 50) differences.push(category);
          });

          return {
            userId: otherResult.user_id,
            score: Math.round(finalScore),
            profileData: profileData ? { ...profileData, age } : undefined,
            matchDetails: {
              strengths: [...new Set(strengths)],
              differences: [...new Set(differences)],
              dealbreakers: dealbreakers.length ? [...new Set(dealbreakers)] : undefined,
              categoryScores
            }
          };
        });

        // Sort by compatibility score with additional criteria
        const sortedMatches = compatibilityScores
          .filter(match => match.score > 0) // Filter out completely incompatible matches
          .sort((a, b) => {
            // Primary sort by score
            if (b.score !== a.score) return b.score - a.score;
            
            // Secondary sort by verification status (if available)
            if (a.profileData && b.profileData) {
              const aVerified = (a.profileData.email_verified ? 1 : 0) + 
                               (a.profileData.phone_verified ? 1 : 0) + 
                               (a.profileData.id_verified ? 1 : 0);
              const bVerified = (b.profileData.email_verified ? 1 : 0) + 
                               (b.profileData.phone_verified ? 1 : 0) + 
                               (b.profileData.id_verified ? 1 : 0);
              
              return bVerified - aVerified;
            }
            
            return 0;
          });

        setMatchScores(sortedMatches);
      } catch (error) {
        console.error("Error fetching matches:", error);
        toast({
          title: "Error",
          description: "Failed to load compatibility matches",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [toast]);

  return { matchScores, loading };
}
