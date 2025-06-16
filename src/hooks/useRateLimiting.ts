
import { useRateLimitState } from './rateLimiting/stateManager';

export const useRateLimiting = () => {
  const {
    checkRateLimit,
    getRemainingRequests,
    isBlocked: isEndpointBlocked,
    getBlockInfo,
    getRemainingBlockTime,
    isAnyBlocked
  } = useRateLimitState();

  const isBlocked = (endpoint?: string) => {
    if (endpoint) {
      return isEndpointBlocked(endpoint);
    }
    return isAnyBlocked();
  };

  return {
    checkRateLimit,
    getRemainingRequests,
    isBlocked,
    getBlockInfo,
    getRemainingBlockTime
  };
};
