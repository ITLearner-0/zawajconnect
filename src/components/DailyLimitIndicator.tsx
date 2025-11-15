import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const DailyLimitIndicator = () => {
  const { user, subscription } = useAuth();
  const [dailyStatus, setDailyStatus] = useState({
    views_today: 0,
    remaining: 5,
    limit_reached: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && !subscription.subscribed) {
      checkDailyLimit();
    }
  }, [user, subscription]);

  const checkDailyLimit = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-daily-limit');
      if (!error && data) {
        setDailyStatus(data);
      }
    } catch (error) {
      console.error('Error checking daily limit:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ne rien afficher pour les utilisateurs premium
  if (subscription.subscribed || loading) return null;

  return (
    <div className="bg-gradient-to-r from-emerald/10 to-emerald-light/10 border border-emerald/20 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {dailyStatus.limit_reached ? (
            <>
              <Lock className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-foreground">
                Limite quotidienne atteinte
              </span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 text-emerald" />
              <span className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{dailyStatus.remaining}/5</span>{' '}
                profils détaillés restants aujourd'hui
              </span>
            </>
          )}
        </div>
        <Badge
          variant={dailyStatus.limit_reached ? 'destructive' : 'secondary'}
          className="text-xs"
        >
          {dailyStatus.limit_reached ? 'Passez Premium' : 'Gratuit'}
        </Badge>
      </div>
    </div>
  );
};
