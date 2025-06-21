
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, AlertCircle } from "lucide-react";
import { DailyLimitsService } from "@/services/dailyLimitsService";
import { supabase } from "@/integrations/supabase/client";

interface DailyLimitBannerProps {
  onLimitCheck: (canShow: boolean, remaining: number) => void;
}

const DailyLimitBanner: React.FC<DailyLimitBannerProps> = ({ onLimitCheck }) => {
  const [remaining, setRemaining] = useState(5);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkLimits = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        setUserId(session.user.id);
        const remainingCount = await DailyLimitsService.getRemainingCount(session.user.id);
        const canShow = await DailyLimitsService.canShowSuggestions(session.user.id);
        
        setRemaining(remainingCount);
        onLimitCheck(canShow, remainingCount);
      } catch (error) {
        console.error('Error checking daily limits:', error);
      } finally {
        setLoading(false);
      }
    };

    checkLimits();
  }, [onLimitCheck]);

  const getTimeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}min`;
  };

  if (loading) return null;

  const progressValue = ((5 - remaining) / 5) * 100;
  const isLimitReached = remaining === 0;

  return (
    <Card className={`mb-4 ${isLimitReached ? 'border-red-200 bg-red-50/50' : 'border-blue-200 bg-blue-50/50'}`}>
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          {isLimitReached ? (
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          ) : (
            <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
          )}
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">
                {isLimitReached ? 'Limite quotidienne atteinte' : 'Suggestions quotidiennes'}
              </span>
              <span className={`text-sm font-medium ${isLimitReached ? 'text-red-600' : 'text-blue-600'}`}>
                {remaining}/5
              </span>
            </div>
            
            <Progress 
              value={progressValue} 
              className={`h-2 ${isLimitReached ? '[&>div]:bg-red-500' : '[&>div]:bg-blue-500'}`}
            />
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {isLimitReached 
                  ? 'Revenez demain pour de nouvelles suggestions'
                  : `${remaining} suggestion${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}`
                }
              </span>
              <span>Remise à zéro dans {getTimeUntilReset()}</span>
            </div>
            
            {isLimitReached && (
              <p className="text-xs text-red-600 mt-2">
                Notre système limite les suggestions à 5 par jour pour favoriser des interactions de qualité.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyLimitBanner;
