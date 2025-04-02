
export type UserStatusType = 'online' | 'offline' | 'away';

export type UserStatus = {
  online: boolean;
  lastActive: string | null;
  status: UserStatusType;
};
