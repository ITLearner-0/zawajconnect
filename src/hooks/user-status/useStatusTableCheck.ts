
import { useEffect } from 'react';
import { tableExists } from '@/utils/database/core';

export const useStatusTableCheck = (
  userId: string | null,
  isDemoUser: boolean
) => {
  // Check if table exists before initial query
  useEffect(() => {
    const checkTable = async () => {
      if (!userId || isDemoUser) return;
      
      try {
        const exists = await tableExists('user_sessions');
        if (!exists) {
          console.log('user_sessions table does not exist');
        }
      } catch (err) {
        console.error('Error checking if user_sessions table exists:', err);
      }
    };
    
    checkTable();
  }, [userId, isDemoUser]);
};
