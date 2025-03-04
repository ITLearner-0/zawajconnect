
// This service handles end-to-end encryption for message content

// Generate a random initialization vector
export const generateIV = (): string => {
  const arr = new Uint8Array(12);
  window.crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
};

// Generate a new encryption key
export const generateEncryptionKey = async (): Promise<CryptoKey> => {
  return window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
};

// Export key as base64 string
export const exportKey = async (key: CryptoKey): Promise<string> => {
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
};

// Import key from base64 string
export const importKey = async (keyString: string): Promise<CryptoKey> => {
  const keyData = Uint8Array.from(atob(keyString), c => c.charCodeAt(0));
  return window.crypto.subtle.importKey(
    'raw',
    keyData,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
};

// Encrypt a message
export const encryptMessage = async (
  message: string,
  keyString: string,
  iv: string
): Promise<string> => {
  try {
    // Convert IV from hex to Uint8Array
    const ivArray = new Uint8Array(iv.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    
    // Import the key
    const key = await importKey(keyString);
    
    // Encode the message
    const encodedMessage = new TextEncoder().encode(message);
    
    // Encrypt
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: ivArray,
      },
      key,
      encodedMessage
    );
    
    // Convert to base64 for storage
    return btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt message');
  }
};

// Decrypt a message
export const decryptMessage = async (
  encryptedMessage: string,
  keyString: string,
  iv: string
): Promise<string> => {
  try {
    // Convert IV from hex to Uint8Array
    const ivArray = new Uint8Array(iv.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    
    // Import the key
    const key = await importKey(keyString);
    
    // Decode the base64 encrypted message
    const encryptedData = Uint8Array.from(atob(encryptedMessage), c => c.charCodeAt(0));
    
    // Decrypt
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivArray,
      },
      key,
      encryptedData
    );
    
    // Decode the decrypted data
    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption error:', error);
    return '[Encrypted message - cannot decrypt]';
  }
};

// Store encryption key securely in local storage
export const storeEncryptionKey = (conversationId: string, keyString: string): void => {
  const encryptionKeys = getStoredEncryptionKeys();
  encryptionKeys[conversationId] = keyString;
  localStorage.setItem('encryption_keys', JSON.stringify(encryptionKeys));
};

// Retrieve encryption key from local storage
export const getEncryptionKey = (conversationId: string): string | null => {
  const encryptionKeys = getStoredEncryptionKeys();
  return encryptionKeys[conversationId] || null;
};

// Get all stored encryption keys
export const getStoredEncryptionKeys = (): Record<string, string> => {
  const keysJson = localStorage.getItem('encryption_keys');
  return keysJson ? JSON.parse(keysJson) : {};
};

// Generate a key ID for reference
export const generateKeyId = (): string => {
  return `key-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};
