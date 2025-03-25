
import { supabase } from '@/integrations/supabase/client';
import { columnExists, executeSql } from '@/utils/database';

// Update to handle data returned from executeSql correctly
export const getModeratedContentCount = async (): Promise<number> => {
  try {
    const result = await executeSql(`
      SELECT COUNT(*) as count
      FROM content_flags
      WHERE resolved = true
    `);
    
    // Handle different return types from executeSql
    if (result && typeof result !== 'boolean') {
      const data = Array.isArray(result) ? result[0] : result;
      return data?.count ? parseInt(data.count, 10) : 0;
    }
    
    return 0;
  } catch (error) {
    console.error('Error getting moderated content count:', error);
    return 0;
  }
};
