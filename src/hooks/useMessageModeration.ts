
import { supabase } from '@/integrations/supabase/client';
import { filterMessageContent } from '@/services/contentModerationService';

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
      
      // Insert each flag
      for (const flag of flagsWithMetadata) {
        try {
          // Use supabase directly instead of RPC to avoid type issues
          const { error: flagError } = await supabase
            .from('content_flags')
            .insert(flag);
            
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
