
import { supabase } from '@/integrations/supabase/client';
import { ChatRequest } from '@/types/wali';

export const fetchChatRequests = async (userId: string): Promise<ChatRequest[]> => {
  // Fetch pending chat requests
  const { data, error } = await supabase
    .from('chat_requests')
    .select(`
      id,
      requester_id,
      recipient_id,
      wali_id,
      status,
      requested_at,
      reviewed_at,
      wali_notes,
      requester:requester_id(
        first_name,
        last_name
      )
    `)
    .eq('wali_id', userId)
    .order('requested_at', { ascending: false });

  if (error) {
    console.error('Error fetching chat requests:', error);
    throw new Error('Failed to load chat requests');
  }

  // Transform data to match ChatRequest type
  const transformedRequests: ChatRequest[] = data.map((req: any) => ({
    id: req.id,
    requester_id: req.requester_id,
    recipient_id: req.recipient_id,
    wali_id: req.wali_id,
    status: req.status,
    requested_at: req.requested_at,
    reviewed_at: req.reviewed_at,
    wali_notes: req.wali_notes,
    requester_profile: req.requester ? {
      first_name: req.requester.first_name,
      last_name: req.requester.last_name
    } : undefined
  }));
  
  return transformedRequests;
};

export const updateChatRequestStatus = async (
  requestId: string, 
  status: 'approved' | 'rejected'
): Promise<void> => {
  const { error } = await supabase
    .from('chat_requests')
    .update({ 
      status,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', requestId);

  if (error) throw error;
};

export const createConversationForRequest = async (request: ChatRequest): Promise<void> => {
  // Check if conversation already exists
  const { data: existingConversation } = await supabase
    .from('conversations')
    .select('id')
    .contains('participants', [request.requester_id, request.recipient_id])
    .maybeSingle();

  if (!existingConversation) {
    // Create a new conversation
    const { data: newConversation, error: conversationError } = await supabase
      .from('conversations')
      .insert({
        participants: [request.requester_id, request.recipient_id],
        created_at: new Date().toISOString(),
        wali_supervised: true
      })
      .select('id')
      .single();

    if (conversationError) throw conversationError;

    // Create a system message
    if (newConversation) {
      await supabase
        .from('messages')
        .insert({
          conversation_id: newConversation.id,
          sender_id: 'system',
          content: 'Conversation approved by wali',
          created_at: new Date().toISOString(),
          is_read: true,
          is_wali_visible: true
        });
    }
  }
};

export const updateChatRequestNote = async (requestId: string, note: string): Promise<void> => {
  const { error } = await supabase
    .from('chat_requests')
    .update({ wali_notes: note })
    .eq('id', requestId);

  if (error) throw error;
};
