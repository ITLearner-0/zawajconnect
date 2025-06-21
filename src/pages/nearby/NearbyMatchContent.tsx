
import { useState, useEffect } from "react";
import { FilterCriteria } from "@/utils/location";
import { useCompatibilityMatches } from "@/hooks/useCompatibilityMatches";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IslamicPattern } from "@/components/ui/islamic-pattern";
import { Heart, Users, Loader, RefreshCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import EnhancedMatchCard from "@/components/compatibility/EnhancedMatchCard";
import DailyLimitBanner from "@/components/compatibility/DailyLimitBanner";
import { DailyLimitsService } from "@/services/dailyLimitsService";
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

  const handleLimitCheck = (canShow: boolean, remaining: number) => {
    setCanShowSuggestions(canShow);
    setRemainingCount(remaining);
  };

  const handleRefreshMatches = async () => {
    if (!canShowSuggestions) return;
    
    setIsRefreshing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const success = await DailyLimitsService.incrementSuggestionCount(session.user.id);
        if (success) {
          setDisplayedMatches(matchScores.slice(0, 5)); // Montrer 5 nouvelles suggestions
          const newRemaining = await DailyLimitsService.getRemainingCount(session.user.id);
          setRemainingCount(newRemaining);
          setCanShowSuggestions(newRemaining > 0);
        }
      }
    } catch (error) {
      console.error('Error refreshing matches:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (canShowSuggestions && matchScores.length > 0) {
      setDisplayedMatches(matchScores.slice(0, 5));
    }
  }, [matchScores, canShowSuggestions]);

  const filteredMatches = displayedMatches;

  return (
    <div className={isMobile ? "w-full" : "lg:col-span-2"}>
      <DailyLimitBanner onLimitCheck={handleLimitCheck} />
      
      <IslamicPattern variant="card" color="teal" className="overflow-hidden">
        <div className="bg-gradient-to-r from-rose-400 to-pink-400 text-white p-3 sm:p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Heart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            <h2 className="text-lg sm:text-xl font-medium">
              {t('nearby.compatibleMatches')} {canShowSuggestions && `(${remainingCount} restantes)`}
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
          {!showCompatibility ? (
            <Card className="bg-rose-50 border-rose-200">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-rose-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-rose-700 mb-2">
                  {t('nearby.takeCompatibilityTest')}
                </h3>
                <p className="text-rose-600 mb-4">
                  {t('nearby.compatibilityTestDescription')}
                </p>
                <Button className="bg-rose-500 hover:bg-rose-600 text-white">
                  {t('nearby.startTest')}
                </Button>
              </CardContent>
            </Card>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-rose-400" />
              <span className="ml-2 text-rose-600">{t('nearby.loadingMatches')}</span>
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
              {filteredMatches.map((match) => (
                <EnhancedMatchCard 
                  key={match.userId} 
                  match={match}
                  onMessageClick={() => {
                    // Logique pour envoyer un message
                    console.log('Message to:', match.userId);
                  }}
                />
              ))}
            </div>
          ) : (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-blue-700 mb-2">
                  {t('nearby.noMatches')}
                </h3>
                <p className="text-blue-600">
                  {t('nearby.adjustFilters')}
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
