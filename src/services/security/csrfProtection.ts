
// CSRF Protection service
export class CSRFProtection {
  private static readonly TOKEN_KEY = 'csrf_token';
  private static readonly HEADER_NAME = 'X-CSRF-Token';

  // Generate CSRF token
  static generateToken(): string {
    const token = this.generateRandomString(32);
    sessionStorage.setItem(this.TOKEN_KEY, token);
    return token;
  }

  // Get current CSRF token
  static getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  // Validate CSRF token
  static validateToken(token: string): boolean {
    const storedToken = this.getToken();
    return storedToken !== null && storedToken === token;
  }

  // Add CSRF token to request headers
  static addTokenToHeaders(headers: Record<string, string> = {}): Record<string, string> {
    const token = this.getToken();
    if (token) {
      headers[this.HEADER_NAME] = token;
    }
    return headers;
  }

  // Create protected fetch function
  static createProtectedFetch() {
    return async (url: string, options: RequestInit = {}) => {
      const token = this.getToken();
      
      if (!token) {
        throw new Error('CSRF token not found');
      }

      const headers = {
        ...options.headers,
        [this.HEADER_NAME]: token
      };

      return fetch(url, {
        ...options,
        headers
      });
    };
  }

  // Initialize CSRF protection
  static initialize(): void {
    // Generate token if it doesn't exist
    if (!this.getToken()) {
      this.generateToken();
    }

    // Refresh token periodically
    setInterval(() => {
      this.generateToken();
    }, 30 * 60 * 1000); // Refresh every 30 minutes
  }

  // Generate random string
  private static generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
