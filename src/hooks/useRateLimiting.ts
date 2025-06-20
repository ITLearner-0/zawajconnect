
import { useState, useCallback, useRef } from 'react';
import { useToast } from './use-toast';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDuration?: number;
}

interface RateLimitState {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockedUntil?: number;
}

const defaultConfigs: Record<string, RateLimitConfig> = {
  login: { maxRequests: 5, windowMs: 15 * 60 * 1000, blockDuration: 15 * 60 * 1000 }, // 5 attempts per 15 min
  signup: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  message: { maxRequests: 60, windowMs: 60 * 1000 }, // 60 messages per minute
  profileUpdate: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 updates per hour
  passwordReset: { maxRequests: 3, windowMs: 60 * 60 * 1000, blockDuration: 60 * 60 * 1000 }, // 3 per hour
  reportContent: { maxRequests: 10, windowMs: 60 * 60 * 1000 } // 10 reports per hour
};

export const useRateLimiting = () => {
  const { toast } = useToast();
  const rateLimits = useRef<Map<string, RateLimitState>>(new Map());

  const checkRateLimit = useCallback((action: string, customConfig?: RateLimitConfig): boolean => {
    const config = customConfig || defaultConfigs[action];
    if (!config) return true; // No limit configured

    const now = Date.now();
    const key = action;
    const current = rateLimits.current.get(key);

    // Check if currently blocked
    if (current?.blocked && current.blockedUntil && now < current.blockedUntil) {
      const remainingTime = Math.ceil((current.blockedUntil - now) / 1000);
      toast({
        title: "Rate Limited",
        description: `Action blocked. Try again in ${remainingTime} seconds.`,
        variant: "destructive"
      });
      return false;
    }

    // Initialize or reset if window expired
    if (!current || now > current.resetTime) {
      rateLimits.current.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
        blocked: false
      });
      return true;
    }

    // Check if limit exceeded
    if (current.count >= config.maxRequests) {
      const blockedUntil = config.blockDuration ? now + config.blockDuration : undefined;
      rateLimits.current.set(key, {
        ...current,
        blocked: true,
        blockedUntil
      });

      const message = blockedUntil 
        ? `Too many attempts. Blocked for ${config.blockDuration! / 60000} minutes.`
        : `Rate limit exceeded. Try again in ${Math.ceil((current.resetTime - now) / 1000)} seconds.`;

      toast({
        title: "Rate Limited",
        description: message,
        variant: "destructive"
      });
      return false;
    }

    // Increment count
    rateLimits.current.set(key, {
      ...current,
      count: current.count + 1
    });

    return true;
  }, [toast]);

  const getRemainingRequests = useCallback((action: string): number => {
    const config = defaultConfigs[action];
    if (!config) return Infinity;

    const current = rateLimits.current.get(action);
    if (!current || Date.now() > current.resetTime) {
      return config.maxRequests;
    }

    return Math.max(0, config.maxRequests - current.count);
  }, []);

  const resetRateLimit = useCallback((action: string) => {
    rateLimits.current.delete(action);
  }, []);

  return {
    checkRateLimit,
    getRemainingRequests,
    resetRateLimit
  };
};
