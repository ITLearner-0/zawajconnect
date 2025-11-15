import { executeSql, tableExists, columnExists } from './core';

/**
 * Creates a table if it doesn't exist
 */
export const createTableIfNotExists = async (
  tableName: string,
  schema: string
): Promise<boolean> => {
  try {
    const exists = await tableExists(tableName);

    if (!exists) {
      await executeSql(schema);
      return true;
    }

    return false;
  } catch (err) {
    console.error(`Error creating table ${tableName}:`, err);
    return false;
  }
};

/**
 * Adds a column to a table if it doesn't exist
 */
export const addColumnIfNotExists = async (
  tableName: string,
  columnName: string,
  columnDefinition: string
): Promise<boolean> => {
  try {
    const exists = await columnExists(tableName, columnName);

    if (!exists) {
      const query = `
        ALTER TABLE ${tableName}
        ADD COLUMN IF NOT EXISTS ${columnName} ${columnDefinition}
      `;
      await executeSql(query);
      return true;
    }

    return false;
  } catch (err) {
    console.error(`Error adding column ${columnName} to ${tableName}:`, err);
    return false;
  }
};
