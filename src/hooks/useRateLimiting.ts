import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface RateLimitState {
  count: number;
  windowStart: number;
  blocked: boolean;
  blockUntil: number;
}

const defaultConfigs: Record<string, RateLimitConfig> = {
  'api/messages': { maxRequests: 30, windowMs: 60000, blockDurationMs: 300000 },
  'api/profiles': { maxRequests: 10, windowMs: 60000, blockDurationMs: 180000 },
  'api/auth': { maxRequests: 5, windowMs: 300000, blockDurationMs: 900000 },
  'api/compatibility': { maxRequests: 20, windowMs: 300000, blockDurationMs: 600000 },
  'action_profile_update': { maxRequests: 5, windowMs: 300000, blockDurationMs: 600000 },
  'action_message_send': { maxRequests: 20, windowMs: 60000, blockDurationMs: 300000 },
};

export const useRateLimiting = () => {
  const [rateLimitStates, setRateLimitStates] = useState<Record<string, RateLimitState>>({});
  const cleanupTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  const checkRateLimit = useCallback(async (endpoint: string, requestData?: any): Promise<boolean> => {
    const config = defaultConfigs[endpoint];
    if (!config) {
      console.warn(`No rate limit config found for endpoint: ${endpoint}`);
      return true;
    }

    const now = Date.now();
    const state = rateLimitStates[endpoint] || {
      count: 0,
      windowStart: now,
      blocked: false,
      blockUntil: 0
    };

    // Check if currently blocked
    if (state.blocked && state.blockUntil > now) {
      const remainingTime = Math.ceil((state.blockUntil - now) / 1000);
      console.warn(`🚫 Rate limit: ${endpoint} blocked for ${remainingTime}s`);
      return false;
    }

    // Reset window if expired
    if (now - state.windowStart > config.windowMs) {
      state.count = 0;
      state.windowStart = now;
      state.blocked = false;
      state.blockUntil = 0;
    }

    // Increment counter
    state.count++;

    // Check if limit exceeded
    if (state.count > config.maxRequests) {
      const blockDuration = config.blockDurationMs || 300000; // Default 5 minutes
      state.blocked = true;
      state.blockUntil = now + blockDuration;

      // Clear existing timeout
      if (cleanupTimeouts.current[endpoint]) {
        clearTimeout(cleanupTimeouts.current[endpoint]);
      }

      // Set cleanup timeout
      cleanupTimeouts.current[endpoint] = setTimeout(() => {
        setRateLimitStates(prev => {
          const newState = { ...prev };
          delete newState[endpoint];
          return newState;
        });
        delete cleanupTimeouts.current[endpoint];
      }, blockDuration + 60000); // Cleanup 1 minute after block expires

      console.error(`🚫 Rate limit exceeded for ${endpoint}. Blocked for ${blockDuration/1000}s`);
      
      // Log abuse detection
      await logAbuseAttempt(endpoint, requestData);
      
      setRateLimitStates(prev => ({ ...prev, [endpoint]: state }));
      return false;
    }

    // Warning at 80% of limit
    if (state.count >= config.maxRequests * 0.8) {
      console.warn(`⚠️ Rate limit warning: ${endpoint} at ${state.count}/${config.maxRequests}`);
    }

    setRateLimitStates(prev => ({ ...prev, [endpoint]: state }));
    return true;
  }, [rateLimitStates]);

  const logAbuseAttempt = async (endpoint: string, requestData?: any) => {
    const abuseLog = {
      endpoint,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ip: 'client-side', // Would be server-side in real implementation
      requestData: requestData ? JSON.stringify(requestData).substring(0, 100) : null
    };

    console.group('🚨 Abuse Detection');
    console.error('Rate limit exceeded:', abuseLog);
    console.groupEnd();

    // Store abuse attempts
    try {
      const existingLogs = JSON.parse(localStorage.getItem('abuse_logs') || '[]');
      existingLogs.push(abuseLog);
      
      // Keep only last 50 logs
      const recentLogs = existingLogs.slice(-50);
      localStorage.setItem('abuse_logs', JSON.stringify(recentLogs));
    } catch (error) {
      console.warn('Failed to store abuse log:', error);
    }
  };

  const getRemainingRequests = useCallback((endpoint: string): number => {
    const config = defaultConfigs[endpoint];
    if (!config) return Infinity;

    const state = rateLimitStates[endpoint];
    if (!state) return config.maxRequests;

    const now = Date.now();
    
    // Reset if window expired
    if (now - state.windowStart > config.windowMs) {
      return config.maxRequests;
    }

    return Math.max(0, config.maxRequests - state.count);
  }, [rateLimitStates]);

  const isBlocked = useCallback((endpoint: string): boolean => {
    const state = rateLimitStates[endpoint];
    if (!state) return false;
    
    return state.blocked && state.blockUntil > Date.now();
  }, [rateLimitStates]);

  const getBlockInfo = useCallback((endpoint: string): { until: number; reason: string } | null => {
    const state = rateLimitStates[endpoint];
    if (!state || !state.blocked || state.blockUntil <= Date.now()) {
      return null;
    }

    return {
      until: state.blockUntil,
      reason: `Rate limit exceeded for ${endpoint}`
    };
  }, [rateLimitStates]);

  const getRemainingBlockTime = useCallback((endpoint?: string): number => {
    if (!endpoint) {
      // Return the longest block time across all endpoints
      const now = Date.now();
      let maxBlockTime = 0;
      
      Object.values(rateLimitStates).forEach(state => {
        if (state.blocked && state.blockUntil > now) {
          const remaining = state.blockUntil - now;
          if (remaining > maxBlockTime) {
            maxBlockTime = remaining;
          }
        }
      });
      
      return maxBlockTime;
    }

    const state = rateLimitStates[endpoint];
    if (!state || !state.blocked) return 0;
    
    return Math.max(0, state.blockUntil - Date.now());
  }, [rateLimitStates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(cleanupTimeouts.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return {
    checkRateLimit,
    getRemainingRequests,
    isBlocked: (endpoint?: string) => endpoint ? isBlocked(endpoint) : Object.values(rateLimitStates).some(state => state.blocked && state.blockUntil > Date.now()),
    getBlockInfo,
    getRemainingBlockTime
  };
};
