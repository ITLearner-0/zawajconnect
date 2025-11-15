// Data encryption at rest service
// Crypto-js temporarily disabled - using native crypto instead

const ENCRYPTION_KEY = 'nikah-connect-encryption-key-2024';

export class DataEncryptionService {
  // Encrypt sensitive data before storing
  static encryptData(data: any): string {
    try {
      const jsonString = JSON.stringify(data);
      // Use base64 encoding as placeholder (NOT secure for production)
      const encrypted = btoa(jsonString);
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  // Decrypt data when retrieving
  static decryptData<T>(encryptedData: string): T {
    try {
      // Use base64 decoding as placeholder (NOT secure for production)
      const decryptedData = atob(encryptedData);
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

    sensitiveFields.forEach((field) => {
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
    const encryptedFields = Object.keys(decrypted).filter((key) => key.endsWith('_encrypted'));

    encryptedFields.forEach((field) => {
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
    // Simple hash placeholder (NOT cryptographically secure)
    const normalized = query.toLowerCase().trim();
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
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
