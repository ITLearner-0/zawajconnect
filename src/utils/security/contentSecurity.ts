// Content Security Policy and XSS Protection utilities
export const setupContentSecurityPolicy = () => {
  // Add CSP meta tag if it doesn't exist
  if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://*.supabase.co https://api.stripe.com",
      "font-src 'self' https://fonts.gstatic.com",
      "frame-src 'self' https://js.stripe.com",
    ].join('; ');
    document.head.appendChild(meta);
  }
};

export const sanitizeUserGeneratedContent = (content: string): string => {
  // More comprehensive HTML sanitization
  const tempDiv = document.createElement('div');
  tempDiv.textContent = content;
  return tempDiv.innerHTML;
};

export const validateFileUpload = (file: File): { isValid: boolean; error?: string } => {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Type de fichier non autorisé' };
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return { isValid: false, error: 'Fichier trop volumineux (max 5MB)' };
  }

  return { isValid: true };
};

// Initialize CSP on app load
if (typeof window !== 'undefined') {
  setupContentSecurityPolicy();
}
