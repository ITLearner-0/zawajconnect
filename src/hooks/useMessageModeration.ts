
import { supabase } from '@/integrations/supabase/client';
import { filterMessageContent } from '@/services/contentModerationService';
import { ContentFlag } from '@/types/profile';

export const useMessageModeration = (userId: string | null) => {
  // Filter message content before sending
  const moderateMessageContent = (messageText: string) => {
    return filterMessageContent(messageText);
  };
  
  // Process content flags if any are found
  const processContentFlags = async (
    messageId: string | undefined, 
    flags: Array<{ flag_type: string; severity: string }>,
    userId: string | null
  ): Promise<void> => {
    if (!flags.length || !messageId || !userId) return;
    
    try {
      // Create flag objects with proper fields
      const flagsWithMetadata = flags.map(flag => ({
        content_id: messageId,
        content_type: 'message',
        flag_type: flag.flag_type,
        severity: flag.severity,
        flagged_by: userId,
        created_at: new Date().toISOString(),
        resolved: false
      }));
      
      // Insert each flag using RPC function to avoid type issues
      for (const flag of flagsWithMetadata) {
        try {
          // Use RPC function instead of direct insert
          const { error: flagError } = await supabase
            .rpc('insert_content_flag', {
              content_id: flag.content_id,
              content_type: flag.content_type,
              flag_type: flag.flag_type,
              severity: flag.severity,
              flagged_by: flag.flagged_by,
              created_at: flag.created_at,
              resolved: flag.resolved
            });
            
          if (flagError) {
            console.error("Error inserting content flag:", flagError);
          }
        } catch (err) {
          console.error("Error processing flag:", err);
        }
      }
    } catch (err) {
      console.error("Error in processContentFlags:", err);
    }
  };

  return {
    moderateMessageContent,
    processContentFlags
  };
};
