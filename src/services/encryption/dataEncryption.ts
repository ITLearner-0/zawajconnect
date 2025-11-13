
// Data encryption at rest service
// Temporarily disabled - using btoa/atob placeholders

const ENCRYPTION_KEY = 'nikah-connect-encryption-key-2024';

export class DataEncryptionService {
  // Encrypt sensitive data before storing
  static encryptData(data: any): string {
    try {
      const jsonString = JSON.stringify(data);
      return btoa(jsonString); // Temporary placeholder
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  // Decrypt data when retrieving
  static decryptData<T>(encryptedData: string): T {
    try {
      const decryptedData = atob(encryptedData); // Temporary placeholder
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  // Encrypt profile data
  static encryptProfileData(profile: any) {
    const sensitiveFields = ['phone', 'address', 'wali_contact', 'birth_date'];
    const encrypted = { ...profile };
    
    sensitiveFields.forEach(field => {
      if (encrypted[field]) {
        encrypted[`${field}_encrypted`] = this.encryptData(encrypted[field]);
        delete encrypted[field];
      }
    });
    
    return encrypted;
  }

  // Decrypt profile data
  static decryptProfileData(encryptedProfile: any) {
    const decrypted = { ...encryptedProfile };
    const encryptedFields = Object.keys(decrypted).filter(key => key.endsWith('_encrypted'));
    
    encryptedFields.forEach(field => {
      const originalField = field.replace('_encrypted', '');
      try {
        decrypted[originalField] = this.decryptData(decrypted[field]);
        delete decrypted[field];
      } catch (error) {
        console.warn(`Failed to decrypt ${originalField}:`, error);
      }
    });
    
    return decrypted;
  }

  // Hash sensitive search queries
  static hashSearchQuery(query: string): string {
    // Temporary simple hash using btoa
    return btoa(query.toLowerCase().trim());
  }

  // Generate secure tokens
  static generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
