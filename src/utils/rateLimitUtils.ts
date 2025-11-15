import { rateLimitingService } from '@/services/rateLimiting/rateLimitingService';
import { toast } from 'sonner';

interface RateLimitedApiOptions {
  endpoint: string;
  showToasts?: boolean;
  requestData?: any;
}

export async function withRateLimit<T>(
  apiCall: () => Promise<T>,
  options: RateLimitedApiOptions
): Promise<T | null> {
  try {
    // Get current user ID (simplified - in a real app you'd get this from auth context)
    const userId = 'current-user'; // Replace with actual user ID logic

    const rateLimitResult = await rateLimitingService.checkRateLimit(userId, options.endpoint);

    if (!rateLimitResult.allowed) {
      if (options.showToasts !== false) {
        if (rateLimitResult.blocked && rateLimitResult.blockUntil) {
          const blockDuration = Math.ceil((rateLimitResult.blockUntil - Date.now()) / (60 * 1000));
          toast.error(
            `You've been temporarily blocked for ${blockDuration} minutes due to excessive requests.`
          );
        } else {
          const resetTime = new Date(rateLimitResult.resetTime);
          toast.error(`Rate limit reached. Please wait until ${resetTime.toLocaleTimeString()}.`);
        }
      }
      return null;
    }

    // Check for abuse
    const abuseResult = await rateLimitingService.detectAbuse(
      userId,
      options.endpoint,
      options.requestData
    );

    if (abuseResult.isAbusive) {
      console.warn('Abuse detected:', abuseResult);

      if (abuseResult.recommendedAction === 'block') {
        await rateLimitingService.blockUser(userId, 60 * 60 * 1000, abuseResult.reason);
        if (options.showToasts !== false) {
          toast.error(`Account suspended: ${abuseResult.reason}`);
        }
        return null;
      } else if (abuseResult.recommendedAction === 'throttle' && options.showToasts !== false) {
        toast.warning(`Suspicious activity detected: ${abuseResult.reason}`);
      }
    }

    // Show warning if approaching limit
    if (
      rateLimitResult.remaining <= 5 &&
      rateLimitResult.remaining > 0 &&
      options.showToasts !== false
    ) {
      toast.warning(`Rate limit warning: ${rateLimitResult.remaining} requests remaining.`);
    }

    return await apiCall();
  } catch (error) {
    console.error('Rate-limited API call failed:', error);
    throw error;
  }
}

// Decorator function for API methods
export function rateLimited(endpoint: string, showToasts = true) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return withRateLimit(() => originalMethod.apply(this, args), {
        endpoint,
        showToasts,
        requestData: args[0],
      });
    };

    return descriptor;
  };
}

// Helper for common endpoints
export const rateLimitedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response | null> => {
  const endpoint = new URL(url).pathname.replace('/api/', 'api/');

  return withRateLimit(() => fetch(url, options), { endpoint, requestData: options.body });
};
