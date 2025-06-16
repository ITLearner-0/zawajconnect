
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { questions } from "@/data/compatibilityQuestions";
import { CompatibilityMatch } from "@/types/compatibility";
import { useToast } from "@/components/ui/use-toast";

export function useCompatibilityMatches() {
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

        // Get profile information for all matches including profile pictures
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, gender, location, education_level, religious_practice_level, birth_date, profile_picture')
          .eq('is_visible', true);
        
        if (profileError) {
          console.error("Error fetching profiles:", profileError);
          setLoading(false);
          return;
        }

        // Calculate compatibility scores with detailed breakdown
        const compatibilityScores = results.map(otherResult => {
          let totalCompatibility = 0;
          let totalWeight = 0;
          let strengths: string[] = [];
          let differences: string[] = [];
          let dealbreakers: string[] = [];
          let hasDealbreaker = false;

          // Compare answers for each question
          Object.entries(myResults.answers as Record<string, any>).forEach(([qId, myAnswer]) => {
            const otherAnswer = (otherResult.answers as Record<string, any>)[qId];
            const myPreference = (myResults.preferences as Array<{category: string, weight: number}>)
              .find(p => p.category === qId);
            
            if (myAnswer && otherAnswer && myPreference) {
              const questionObj = questions.find(q => q.id.toString() === qId);
              if (!questionObj) return;
              
              // Calculate basic compatibility
              const compatibility = 100 - Math.abs(myAnswer.value - otherAnswer.value);
              const effectiveWeight = myAnswer.weight || myPreference.weight;
              
              totalCompatibility += (compatibility * effectiveWeight);
              totalWeight += effectiveWeight;

              // Categorize as strength or difference
              if (compatibility >= 80) {
                strengths.push(questionObj.category);
              } else if (compatibility <= 40) {
                differences.push(questionObj.category);
              }

              // Check dealbreakers
              if (myAnswer.isBreaker && 
                  myAnswer.breakerThreshold && 
                  otherAnswer.value < myAnswer.breakerThreshold) {
                dealbreakers.push(questionObj.category);
                hasDealbreaker = true;
              }
            }
          });

          // Calculate weighted score
          const finalScore = hasDealbreaker 
            ? 0 
            : Math.round((totalCompatibility / (totalWeight * 100)) * 100);

          // Get profile info for this match
          const profileData = profiles?.find(p => p.id === otherResult.user_id);
          
          // Calculate age if birth_date exists
          let age;
          if (profileData?.birth_date) {
            const birthDate = new Date(profileData.birth_date);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
          }

          return {
            userId: otherResult.user_id,
            score: finalScore,
            profileData: profileData ? {
              ...profileData,
              age
            } : undefined,
            matchDetails: {
              strengths: [...new Set(strengths)], // Remove duplicates
              differences: [...new Set(differences)],
              dealbreakers: dealbreakers.length ? [...new Set(dealbreakers)] : undefined
            }
          };
        });

        // Sort by compatibility score
        setMatchScores(compatibilityScores.sort((a, b) => b.score - a.score));
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
