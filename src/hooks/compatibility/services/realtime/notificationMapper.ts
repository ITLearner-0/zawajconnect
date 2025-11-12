import { MatchNotification } from './types';

export class NotificationMapper {
  static mapToMatchNotification(dbRow: any): MatchNotification {
    return {
      id: dbRow.id,
      user_id: dbRow.user_id,
      match_user_id: dbRow.match_user_id,
      notification_type: dbRow.notification_type as 'new_match' | 'score_update' | 'profile_update',
      score: dbRow.score,
      message: dbRow.message,
      is_read: dbRow.is_read,
      created_at: dbRow.created_at,
    };
  }
}
