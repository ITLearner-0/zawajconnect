
import { ChatRequest } from '@/types/wali';

export interface UseChatRequestsReturn {
  chatRequests: ChatRequest[];
  loading: boolean;
  error: string | null;
  handleChatRequest: (requestId: string, status: 'approved' | 'rejected') => Promise<boolean>;
  addWaliNote: (requestId: string, note: string) => Promise<boolean>;
}

export interface ChatRequestsState {
  chatRequests: ChatRequest[];
  loading: boolean;
  error: string | null;
}
