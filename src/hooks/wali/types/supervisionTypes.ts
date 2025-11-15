import { SupervisedConversation } from '@/types/wali';

export interface UseSupervisionReturn {
  activeConversations: SupervisedConversation[];
  loading: boolean;
  error: string | null;
  startSupervision: (
    conversationId: string,
    level?: 'active' | 'passive' | 'minimal'
  ) => Promise<boolean>;
  endSupervision: (supervisionId: string, conversationId: string) => Promise<boolean>;
}
