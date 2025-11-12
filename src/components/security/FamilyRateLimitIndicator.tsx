// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, AlertCircle } from 'lucide-react';

interface OperationLimit {
  id: string;
  operation_type: string;
  operation_count: number;
  last_reset_at: string;
}

const FamilyRateLimitIndicator = () => {
  const { user } = useAuth();
  const [limits, setLimits] = useState<OperationLimit[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOperationLimits = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('family_operation_limits')
        .select('*')
        .eq('user_id', user.id);

      if (error && !error.message.includes('permission denied')) {
        throw error;
      }

      setLimits(data || []);
    } catch (error) {
      console.error('Failed to load operation limits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOperationLimits();
  }, [user]);

  const getOperationDisplay = (type: string) => {
    switch (type) {
      case 'family_invitation':
        return { label: 'Invitations Familiales', max: 3, icon: Users };
      default:
        return { label: type, max: 3, icon: AlertCircle };
    }
  };

  const getTimeUntilReset = (lastReset: string) => {
    const resetTime = new Date(lastReset);
    const nextReset = new Date(resetTime.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    const diffMs = nextReset.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Réinitialisé';
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-2 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  if (limits.length === 0) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-4 w-4 text-emerald" />
          <h4 className="text-sm font-medium">Limites d'opérations</h4>
        </div>
        <p className="text-xs text-muted-foreground">
          Aucune opération effectuée aujourd'hui
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-4 w-4 text-emerald" />
        <h4 className="text-sm font-medium">Limites d'opérations</h4>
      </div>

      <div className="space-y-3">
        {limits.map((limit) => {
          const { label, max, icon: Icon } = getOperationDisplay(limit.operation_type);
          const percentage = (limit.operation_count / max) * 100;
          const isNearLimit = percentage >= 80;
          const isAtLimit = limit.operation_count >= max;

          return (
            <div key={limit.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {limit.operation_count}/{max}
                  </span>
                  {isAtLimit && (
                    <Badge variant="destructive" className="text-xs">
                      Limite atteinte
                    </Badge>
                  )}
                  {isNearLimit && !isAtLimit && (
                    <Badge variant="secondary" className="text-xs">
                      Proche limite
                    </Badge>
                  )}
                </div>
              </div>

              <Progress 
                value={percentage} 
                className="h-2"
              />

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Réinitialisation dans:</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{getTimeUntilReset(limit.last_reset_at)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-2 bg-muted/50 rounded-md">
        <p className="text-xs text-muted-foreground">
          Les limites sont réinitialisées toutes les 24 heures pour prévenir les abus.
        </p>
      </div>
    </Card>
  );
};

export default FamilyRateLimitIndicator;