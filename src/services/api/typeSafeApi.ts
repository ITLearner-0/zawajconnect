import { supabase } from '@/integrations/supabase/client';
import {
  StrictApiResponse,
  StrictPaginatedResponse,
  StrictProfileData,
  StrictMessage,
  StrictConversation,
} from '@/types/strictTypes';
import {
  validateProfileData,
  validateMessage,
  validateConversation,
  validateArray,
  validateApiResponse,
} from '@/utils/validation/typeValidators';
import { DatabaseId, assertDefined } from '@/types/typeUtils';

/**
 * Type-safe API service with runtime validation
 */
class TypeSafeApiService {
  /**
   * Fetch profile data with type validation
   */
  async getProfile(userId: DatabaseId): Promise<StrictApiResponse<StrictProfileData>> {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      if (!validateProfileData(data)) {
        return {
          data: null,
          error: 'Invalid profile data format',
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        data,
        error: null,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Fetch messages with type validation
   */
  async getMessages(
    conversationId: DatabaseId,
    limit = 50
  ): Promise<StrictPaginatedResponse<StrictMessage>> {
    try {
      const { data, error, count } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return {
          data: [],
          pagination: {
            page: 1,
            limit,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
          error: error.message,
        };
      }

      const validatedMessages = (data || []).filter(validateMessage);

      if (validatedMessages.length !== (data?.length || 0)) {
        console.warn('Some messages failed validation and were filtered out');
      }

      return {
        data: validatedMessages,
        pagination: {
          page: 1,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          hasNext: (count || 0) > limit,
          hasPrev: false,
        },
        error: null,
      };
    } catch (err) {
      return {
        data: [],
        pagination: {
          page: 1,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  /**
   * Fetch conversations with type validation
   */
  async getConversations(userId: DatabaseId): Promise<StrictApiResponse<StrictConversation[]>> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(
          `
          *,
          messages!inner(*)
        `
        )
        .contains('participants', [userId])
        .order('created_at', { ascending: false });

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      const validatedConversations = (data || []).filter(validateConversation);

      if (validatedConversations.length !== (data?.length || 0)) {
        console.warn('Some conversations failed validation and were filtered out');
      }

      return {
        data: validatedConversations,
        error: null,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Generic type-safe query method
   */
  async query<T>(
    queryFn: () => Promise<{ data: any; error: any }>,
    validator: (data: unknown) => data is T,
    errorMessage = 'Query failed'
  ): Promise<StrictApiResponse<T>> {
    try {
      const { data, error } = await queryFn();

      if (error) {
        return {
          data: null,
          error: error.message || errorMessage,
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      if (!validator(data)) {
        return {
          data: null,
          error: 'Invalid data format received',
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        data,
        error: null,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export const typeSafeApi = new TypeSafeApiService();
