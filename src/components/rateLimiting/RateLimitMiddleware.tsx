
import React, { createContext, useContext, ReactNode } from 'react';
import { useRateLimiting } from '@/hooks/useRateLimiting';

interface RateLimitContextType {
  checkRateLimit: (endpoint: string, requestData?: any) => Promise<boolean>;
  isBlocked: boolean;
  blockInfo: { until: number; reason: string } | null;
  getRemainingBlockTime: () => number;
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

export const useRateLimitContext = () => {
  const context = useContext(RateLimitContext);
  if (context === undefined) {
    throw new Error('useRateLimitContext must be used within a RateLimitProvider');
  }
  return context;
};

interface RateLimitedButtonProps {
  endpoint: string;
  requestData?: any;
  onClick: () => Promise<void> | void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export const RateLimitedButton: React.FC<RateLimitedButtonProps> = ({
  endpoint,
  requestData,
  onClick,
  children,
  className = '',
  disabled = false
}) => {
  const { checkRateLimit, isBlocked } = useRateLimitContext();

  const handleClick = async () => {
    const allowed = await checkRateLimit(endpoint, requestData);
    if (allowed) {
      await onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isBlocked}
      className={`${className} ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};
