
import React, { createContext, useContext, ReactNode } from 'react';
import { useRateLimiting } from '@/hooks/useRateLimiting';

interface RateLimitContextType {
  checkRateLimit: (endpoint: string, requestData?: any) => Promise<boolean>;
  isBlocked: (endpoint?: string) => boolean;
  blockInfo: { until: number; reason: string } | null;
  getRemainingBlockTime: (endpoint?: string) => number;
}

const RateLimitContext = createContext<RateLimitContextType | undefined>(undefined);

interface RateLimitProviderProps {
  children: ReactNode;
}

export const RateLimitProvider: React.FC<RateLimitProviderProps> = ({ children }) => {
  const { checkRateLimit, isBlocked, getBlockInfo, getRemainingBlockTime } = useRateLimiting();

  const contextValue: RateLimitContextType = {
    checkRateLimit,
    isBlocked,
    blockInfo: getBlockInfo(''),
    getRemainingBlockTime
  };

  return (
    <RateLimitContext.Provider value={contextValue}>
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

  const buttonBlocked = isBlocked(endpoint);

  return (
    <button
      onClick={handleClick}
      disabled={disabled || buttonBlocked}
      className={`${className} ${buttonBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};
