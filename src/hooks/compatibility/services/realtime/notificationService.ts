
import { supabase } from "@/integrations/supabase/client";
import { MatchNotification } from "./types";
import { NotificationMapper } from "./notificationMapper";
import { logInfo, logError } from "../loggingService";

export class NotificationService {
  async createNotification(notification: Omit<MatchNotification, 'id' | 'created_at' | 'is_read'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('match_notifications')
        .insert(notification);

      if (error) {
        logError('notificationService', error, { notification });
        throw error;
      }

      logInfo('notificationService', 'Notification created successfully', { notification });
    } catch (error) {
      logError('notificationService', error as Error, { notification });
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('match_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        logError('notificationService', error, { notificationId });
        throw error;
      }
    } catch (error) {
      logError('notificationService', error as Error, { notificationId });
      throw error;
    }
  }

  async getUnreadNotifications(userId: string): Promise<MatchNotification[]> {
    try {
      const { data, error } = await supabase
        .from('match_notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (error) {
        logError('notificationService', error, { userId });
        throw error;
      }

      return (data || []).map(NotificationMapper.mapToMatchNotification);
    } catch (error) {
      logError('notificationService', error as Error, { userId });
      return [];
    }
  }
}
