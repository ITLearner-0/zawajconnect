
import { useState, useCallback } from 'react';
import { rateLimitingService, RateLimitResult, AbuseDetectionResult } from '@/services/rateLimiting/rateLimitingService';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useRateLimiting = () => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockInfo, setBlockInfo] = useState<{ until: number; reason: string } | null>(null);
  const { toast } = useToast();

  const checkRateLimit = useCallback(async (endpoint: string, requestData?: any): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to continue",
          variant: "destructive"
        });
        return false;
      }

      const userId = session.user.id;

      // Check rate limit
      const rateLimitResult: RateLimitResult = await rateLimitingService.checkRateLimit(userId, endpoint);

      if (!rateLimitResult.allowed) {
        if (rateLimitResult.blocked && rateLimitResult.blockUntil) {
          setIsBlocked(true);
          setBlockInfo({
            until: rateLimitResult.blockUntil,
            reason: 'Rate limit exceeded'
          });

          const blockDuration = Math.ceil((rateLimitResult.blockUntil - Date.now()) / (60 * 1000));
          toast({
            title: "Rate Limit Exceeded",
            description: `You've been temporarily blocked for ${blockDuration} minutes due to excessive requests.`,
            variant: "destructive"
          });
        } else {
          const resetTime = new Date(rateLimitResult.resetTime);
          toast({
            title: "Rate Limit Reached",
            description: `Please wait until ${resetTime.toLocaleTimeString()} before making more requests.`,
            variant: "destructive"
          });
        }
        return false;
      }

      // Check for abuse
      const abuseResult: AbuseDetectionResult = await rateLimitingService.detectAbuse(userId, endpoint, requestData);

      if (abuseResult.isAbusive) {
        console.warn('Abuse detected:', abuseResult);

        switch (abuseResult.recommendedAction) {
          case 'block':
            await rateLimitingService.blockUser(userId, 60 * 60 * 1000, abuseResult.reason); // 1 hour block
            setIsBlocked(true);
            setBlockInfo({
              until: Date.now() + 60 * 60 * 1000,
              reason: abuseResult.reason
            });
            toast({
              title: "Account Temporarily Suspended",
              description: `Your account has been suspended for suspicious activity: ${abuseResult.reason}`,
              variant: "destructive"
            });
            return false;

          case 'throttle':
            toast({
              title: "Usage Warning",
              description: `Suspicious activity detected: ${abuseResult.reason}. Please slow down your requests.`,
              variant: "destructive"
            });
            break;

          case 'warn':
            toast({
              title: "Usage Notice",
              description: abuseResult.reason,
            });
            break;
        }
      }

      // Show remaining requests if getting close to limit
      if (rateLimitResult.remaining <= 5 && rateLimitResult.remaining > 0) {
        toast({
          title: "Rate Limit Warning",
          description: `You have ${rateLimitResult.remaining} requests remaining in this time window.`,
        });
      }

      return true;
    } catch (error) {
      console.error('Rate limiting check failed:', error);
      return true; // Allow request if rate limiting fails
    }
  }, [toast]);

  const clearBlock = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await rateLimitingService.unblockUser(session.user.id);
        setIsBlocked(false);
        setBlockInfo(null);
        toast({
          title: "Block Cleared",
          description: "Your account access has been restored.",
        });
      }
    } catch (error) {
      console.error('Failed to clear block:', error);
    }
  }, [toast]);

  const getRemainingBlockTime = useCallback((): number => {
    if (!blockInfo) return 0;
    const remaining = blockInfo.until - Date.now();
    return Math.max(0, remaining);
  }, [blockInfo]);

  return {
    checkRateLimit,
    isBlocked,
    blockInfo,
    clearBlock,
    getRemainingBlockTime
  };
};
