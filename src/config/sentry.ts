/**
 * Sentry Error Monitoring Configuration
 *
 * Centralized configuration for error tracking and performance monitoring
 * in production environment.
 */

import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const ENV = import.meta.env.MODE;
const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';
const isDev = import.meta.env.DEV;

/**
 * Initialize Sentry error monitoring
 * Only enabled in production with valid DSN
 */
export function initSentry(): void {
  // Only initialize in production with valid DSN
  if (ENV !== 'production' || !SENTRY_DSN) {
    console.log(
      'Sentry not initialized:',
      ENV === 'production' ? 'Missing DSN' : 'Development mode'
    );
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENV,
    release: `zawajconnect@${APP_VERSION}`,

    // Performance Monitoring with new API
    integrations: [
      Sentry.browserTracingIntegration({
        // Trace all navigation
        tracePropagationTargets: ['localhost', 'zawajconnect.com', /^https:\/\/[^/]*\.supabase\.co/],
      }),
      Sentry.replayIntegration({
        // Capture 10% of all sessions
        sessionSampleRate: 0.1,
        // Capture 100% of sessions with errors
        errorSampleRate: 1.0,
        // Mask all text and user input by default for privacy
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Set sample rate for performance monitoring
    // 0.1 = 10% of transactions will be sent in production
    tracesSampleRate: ENV === 'production' ? 0.1 : 1.0,

    // Set sample rate for profiling
    profilesSampleRate: ENV === 'production' ? 0.1 : 1.0,

    // Filter errors before sending
    beforeSend(event, hint) {
      // Don't send errors from development
      if (ENV !== 'production') {
        return null;
      }

      // Remove sensitive user data for privacy
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }

      // Filter out non-error console messages
      if (event.level === 'log' || event.level === 'info') {
        return null;
      }

      // Filter out common non-critical errors
      const error = hint.originalException;
      if (error instanceof Error) {
        // Network errors that are expected
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          return null;
        }

        // Ignore ResizeObserver errors (common browser quirk)
        if (error.message?.includes('ResizeObserver loop')) {
          return null;
        }

        // Ignore cancelled fetch requests
        if (error.message?.includes('AbortError') || error.message?.includes('cancelled')) {
          return null;
        }
      }

      return event;
    },

    // Additional configuration
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'chrome-extension',
      'moz-extension',
      // Random plugins/extensions
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      // Facebook borked
      'fb_xd_fragment',
      // ISP optimizers
      'bmi_SafeAddOnload',
      'EBCallBackMessageReceived',
      // Network errors
      'NetworkError',
      'Network request failed',
      // React errors that are handled
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      // Third-party scripts
      'Script error',
    ],

    // Ignore specific URLs
    denyUrls: [
      // Browser extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^moz-extension:\/\//i,
      /^chrome-extension:\/\//i,
    ],

    // Privacy settings
    beforeBreadcrumb(breadcrumb) {
      // Filter sensitive data from breadcrumbs
      if (breadcrumb.category === 'console') {
        return null;
      }
      return breadcrumb;
    },
  });

  // Set user context when available
  // This should be called after user authentication
  console.log('Sentry initialized successfully');
}

/**
 * Set user context for error tracking
 * Call this after successful authentication
 */
export function setSentryUser(user: { id: string; email?: string; username?: string }): void {
  if (ENV !== 'production') return;

  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

/**
 * Clear user context on logout
 */
export function clearSentryUser(): void {
  if (ENV !== 'production') return;
  Sentry.setUser(null);
}

/**
 * Manually capture an exception
 */
export function captureException(error: Error | unknown, context?: Record<string, unknown>): void {
  if (isDev) {
    console.error('❌ [Sentry] Error:', error, context);
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Manually capture a message
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, unknown>
): void {
  if (isDev) {
    console.log(`📝 [Sentry] Message (${level}):`, message, context);
    return;
  }

  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, unknown>
): void {
  if (isDev) return;

  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
  });
}

/**
 * Set user context for better error tracking
 */
export function setUser(user: { id: string; username?: string } | null): void {
  if (isDev) return;

  if (user) {
    Sentry.setUser({
      id: user.id,
      username: user.username,
    });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * React Error Boundary
 * Wrap your app with this component
 */
export const SentryErrorBoundary = Sentry.ErrorBoundary;

/**
 * Wrap a component with Sentry error boundary
 */
export const withSentryErrorBoundary = Sentry.withErrorBoundary;

/**
 * HOC for profiling React components
 */
export const withProfiler = Sentry.withProfiler;
