import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { RealtimeCallbacks } from './types';
import { NotificationMapper } from './notificationMapper';
import { logInfo } from '../loggingService';

export class ChannelManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private callbacks: RealtimeCallbacks = {};

  setCallbacks(callbacks: RealtimeCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  subscribeToCompatibilityResults(userId: string, callbacks: RealtimeCallbacks): RealtimeChannel {
    const channelName = `compatibility-${userId}`;

    if (this.channels.has(channelName)) {
      this.unsubscribe(channelName);
    }

    this.setCallbacks(callbacks);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'compatibility_results',
          filter: `user_id=neq.${userId}`,
        },
        (payload) => {
          logInfo('channelManager', 'New compatibility result detected', payload);
          this.handleCompatibilityResultChange(payload, userId);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  subscribeToProfileUpdates(userId: string, callbacks: RealtimeCallbacks): RealtimeChannel {
    const channelName = `profiles-${userId}`;

    if (this.channels.has(channelName)) {
      this.unsubscribe(channelName);
    }

    this.setCallbacks(callbacks);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          logInfo('channelManager', 'Profile update detected', payload);
          if (this.callbacks.onProfileUpdate) {
            this.callbacks.onProfileUpdate(payload.new.id);
          }
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  subscribeToNotifications(userId: string, callbacks: RealtimeCallbacks): RealtimeChannel {
    const channelName = `notifications-${userId}`;

    if (this.channels.has(channelName)) {
      this.unsubscribe(channelName);
    }

    this.setCallbacks(callbacks);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'match_notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          logInfo('channelManager', 'New notification received', payload);
          const notification = NotificationMapper.mapToMatchNotification(payload.new);

          if (this.callbacks.onNotification) {
            this.callbacks.onNotification(notification);
          }

          if (notification.notification_type === 'score_update' && this.callbacks.onScoreUpdate) {
            this.callbacks.onScoreUpdate(notification);
          }
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  private async handleCompatibilityResultChange(
    payload: any,
    currentUserId: string
  ): Promise<void> {
    try {
      const newResult = payload.new;

      if (this.callbacks.onNewMatch) {
        logInfo('channelManager', 'Potential new match detected', { newResult, currentUserId });
      }
    } catch (error) {
      console.error('Error handling compatibility result change:', error);
    }
  }

  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
      logInfo('channelManager', `Unsubscribed from channel: ${channelName}`);
    }
  }

  unsubscribeAll(): void {
    this.channels.forEach((channel, channelName) => {
      supabase.removeChannel(channel);
      logInfo('channelManager', `Unsubscribed from channel: ${channelName}`);
    });
    this.channels.clear();
    this.callbacks = {};
  }

  getActiveChannelsCount(): number {
    return this.channels.size;
  }
}
