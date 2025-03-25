
export type UserStatus = 'online' | 'offline' | 'away' | 'busy';

export interface UserStatusData {
  status: UserStatus;
  lastActive: string | null;
}
