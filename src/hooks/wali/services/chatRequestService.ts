
import { supabase } from '@/integrations/supabase/client';
import { ChatRequest } from '@/types/wali';
import { setupModerationTables } from '@/utils/database/moderationTables';

export const fetchChatRequests = async (userId: string): Promise<ChatRequest[]> => {
  try {
    // First, ensure the required tables and columns exist
    await setupModerationTables();
    
    // Fetch chat requests from supabase
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
      return [];
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
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', req.requester_id)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
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
          console.error('Error in profile fetch:', profileError);
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
    return [];
  }
};

export const updateChatRequestStatus = async (
  requestId: string, 
  status: 'approved' | 'rejected',
  suggestedTime?: string
): Promise<void> => {
  try {
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
  } catch (error) {
    console.error('Error updating chat request status:', error);
    throw error;
  }
};

export const createConversationForRequest = async (request: ChatRequest): Promise<void> => {
  try {
    // Check if conversation already exists
    const { data: existingConversation, error: checkError } = await supabase
      .from('conversations')
      .select('id')
      .contains('participants', [request.requester_id, request.recipient_id])
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing conversation:', checkError);
      throw checkError;
    }

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

      if (conversationError) {
        console.error('Error creating conversation:', conversationError);
        throw conversationError;
      }

      // Create a system message
      if (newConversation) {
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            conversation_id: newConversation.id,
            sender_id: 'system',
            content: 'Conversation approved by wali',
            created_at: new Date().toISOString(),
            is_read: true,
            is_wali_visible: true
          });
          
        if (messageError) {
          console.error('Error creating system message:', messageError);
          throw messageError;
        }
      }
    }
  } catch (error) {
    console.error('Error in createConversationForRequest:', error);
    throw error;
  }
};

export const updateChatRequestNote = async (requestId: string, note: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('chat_requests')
      .update({ wali_notes: note })
      .eq('id', requestId);

    if (error) {
      console.error('Error updating chat request note:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateChatRequestNote:', error);
    throw error;
  }
};
