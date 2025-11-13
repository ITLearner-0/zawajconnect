
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/profile';
import { tableExists } from '@/utils/database/core';
import { useToast } from './use-toast';

// Helper function to safely parse content_flags
const parseContentFlags = (flags: any): any[] => {
  if (!flags) return [];
  if (Array.isArray(flags)) return flags;
  if (typeof flags === 'string') {
    try {
      return JSON.parse(flags);
    } catch {
      return [];
    }
  }
  return [];
};

// Helper function to convert database message to our Message type
const convertDbMessageToMessage = (dbMessage: any): Message => {
  return {
    ...dbMessage,
    content_flags: parseContentFlags(dbMessage.content_flags)
  };
};

export interface SearchResult {
  message: Message;
  conversationId: string;
  otherParticipantName?: string;
}

export const useMessageSearch = (currentUserId: string | null) => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if this is a demo user
  const isDemoUser = currentUserId?.startsWith('user-');

  const searchMessages = useCallback(async () => {
    if (!searchTerm.trim() || !currentUserId || isDemoUser) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First check if the messages table exists
      const messagesTableExists = await tableExists('messages');
      
      if (!messagesTableExists) {
        setSearchResults([]);
        setLoading(false);
        return;
      }

      // Get all conversations that the user is part of
      const { data: conversations, error: convError } = await (supabase as any)
        .from('conversations')
        .select('id, participants')
        .contains('participants', [currentUserId]);

      if (convError) {
        throw convError;
      }

      if (!conversations || conversations.length === 0) {
        setSearchResults([]);
        setLoading(false);
        return;
      }

      // Get conversation IDs
      const conversationIds = conversations.map((conv: any) => conv.id);

      // Search for messages containing the search term in these conversations
      const { data: messagesData, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .in('conversation_id', conversationIds)
        .ilike('content', `%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (msgError) {
        throw msgError;
      }

      // If we have results, fetch participant information for each conversation
      const results: SearchResult[] = [];

      if (messagesData && messagesData.length > 0) {
        // Build a map of conversation participants
        const participantsMap = new Map();
        
        conversations.forEach((conv: any) => {
          participantsMap.set(conv.id, conv.participants);
        });

        // Process each message
        for (const messageData of messagesData) {
          const message = convertDbMessageToMessage(messageData);
          
          // Get the other participant in this conversation
          const participants = participantsMap.get(message.conversation_id) || [];
          const otherParticipantId = participants.find((id: any) => id !== currentUserId);
          
          if (otherParticipantId) {
            // Fetch the other participant's profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', otherParticipantId)
              .maybeSingle();

            results.push({
              message,
              conversationId: message.conversation_id,
              otherParticipantName: profile ? `${(profile as any).first_name} ${(profile as any).last_name}` : 'Unknown User'
            });
          } else {
            // No other participant found
            results.push({
              message,
              conversationId: message.conversation_id
            });
          }
        }
      }

      setSearchResults(results);

    } catch (err: any) {
      console.error('Error searching messages:', err);
      setError(`Error searching messages: ${err.message}`);
      toast({
        title: "Search Error",
        description: `Failed to search messages: ${err.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentUserId, toast, isDemoUser]);

  return {
    searchTerm,
    setSearchTerm,
    searchMessages,
    searchResults,
    loading,
    error,
    clearSearch: () => {
      setSearchTerm('');
      setSearchResults([]);
    }
  };
};
