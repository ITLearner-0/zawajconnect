
import { RateLimitConfig } from './types';

export const defaultConfigs: Record<string, RateLimitConfig> = {
  'api/messages': { maxRequests: 30, windowMs: 60000, blockDurationMs: 300000 },
  'api/profiles': { maxRequests: 10, windowMs: 60000, blockDurationMs: 180000 },
  'api/auth': { maxRequests: 5, windowMs: 300000, blockDurationMs: 900000 },
  'api/compatibility': { maxRequests: 20, windowMs: 300000, blockDurationMs: 600000 },
  'action_profile_update': { maxRequests: 5, windowMs: 300000, blockDurationMs: 600000 },
  'action_message_send': { maxRequests: 20, windowMs: 60000, blockDurationMs: 300000 },
};
