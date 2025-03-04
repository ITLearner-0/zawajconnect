
import { useMessagesCore } from './useMessagesCore';

export const useMessages = (conversationId?: string, currentUserId?: string | null) => {
  // Delegate to the core implementation
  return useMessagesCore(conversationId, currentUserId);
};
