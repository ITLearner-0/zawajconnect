
import { useState, useEffect } from "react";
import { FilterCriteria } from "@/utils/location";
import { useCompatibilityMatches } from "@/hooks/useCompatibilityMatches";
import { Card, CardContent } from "@/components/ui/card";
import { IslamicPattern } from "@/components/ui/islamic-pattern";
import { Heart, Users, Loader, RefreshCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import EnhancedMatchCard from "@/components/compatibility/EnhancedMatchCard";
import { supabase } from "@/integrations/supabase/client";

interface NearbyMatchContentProps {
  maxDistance: number;
  filters: FilterCriteria;
  showCompatibility: boolean;
}

const NearbyMatchContent = ({ maxDistance, filters, showCompatibility }: NearbyMatchContentProps) => {
  const { matchScores, loading } = useCompatibilityMatches();
  const [canShowSuggestions, setCanShowSuggestions] = useState(true);
  const [remainingCount, setRemainingCount] = useState(5);
  const [displayedMatches, setDisplayedMatches] = useState<typeof matchScores>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  const handleRefreshMatches = async () => {
    if (!canShowSuggestions) return;
    
    setIsRefreshing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Simuler un rafraîchissement des correspondances
        setDisplayedMatches(matchScores.slice(0, 5));
        const newRemaining = Math.max(0, remainingCount - 1);
        setRemainingCount(newRemaining);
        setCanShowSuggestions(newRemaining > 0);
      }
    } catch (error) {
      console.error('Error refreshing matches:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    console.log("NearbyMatchContent - Real matchScores from database:", matchScores.length);
    console.log("NearbyMatchContent - canShowSuggestions:", canShowSuggestions);
    
    if (canShowSuggestions && matchScores.length > 0) {
      console.log("Setting displayed matches:", matchScores.slice(0, 5));
      setDisplayedMatches(matchScores.slice(0, 5));
    } else {
      console.log("No matches to display or suggestions disabled");
    }
  }, [matchScores, canShowSuggestions]);

  const filteredMatches = displayedMatches;

  console.log("NearbyMatchContent - Rendering with real data:", {
    loading,
    totalMatches: matchScores.length,
    filteredMatches: filteredMatches.length,
    canShowSuggestions,
    showCompatibility
  });

  return (
    <div className={isMobile ? "w-full" : "lg:col-span-2"}>
      <IslamicPattern variant="card" color="teal" className="overflow-hidden">
        <div className="bg-gradient-to-r from-rose-400 to-pink-400 text-white p-3 sm:p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Heart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            <h2 className="text-lg sm:text-xl font-medium">
              Correspondances compatibles {canShowSuggestions && `(${remainingCount} restantes)`}
            </h2>
          </div>
          
          {canShowSuggestions && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshMatches}
              disabled={isRefreshing}
              className="text-white hover:bg-white/20"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>

        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-rose-400" />
              <span className="ml-2 text-rose-600">Chargement des correspondances réelles...</span>
            </div>
          ) : !canShowSuggestions ? (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-6 text-center">
                <Heart className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-700 mb-2">
                  Limite quotidienne atteinte
                </h3>
                <p className="text-red-600 mb-4">
                  Vous avez consulté vos 5 suggestions quotidiennes. 
                  Revenez demain pour découvrir de nouveaux profils compatibles !
                </p>
              </CardContent>
            </Card>
          ) : filteredMatches.length > 0 ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-2">
                Affichage de {filteredMatches.length} correspondance(s) réelle(s) sur {matchScores.length} total
              </div>
              {filteredMatches.map((match) => (
                <EnhancedMatchCard 
                  key={match.userId} 
                  match={match}
                  onMessageClick={() => {
                    console.log('Message to user:', match.userId);
                  }}
                />
              ))}
            </div>
          ) : (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-blue-700 mb-2">
                  Aucune correspondance trouvée
                </h3>
                <p className="text-blue-600 mb-2">
                  Aucune correspondance compatible n'a été trouvée dans la base de données.
                </p>
                <p className="text-blue-500 text-sm">
                  Assurez-vous que d'autres utilisateurs ont complété le test de compatibilité.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </IslamicPattern>
    </div>
  );
};

export default NearbyMatchContent;
