
import { useState, useEffect } from "react";
import CustomButton from "../CustomButton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CompatibilityMatch } from "@/types/compatibility";
import { questions } from "@/data/compatibilityQuestions";
import { Badge } from "@/components/ui/badge";

interface ResultsDisplayProps {
  score: number;
  onRetake: () => void;
}

const ResultsDisplay = ({ score, onRetake }: ResultsDisplayProps) => {
  const [matchScores, setMatchScores] = useState<CompatibilityMatch[]>([]);
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
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

      if (!results?.length) return;

      // Get current user's latest results
      const { data: myResults } = await supabase
        .from('compatibility_results')
        .select('answers, preferences')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!myResults) return;

      // Get profile information for all matches
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, gender, location, education_level, religious_practice_level, birth_date');
      
      if (profileError) {
        console.error("Error fetching profiles:", profileError);
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
    };

    fetchMatches();
  }, [toast]);

  const toggleMatchDetails = (userId: string) => {
    setExpandedMatch(expandedMatch === userId ? null : userId);
  };

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
            {matchScores.map((match) => (
              <Card key={match.userId} className="overflow-hidden">
                <div 
                  className="p-4 bg-white rounded-lg flex justify-between items-center cursor-pointer"
                  onClick={() => toggleMatchDetails(match.userId)}
                >
                  <div className="text-left">
                    <span className="font-medium">
                      {match.profileData ? 
                        `${match.profileData.first_name} ${match.profileData.last_name?.charAt(0) || ""}` : 
                        `Match #${match.userId.slice(0, 4)}`}
                    </span>
                    {match.profileData && (
                      <p className="text-sm text-gray-500">
                        {[
                          match.profileData.age ? `${match.profileData.age} years` : null,
                          match.profileData.location,
                          match.profileData.religious_practice_level
                        ].filter(Boolean).join(" • ")}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center">
                      <Progress 
                        value={match.score} 
                        className="w-24 h-2 mr-2" 
                        indicatorClassName={
                          match.score >= 80 ? "bg-green-500" : 
                          match.score >= 60 ? "bg-blue-500" :
                          match.score >= 40 ? "bg-yellow-500" : "bg-red-500"
                        }
                      />
                      <span className={`font-semibold ${
                        match.score >= 80 ? "text-green-600" : 
                        match.score >= 60 ? "text-blue-600" :
                        match.score >= 40 ? "text-yellow-600" : "text-red-600"
                      }`}>
                        {match.score}%
                      </span>
                    </div>
                  </div>
                </div>
                
                {expandedMatch === match.userId && match.matchDetails && (
                  <CardContent className="pt-4 pb-4 bg-gray-50">
                    <div className="space-y-3 text-left">
                      {match.matchDetails.dealbreakers && match.matchDetails.dealbreakers.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-red-600">Dealbreakers</h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {match.matchDetails.dealbreakers.map(item => (
                              <Badge key={item} variant="destructive">{item}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {match.matchDetails.strengths.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-green-600">Strengths</h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {match.matchDetails.strengths.map(item => (
                              <Badge key={item} variant="outline" className="bg-green-50 text-green-700 border-green-200">{item}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {match.matchDetails.differences.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-amber-600">Differences</h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {match.matchDetails.differences.map(item => (
                              <Badge key={item} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">{item}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
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
