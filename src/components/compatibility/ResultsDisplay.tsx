
import { useState, useEffect } from "react";
import CustomButton from "../CustomButton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface ResultsDisplayProps {
  score: number;
  onRetake: () => void;
}

const ResultsDisplay = ({ score, onRetake }: ResultsDisplayProps) => {
  const [matchScores, setMatchScores] = useState<Array<{userId: string, score: number}>>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

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
        return;
      }

      if (!results) return;

      // Get current user's latest results
      const { data: myResults } = await supabase
        .from('compatibility_results')
        .select('answers, preferences')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!myResults) return;

      // Calculate compatibility scores
      const compatibilityScores = results.map(otherResult => {
        let totalCompatibility = 0;
        let totalWeight = 0;

        // Compare answers for each question
        Object.entries(myResults.answers as Record<string, any>).forEach(([qId, myAnswer]) => {
          const otherAnswer = (otherResult.answers as Record<string, any>)[qId];
          const myPreference = (myResults.preferences as Array<{category: string, weight: number}>)
            .find(p => p.category === qId);
          
          if (myAnswer && otherAnswer && myPreference) {
            // Calculate how well their answer matches your preference
            const compatibility = 100 - Math.abs(myAnswer.value - otherAnswer.value);
            totalCompatibility += (compatibility * myPreference.weight);
            totalWeight += myPreference.weight;

            // Check dealbreakers
            if (myAnswer.isBreaker && 
                myAnswer.breakerThreshold && 
                otherAnswer.value < myAnswer.breakerThreshold) {
              totalCompatibility = 0;
              totalWeight = 1;
            }
          }
        });

        return {
          userId: otherResult.user_id,
          score: Math.round((totalCompatibility / (totalWeight * 100)) * 100)
        };
      });

      // Sort by compatibility score
      setMatchScores(compatibilityScores.sort((a, b) => b.score - a.score));
    };

    fetchMatches();
  }, [toast]);

  return (
    <div className="text-center space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Your Compatibility Profile</h2>
        <div className="text-6xl font-bold text-primary mt-4">{score}%</div>
        <p className="text-gray-600 mt-2">
          Your compatibility preferences have been saved
        </p>
      </div>

      {matchScores.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Potential Matches</h3>
          <div className="space-y-4">
            {matchScores.map((match, index) => (
              <div 
                key={match.userId}
                className="p-4 bg-accent/10 rounded-lg flex justify-between items-center"
              >
                <span>Match #{index + 1}</span>
                <span className="text-lg font-semibold text-primary">
                  {match.score}% Compatible
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 space-y-3">
        <CustomButton onClick={onRetake} variant="outline">
          Take Test Again
        </CustomButton>
        
        <div>
          <CustomButton onClick={() => navigate('/nearby')} variant="default">
            Find Nearby Matches
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
