import { supabase } from '@/integrations/supabase/client';
import { ContentFlag } from '@/types/profile';

/**
 * Flags content for moderation review
 */
export const flagContent = async (
  contentId: string,
  contentType: ContentFlag['content_type'],
  flagType: ContentFlag['flag_type'],
  severity: ContentFlag['severity'],
  flaggedBy: string
): Promise<boolean> => {
  try {
    // Insert into content_flags table directly
    const { error } = await supabase.from('content_flags').insert({
      content_id: contentId,
      content_type: contentType,
      flag_type: flagType,
      severity: severity,
      flagged_by: flaggedBy,
      created_at: new Date().toISOString(),
      resolved: false,
    } as any);

    if (error) {
      console.error('Error creating content flag:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error flagging content:', err);
    return false;
  }
};

/**
 * Resolves a content flag
 */
export const resolveContentFlag = async (
  flagId: string,
  resolvedBy: string,
  notes?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('content_flags')
      .update({
        resolved: true,
        resolved_by: resolvedBy,
        resolved_at: new Date().toISOString(),
        notes: notes,
      })
      .eq('id', flagId);

    if (error) {
      console.error('Error resolving content flag:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error resolving content flag:', err);
    return false;
  }
};
