export interface MatchProfile {
  id: string;
  full_name: string;
  age?: number;
  profession?: string;
  location?: string;
  bio?: string;
  avatar_url?: string;
}

export interface MatchApprovalData {
  id: string;
  user1_id: string;
  user2_id: string;
  match_score: number;
  created_at: string;
  can_communicate: boolean;
  family_approved?: boolean;
  family_notes?: string;
  user1_profile: MatchProfile;
  user2_profile: MatchProfile;
  supervised_user_id: string;
  family_member_id: string;
}

export interface ApprovalDecision {
  approved: boolean;
  notes: string;
  conditions?: string[];
  meetingRequired?: boolean;
}

export interface FamilyMemberData {
  id: string;
  user_id: string;
  invited_user_id: string;
  is_wali: boolean;
  invitation_status: string;
}