
export type UserStatus = {
  online: boolean;
  lastActive: string | null;
  status: 'online' | 'offline' | 'away';
};
