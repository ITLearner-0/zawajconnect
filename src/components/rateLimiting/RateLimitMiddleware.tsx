
import React, { createContext, useContext, ReactNode } from 'react';
import { useRateLimiting } from '@/hooks/useRateLimiting';

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

interface RateLimitContextType {
  checkRateLimit: (action: string, customConfig?: RateLimitConfig) => boolean;
  getRemainingRequests: (action: string) => number;
  resetRateLimit: (action: string) => void;
  isBlocked: (action: string) => boolean;
  blockInfo: (action: string) => BlockInfo;
  getRemainingBlockTime: (action: string) => number;
}

const RateLimitContext = createContext<RateLimitContextType | undefined>(undefined);

interface RateLimitProviderProps {
  children: ReactNode;
}

export const RateLimitProvider: React.FC<RateLimitProviderProps> = ({ children }) => {
  const rateLimiting = useRateLimiting();

  return (
    <RateLimitContext.Provider value={rateLimiting}>
      {children}
    </RateLimitContext.Provider>
  );
};

export const useRateLimit = (): RateLimitContextType => {
  const context = useContext(RateLimitContext);
  if (!context) {
    throw new Error('useRateLimit must be used within a RateLimitProvider');
  }
  return context;
};
