
import { SupervisionSession } from '@/types/wali';

export interface SupervisionState {
  activeConversations: any[];
  loading: boolean;
  error: string | null;
}

export interface UseSupervisionReturn {
  activeConversations: any[];
  loading: boolean;
  error: string | null;
  startSupervision: (conversationId: string, supervisionLevel: SupervisionSession['supervision_level']) => Promise<boolean>;
  endSupervision: (sessionId: string) => Promise<boolean>;
}
