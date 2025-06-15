
// Environment security utilities

// Check if we're in a secure context
export const isSecureContext = (): boolean => {
  return window.isSecureContext || window.location.protocol === 'https:';
};

// Generate Content Security Policy headers (for server-side)
export const generateCSPHeader = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://huozosbrlxayjkvakptu.supabase.co wss://huozosbrlxayjkvakptu.supabase.co https://api.mapbox.com",
    "frame-src 'self' https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');
};

// Security headers for enhanced protection
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': generateCSPHeader()
};

// Check for mixed content issues
export const checkMixedContent = (): { hasIssues: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  // Check for insecure scripts
  const scripts = document.querySelectorAll('script[src]');
  scripts.forEach(script => {
    const src = script.getAttribute('src');
    if (src && src.startsWith('http://')) {
      issues.push(`Insecure script: ${src}`);
    }
  });
  
  // Check for insecure stylesheets
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
  stylesheets.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('http://')) {
      issues.push(`Insecure stylesheet: ${href}`);
    }
  });
  
  return {
    hasIssues: issues.length > 0,
    issues
  };
};

// Environment-specific security configuration
export const getSecurityConfig = () => {
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;
  
  return {
    isDevelopment,
    isProduction,
    enableDetailedErrors: isDevelopment,
    enableSecurityHeaders: isProduction,
    requireHTTPS: isProduction,
    enableCSP: isProduction,
    logSecurityEvents: true
  };
};
