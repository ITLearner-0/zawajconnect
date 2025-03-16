
// Core database utilities
export { tableExists, executeSql, columnExists } from './core';

// Schema management
export { createTableIfNotExists, addColumnIfNotExists } from './schema';

// Setup functions
export { setupRpcFunctions } from './rpcSetup';
export { setupModerationTables } from './moderationTables';
export { setupEmergencyTables } from './emergencyTables';
export { updateProfileSchema } from './profileSchema';

// Mock functions for emergency tables 
export const setupEmergencyTablesIfNeeded = async () => {
  console.log('Setting up emergency tables if needed (mock implementation)');
  return true;
};

export const setupAdminNotificationsTable = async () => {
  console.log('Setting up admin notifications table (mock implementation)');
  return true;
};
