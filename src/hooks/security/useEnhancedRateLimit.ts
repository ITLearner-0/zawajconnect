import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

interface RateLimitState {
  attempts: number;
  windowStart: number;
  blockedUntil: number;
}

const defaultConfigs: Record<string, RateLimitConfig> = {
  message_send: { maxAttempts: 10, windowMs: 60000, blockDurationMs: 300000 }, // 10 messages per minute, 5min block
  profile_update: { maxAttempts: 5, windowMs: 300000, blockDurationMs: 600000 }, // 5 updates per 5min, 10min block
  login_attempt: { maxAttempts: 5, windowMs: 900000, blockDurationMs: 1800000 }, // 5 attempts per 15min, 30min block
  search_query: { maxAttempts: 20, windowMs: 60000, blockDurationMs: 120000 }, // 20 searches per minute, 2min block
};

export const useEnhancedRateLimit = () => {
  const [rateLimitStates, setRateLimitStates] = useState<Record<string, RateLimitState>>({});
  const cleanupTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  const checkRateLimit = useCallback(
    (action: string, customConfig?: Partial<RateLimitConfig>): boolean => {
      const config = { ...defaultConfigs[action], ...customConfig };
      if (!config.maxAttempts) return true; // No limit if not configured

      const now = Date.now();
      const state = rateLimitStates[action] || { attempts: 0, windowStart: now, blockedUntil: 0 };

      // Check if currently blocked
      if (state.blockedUntil > now) {
        const remainingTime = Math.ceil((state.blockedUntil - now) / 1000);
        toast.error(`Action temporairement bloquée. Réessayez dans ${remainingTime} secondes.`);
        return false;
      }

      // Reset window if expired
      if (now - state.windowStart > config.windowMs) {
        state.attempts = 0;
        state.windowStart = now;
        state.blockedUntil = 0;
      }

      // Increment attempts
      state.attempts++;

      // Check if limit exceeded
      if (state.attempts > config.maxAttempts) {
        state.blockedUntil = now + config.blockDurationMs;

        // Clear existing cleanup timeout
        if (cleanupTimeouts.current[action]) {
          clearTimeout(cleanupTimeouts.current[action]);
        }

        // Set cleanup timeout
        cleanupTimeouts.current[action] = setTimeout(() => {
          setRateLimitStates((prev) => {
            const newState = { ...prev };
            delete newState[action];
            return newState;
          });
          delete cleanupTimeouts.current[action];
        }, config.blockDurationMs + 60000); // Cleanup 1 minute after block expires

        const blockDuration = Math.ceil(config.blockDurationMs / 1000);
        toast.error(`Trop de tentatives. Action bloquée pendant ${blockDuration} secondes.`);

        setRateLimitStates((prev) => ({ ...prev, [action]: state }));
        return false;
      }

      // Update state
      setRateLimitStates((prev) => ({ ...prev, [action]: state }));
      return true;
    },
    [rateLimitStates]
  );

  const getRemainingAttempts = useCallback(
    (action: string): number => {
      const config = defaultConfigs[action];
      if (!config) return Infinity;

      const state = rateLimitStates[action];
      if (!state) return config.maxAttempts;

      const now = Date.now();

      // Reset if window expired
      if (now - state.windowStart > config.windowMs) {
        return config.maxAttempts;
      }

      return Math.max(0, config.maxAttempts - state.attempts);
    },
    [rateLimitStates]
  );

  const isBlocked = useCallback(
    (action: string): boolean => {
      const state = rateLimitStates[action];
      if (!state) return false;

      return state.blockedUntil > Date.now();
    },
    [rateLimitStates]
  );

  const resetRateLimit = useCallback((action: string) => {
    setRateLimitStates((prev) => {
      const newState = { ...prev };
      delete newState[action];
      return newState;
    });

    if (cleanupTimeouts.current[action]) {
      clearTimeout(cleanupTimeouts.current[action]);
      delete cleanupTimeouts.current[action];
    }
  }, []);

  return {
    checkRateLimit,
    getRemainingAttempts,
    isBlocked,
    resetRateLimit,
  };
};
