
// Service for handling voice message processing and storage

export interface VoiceMessage {
  id: string;
  conversationId: string;
  senderId: string;
  audioData: string; // base64 encoded audio
  duration: number; // in seconds
  mimeType: string;
  createdAt: string;
  isRead: boolean;
  isEncrypted?: boolean;
}

export class VoiceMessageService {
  
  // Convert audio blob to base64
  static async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get just the base64 data
        const base64Data = result.split(',')[1] ?? '';
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Convert base64 back to blob for playback
  static base64ToBlob(base64Data: string, mimeType: string): Blob {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  // Create audio URL from base64 data
  static createAudioUrl(base64Data: string, mimeType: string): string {
    const blob = this.base64ToBlob(base64Data, mimeType);
    return URL.createObjectURL(blob);
  }

  // Validate audio duration (max 5 minutes)
  static validateAudioDuration(duration: number): boolean {
    const MAX_DURATION = 5 * 60; // 5 minutes in seconds
    return duration > 0 && duration <= MAX_DURATION;
  }

  // Validate audio size (max 10MB)
  static validateAudioSize(base64Data: string): boolean {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    const sizeInBytes = (base64Data.length * 3) / 4; // Approximate size in bytes
    return sizeInBytes <= MAX_SIZE;
  }

  // Process voice message for sending
  static async processVoiceMessage(
    audioBlob: Blob,
    duration: number,
    conversationId: string,
    senderId: string
  ): Promise<VoiceMessage> {
    // Validate duration
    if (!this.validateAudioDuration(duration)) {
      throw new Error('Audio duration exceeds maximum limit (5 minutes)');
    }

    // Convert to base64
    const base64Data = await this.blobToBase64(audioBlob);

    // Validate size
    if (!this.validateAudioSize(base64Data)) {
      throw new Error('Audio file size exceeds maximum limit (10MB)');
    }

    return {
      id: `voice-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      conversationId,
      senderId,
      audioData: base64Data,
      duration,
      mimeType: audioBlob.type || 'audio/webm',
      createdAt: new Date().toISOString(),
      isRead: false,
      isEncrypted: false
    };
  }

  // Format duration for display
  static formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Cleanup audio URLs to prevent memory leaks
  static cleanup(audioUrls: string[]): void {
    audioUrls.forEach(url => {
      try {
        URL.revokeObjectURL(url);
      } catch (error) {
        console.warn('Failed to revoke audio URL:', error);
      }
    });
  }
}
