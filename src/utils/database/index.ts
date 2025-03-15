
// Core database utilities
export { tableExists, executeSql, columnExists } from './core';

// Schema management
export { createTableIfNotExists, addColumnIfNotExists } from './schema';

// Setup functions
export { setupRpcFunctions } from './rpcSetup';
export { setupModerationTables } from './moderationTables';
export { setupEmergencyTables } from './emergencyTables';
export { updateProfileSchema } from './profileSchema';
