
import { supabase } from '@/integrations/supabase/client';
import { SupervisionSession } from '@/types/wali';

// Fetch active supervision sessions for a wali
export const fetchActiveSupervisions = async (userId: string) => {
  const { data, error } = await supabase
    .from('supervision_sessions')
    .select(`
      id,
      conversation_id,
      wali_id,
      started_at,
      ended_at,
      is_active,
      supervision_level,
      conversation:conversation_id(
        id,
        participants,
        created_at
      )
    `)
    .eq('wali_id', userId)
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching supervisions:', error);
    throw new Error('Failed to load supervision sessions');
  }

  return data || [];
};

// Create a new supervision session
export const createSupervisionSession = async (
  userId: string, 
  conversationId: string, 
  supervisionLevel: SupervisionSession['supervision_level'] = 'passive'
) => {
  // Check if there's already an active session
  const { data: existingSession } = await supabase
    .from('supervision_sessions')
    .select('id')
    .eq('conversation_id', conversationId)
    .eq('wali_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  if (existingSession) {
    return { exists: true };
  }

  // Create a new supervision session
  const { error } = await supabase
    .from('supervision_sessions')
    .insert({
      conversation_id: conversationId,
      wali_id: userId,
      started_at: new Date().toISOString(),
      is_active: true,
      supervision_level: supervisionLevel
    });

  if (error) throw error;

  // Create a system message visible only to wali
  await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: 'system',
      content: 'Wali supervision started',
      created_at: new Date().toISOString(),
      is_read: false,
      is_wali_visible: true
    });

  return { exists: false, success: true };
};

// End an active supervision session
export const endSupervisionSession = async (userId: string, sessionId: string) => {
  // First get the conversation_id from the session
  const { data: session, error: sessionError } = await supabase
    .from('supervision_sessions')
    .select('conversation_id')
    .eq('id', sessionId)
    .single();

  if (sessionError) throw sessionError;

  const { error } = await supabase
    .from('supervision_sessions')
    .update({ 
      is_active: false,
      ended_at: new Date().toISOString()
    })
    .eq('id', sessionId)
    .eq('wali_id', userId);

  if (error) throw error;

  // Create a system message visible only to wali
  if (session) {
    await supabase
      .from('messages')
      .insert({
        conversation_id: session.conversation_id,
        sender_id: 'system',
        content: 'Wali supervision ended',
        created_at: new Date().toISOString(),
        is_read: false,
        is_wali_visible: true
      });
  }

  return true;
};

// Refresh active supervision sessions
export const refreshSupervisions = async (userId: string) => {
  const { data, error } = await supabase
    .from('supervision_sessions')
    .select(`
      id,
      conversation_id,
      wali_id,
      started_at,
      ended_at,
      is_active,
      supervision_level,
      conversation:conversation_id(
        id,
        participants,
        created_at
      )
    `)
    .eq('wali_id', userId)
    .eq('is_active', true);
    
  if (error) throw error;
  
  return data || [];
};
