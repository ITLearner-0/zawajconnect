
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { CompatibilityMatch } from "@/types/compatibility";
import { logInfo, logError } from "./loggingService";

export interface MatchNotification {
  id: string;
  user_id: string;
  match_user_id: string;
  notification_type: 'new_match' | 'score_update' | 'profile_update';
  score?: number;
  message?: string;
  is_read: boolean;
  created_at: string;
}

export interface RealtimeCallbacks {
  onNewMatch?: (match: CompatibilityMatch) => void;
  onScoreUpdate?: (notification: MatchNotification) => void;
  onProfileUpdate?: (userId: string) => void;
  onNotification?: (notification: MatchNotification) => void;
}

export class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private callbacks: RealtimeCallbacks = {};

  // Subscribe to compatibility result changes
  subscribeToCompatibilityResults(userId: string, callbacks: RealtimeCallbacks): RealtimeChannel {
    const channelName = `compatibility-${userId}`;
    
    if (this.channels.has(channelName)) {
      this.unsubscribe(channelName);
    }

    this.callbacks = { ...this.callbacks, ...callbacks };

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'compatibility_results',
          filter: `user_id=neq.${userId}` // Listen for other users' new results
        },
        (payload) => {
          logInfo('realtimeService', 'New compatibility result detected', payload);
          this.handleCompatibilityResultChange(payload, userId);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  // Subscribe to profile updates
  subscribeToProfileUpdates(userId: string, callbacks: RealtimeCallbacks): RealtimeChannel {
    const channelName = `profiles-${userId}`;
    
    if (this.channels.has(channelName)) {
      this.unsubscribe(channelName);
    }

    this.callbacks = { ...this.callbacks, ...callbacks };

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          logInfo('realtimeService', 'Profile update detected', payload);
          if (this.callbacks.onProfileUpdate) {
            this.callbacks.onProfileUpdate(payload.new.id);
          }
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  // Subscribe to match notifications
  subscribeToNotifications(userId: string, callbacks: RealtimeCallbacks): RealtimeChannel {
    const channelName = `notifications-${userId}`;
    
    if (this.channels.has(channelName)) {
      this.unsubscribe(channelName);
    }

    this.callbacks = { ...this.callbacks, ...callbacks };

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'match_notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          logInfo('realtimeService', 'New notification received', payload);
          const notification = payload.new as MatchNotification;
          
          if (this.callbacks.onNotification) {
            this.callbacks.onNotification(notification);
          }

          // Handle specific notification types
          if (notification.notification_type === 'score_update' && this.callbacks.onScoreUpdate) {
            this.callbacks.onScoreUpdate(notification);
          }
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  // Create a notification
  async createNotification(notification: Omit<MatchNotification, 'id' | 'created_at' | 'is_read'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('match_notifications')
        .insert(notification);

      if (error) {
        logError('realtimeService', error, { notification });
        throw error;
      }

      logInfo('realtimeService', 'Notification created successfully', { notification });
    } catch (error) {
      logError('realtimeService', error as Error, { notification });
      throw error;
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('match_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        logError('realtimeService', error, { notificationId });
        throw error;
      }
    } catch (error) {
      logError('realtimeService', error as Error, { notificationId });
      throw error;
    }
  }

  // Get unread notifications
  async getUnreadNotifications(userId: string): Promise<MatchNotification[]> {
    try {
      const { data, error } = await supabase
        .from('match_notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (error) {
        logError('realtimeService', error, { userId });
        throw error;
      }

      return data || [];
    } catch (error) {
      logError('realtimeService', error as Error, { userId });
      return [];
    }
  }

  // Handle compatibility result changes
  private async handleCompatibilityResultChange(payload: any, currentUserId: string): Promise<void> {
    try {
      // This would typically trigger a recalculation or notification
      // For now, we'll just log and potentially trigger a callback
      const newResult = payload.new;
      
      if (this.callbacks.onNewMatch) {
        // You might want to calculate if this new result creates a match
        // For simplicity, we'll just trigger the callback
        logInfo('realtimeService', 'Potential new match detected', { newResult, currentUserId });
      }
    } catch (error) {
      logError('realtimeService', error as Error, { payload, currentUserId });
    }
  }

  // Unsubscribe from a specific channel
  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
      logInfo('realtimeService', `Unsubscribed from channel: ${channelName}`);
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll(): void {
    this.channels.forEach((channel, channelName) => {
      supabase.removeChannel(channel);
      logInfo('realtimeService', `Unsubscribed from channel: ${channelName}`);
    });
    this.channels.clear();
    this.callbacks = {};
  }

  // Get active channels count
  getActiveChannelsCount(): number {
    return this.channels.size;
  }
}

export const realtimeService = new RealtimeService();
