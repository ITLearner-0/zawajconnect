
// Core database utilities
export { tableExists, executeSql, columnExists } from './core';

// Schema management
export { createTableIfNotExists, addColumnIfNotExists } from './schema';

// Setup functions
export { setupRpcFunctions } from './rpcSetup';
export { setupModerationTables } from './moderationTables';
export { setupEmergencyTables } from './emergencyTables';
export { updateProfileSchema } from './profileSchema';

// Export the real implementations instead of mock functions
export { setupEmergencyTables as setupEmergencyTablesIfNeeded } from './emergencyTables';

export const setupAdminNotificationsTable = async () => {
  // This is actually handled inside setupEmergencyTables now
  console.log('Setting up admin notifications table via emergencyTables...');
  // Import setupEmergencyTables locally to avoid conflicts with the export
  const { setupEmergencyTables } = require('./emergencyTables');
  const result = await setupEmergencyTables();
  return result;
};
