
export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  last_activity: string;
  expires_at: string;
  device_info?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface SessionTimeoutConfig {
  timeoutMinutes: number;
  warningMinutes: number;
  checkIntervalSeconds: number;
}
