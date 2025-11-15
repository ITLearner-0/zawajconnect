import { executeSql } from './core';

/**
 * Updates the profile table to include privacy and blocking fields if needed
 */
export const updateProfileSchema = async (): Promise<boolean> => {
  try {
    // Add privacy_settings column if it doesn't exist
    await executeSql(`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS privacy_settings JSONB 
      DEFAULT '{"profileVisibilityLevel": 1, "showAge": true, "showLocation": true, "showOccupation": true, "allowNonMatchMessages": true}'::jsonb
    `);

    // Add blocked_users column if it doesn't exist
    await executeSql(`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS blocked_users TEXT[] 
      DEFAULT '{}'::text[]
    `);

    // Add is_visible column if it doesn't exist
    await executeSql(`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS is_visible BOOLEAN 
      DEFAULT true
    `);

    // Add role column if it doesn't exist for admin features
    await executeSql(`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS role TEXT 
      DEFAULT 'user'
    `);

    return true;
  } catch (err) {
    console.error('Error updating profile schema:', err);
    return false;
  }
};
