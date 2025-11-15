
// JWT Management with short expiration
import { supabase } from '@/integrations/supabase/client';

export interface JWTPayload {
  sub: string;
  iat: number;
  exp: number;
  role: string;
  session_id: string;
}

export class JWTManager {
  private static readonly SHORT_EXPIRY = 15 * 60; // 15 minutes
  private static readonly REFRESH_THRESHOLD = 5 * 60; // 5 minutes before expiry

  // Validate JWT token
  static async validateToken(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        return false;
      }

      // Check if token is close to expiry
      const expiresAt = session.expires_at;
      if (!expiresAt) return false;

      const now = Math.floor(Date.now() / 1000);
      const expiry = new Date(expiresAt).getTime() / 1000;

      // Token is expired
      if (now >= expiry) {
        await this.refreshToken();
        return false;
      }

      // Token is close to expiry, refresh proactively
      if (expiry - now < this.REFRESH_THRESHOLD) {
        this.refreshToken(); // Don't await, refresh in background
      }

      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }

  // Refresh JWT token
  static async refreshToken(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Token refresh failed:', error);
        // Force logout if refresh fails
        await supabase.auth.signOut();
        return false;
      }

      return !!data.session;
    } catch (error) {
      console.error('Token refresh error:', error);
      await supabase.auth.signOut();
      return false;
    }
  }

  // Get token expiry time
  static async getTokenExpiry(): Promise<number | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.expires_at) return null;
      
      return new Date(session.expires_at).getTime();
    } catch (error) {
      console.error('Failed to get token expiry:', error);
      return null;
    }
  }

  // Check if token needs refresh
  static async needsRefresh(): Promise<boolean> {
    const expiry = await this.getTokenExpiry();
    if (!expiry) return true;

    const now = Date.now();
    const timeUntilExpiry = expiry - now;

    return timeUntilExpiry < this.REFRESH_THRESHOLD * 1000;
  }

  // Force logout on security breach
  static async forceLogout(reason: string): Promise<void> {
    console.warn(`Force logout triggered: ${reason}`);
    
    // Log security event
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await (supabase as any).from('security_events').insert({
          event_type: 'force_logout',
          description: `Force logout: ${reason}`,
          metadata: { reason, timestamp: new Date().toISOString(), user_id: user.id }
        });
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }

    await supabase.auth.signOut();
    window.location.href = '/auth';
  }
}
