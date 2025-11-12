import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { rateLimitingService } from '@/services/rateLimiting/rateLimitingService';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDuration?: number;
}

interface BlockInfo {
  isBlocked: boolean;
  blockedUntil?: number;
  reason?: string;
}

export const useRateLimiting = () => {
  const [rateLimitData, setRateLimitData] = useState<Map<string, any>>(new Map());

  const checkRateLimit = useCallback(
    async (action: string, customConfig?: RateLimitConfig): Promise<boolean> => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return false;

        const result = await rateLimitingService.checkRateLimit(user.id, action);

        if (!result.allowed) {
          // Log rate limit violation
          await supabase.rpc('log_security_event', {
            p_user_id: user.id,
            p_action: 'rate_limit_exceeded',
            p_resource_type: 'rate_limit',
            p_resource_id: action,
            p_success: false,
            p_risk_level: 'medium',
            p_details: {
              action,
              remaining: result.remaining,
              reset_time: result.resetTime,
              blocked: result.blocked,
            },
          });
        }

        return result.allowed;
      } catch (error) {
        console.error('Rate limit check failed:', error);
        return true; // Allow by default if check fails
      }
    },
    []
  );

  const getRemainingRequests = useCallback(
    (action: string): number => {
      const data = rateLimitData.get(action);
      return data?.remaining || 0;
    },
    [rateLimitData]
  );

  const resetRateLimit = useCallback(async (action: string): Promise<void> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await rateLimitingService.unblockUser(user.id);
      setRateLimitData((prev) => {
        const newData = new Map(prev);
        newData.delete(action);
        return newData;
      });
    } catch (error) {
      console.error('Rate limit reset failed:', error);
    }
  }, []);

  const isBlocked = useCallback(
    (action: string): boolean => {
      const data = rateLimitData.get(action);
      return data?.blocked || false;
    },
    [rateLimitData]
  );

  const blockInfo = useCallback(
    (action: string): BlockInfo => {
      const data = rateLimitData.get(action);
      return {
        isBlocked: data?.blocked || false,
        blockedUntil: data?.blockUntil,
        reason: data?.reason,
      };
    },
    [rateLimitData]
  );

  const getRemainingBlockTime = useCallback(
    (action: string): number => {
      const data = rateLimitData.get(action);
      if (!data?.blocked || !data?.blockUntil) return 0;

      const now = Date.now();
      const remaining = data.blockUntil - now;
      return Math.max(0, remaining);
    },
    [rateLimitData]
  );

  return {
    checkRateLimit,
    getRemainingRequests,
    resetRateLimit,
    isBlocked,
    blockInfo,
    getRemainingBlockTime,
  };
};
