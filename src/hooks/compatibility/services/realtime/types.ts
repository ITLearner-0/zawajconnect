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
  onNewMatch?: (match: any) => void;
  onScoreUpdate?: (notification: MatchNotification) => void;
  onProfileUpdate?: (userId: string) => void;
  onNotification?: (notification: MatchNotification) => void;
}
