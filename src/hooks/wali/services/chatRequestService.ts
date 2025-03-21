
import { supabase } from '@/integrations/supabase/client';
import { ChatRequest } from '@/types/wali';

export const fetchChatRequests = async (userId: string): Promise<ChatRequest[]> => {
  try {
    // Check if the chat_requests table has the necessary columns before querying
    const { data: tableInfo, error: tableError } = await supabase
      .from('chat_requests')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('Error checking chat_requests table:', tableError);
      return [];
    }
    
    // Fetch basic chat requests without joined profile data
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
        message,
        request_type,
        suggested_time
      `)
      .eq('wali_id', userId)
      .order('requested_at', { ascending: false });

    if (error) {
      console.error('Error fetching chat requests:', error);
      throw new Error('Failed to load chat requests');
    }

    if (!data || !Array.isArray(data)) {
      console.log('No chat requests found or invalid data format');
      return [];
    }

    // For each request, fetch the requester profile separately
    const transformedRequests: ChatRequest[] = await Promise.all(
      data.map(async (req) => {
        try {
          // Fetch requester profile data
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', req.requester_id)
            .single();

          return {
            id: req.id,
            requester_id: req.requester_id,
            recipient_id: req.recipient_id,
            wali_id: req.wali_id,
            status: req.status as "pending" | "approved" | "rejected",
            requested_at: req.requested_at,
            reviewed_at: req.reviewed_at,
            wali_notes: req.wali_notes,
            message: req.message,
            request_type: req.request_type as "message" | "video" | undefined,
            suggested_time: req.suggested_time,
            requester_profile: profileData ? {
              first_name: profileData.first_name,
              last_name: profileData.last_name
            } : {
              first_name: 'Unknown',
              last_name: 'User'
            }
          };
        } catch (profileError) {
          console.error('Error fetching profile data:', profileError);
          return {
            id: req.id,
            requester_id: req.requester_id,
            recipient_id: req.recipient_id,
            wali_id: req.wali_id,
            status: req.status as "pending" | "approved" | "rejected",
            requested_at: req.requested_at,
            reviewed_at: req.reviewed_at,
            wali_notes: req.wali_notes,
            message: req.message,
            request_type: req.request_type as "message" | "video" | undefined,
            suggested_time: req.suggested_time,
            requester_profile: {
              first_name: 'Unknown',
              last_name: 'User'
            }
          };
        }
      })
    );
    
    return transformedRequests;
  } catch (err) {
    console.error('Error in fetchChatRequests:', err);
    // Return empty array instead of throwing to avoid breaking the UI
    return [];
  }
};

export const updateChatRequestStatus = async (
  requestId: string, 
  status: 'approved' | 'rejected',
  suggestedTime?: string
): Promise<void> => {
  const updateData: any = { 
    status,
    reviewed_at: new Date().toISOString()
  };
  
  if (suggestedTime) {
    updateData.suggested_time = suggestedTime;
  }
  
  const { error } = await supabase
    .from('chat_requests')
    .update(updateData)
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
