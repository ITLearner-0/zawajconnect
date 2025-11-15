// Export all database utilities from their respective modules
export { tableExists, columnExists, executeSql } from './core';
export { setupModerationTables } from './moderationTables';
export { setupEmergencyTables } from './emergencyTables';
export { setupRpcFunctions } from './rpcSetup';
export { updateProfileSchema } from './profileSchema';
export { createTableIfNotExists, addColumnIfNotExists } from './schema';
export { setupRLSPolicies, checkRLSPolicies } from './rls';

// Re-export additional utility functions from schema handling
export * from './schema';

// Export new optimized query utilities
export { QueryOptimizer } from './queryOptimizer';

// Export all optimized query functions
export * from './optimizedQueries';
