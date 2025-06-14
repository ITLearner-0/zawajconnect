
import { RealtimeChannel } from "@supabase/supabase-js";
import { CompatibilityMatch } from "@/types/compatibility";
import { MatchNotification, RealtimeCallbacks } from "./types";
import { ChannelManager } from "./channelManager";
import { NotificationService } from "./notificationService";

export class RealtimeService {
  private channelManager = new ChannelManager();
  private notificationService = new NotificationService();

  // Subscribe to compatibility result changes
  subscribeToCompatibilityResults(userId: string, callbacks: RealtimeCallbacks): RealtimeChannel {
    return this.channelManager.subscribeToCompatibilityResults(userId, callbacks);
  }

  // Subscribe to profile updates
  subscribeToProfileUpdates(userId: string, callbacks: RealtimeCallbacks): RealtimeChannel {
    return this.channelManager.subscribeToProfileUpdates(userId, callbacks);
  }

  // Subscribe to match notifications
  subscribeToNotifications(userId: string, callbacks: RealtimeCallbacks): RealtimeChannel {
    return this.channelManager.subscribeToNotifications(userId, callbacks);
  }

  // Create a notification
  async createNotification(notification: Omit<MatchNotification, 'id' | 'created_at' | 'is_read'>): Promise<void> {
    return this.notificationService.createNotification(notification);
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    return this.notificationService.markNotificationAsRead(notificationId);
  }

  // Get unread notifications
  async getUnreadNotifications(userId: string): Promise<MatchNotification[]> {
    return this.notificationService.getUnreadNotifications(userId);
  }

  // Unsubscribe from a specific channel
  unsubscribe(channelName: string): void {
    this.channelManager.unsubscribe(channelName);
  }

  // Unsubscribe from all channels
  unsubscribeAll(): void {
    this.channelManager.unsubscribeAll();
  }

  // Get active channels count
  getActiveChannelsCount(): number {
    return this.channelManager.getActiveChannelsCount();
  }
}

export const realtimeService = new RealtimeService();

// Re-export types for backward compatibility
export type { MatchNotification, RealtimeCallbacks };
