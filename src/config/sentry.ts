/**
 * Sentry Error Monitoring Configuration
 *
 * Centralized configuration for error tracking and performance monitoring
 * in production environment.
 */

// @ts-nocheck - Sentry not installed, keeping for future integration
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const ENV = import.meta.env.MODE;
const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

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

    // Performance Monitoring
    integrations: [
      new BrowserTracing({
        // Trace all navigation
        tracingOrigins: ['localhost', 'zawajconnect.com', /^\//],
      }),
    ],

    // Set sample rate for performance monitoring
    // 0.1 = 10% of transactions will be sent
    tracesSampleRate: ENV === 'production' ? 0.1 : 1.0,

    // Set sample rate for error events
    // 1.0 = 100% of errors will be sent
    sampleRate: 1.0,

    // Filter errors before sending
    beforeSend(event, hint) {
      // Don't send errors from development
      if (ENV !== 'production') {
        return null;
      }

      // Filter out common non-critical errors
      if (event.exception) {
        const error = hint.originalException;

        // Network errors that are expected
        if (error instanceof Error) {
          if (error.message.includes('Failed to fetch')) {
            return null;
          }
          if (error.message.includes('NetworkError')) {
            return null;
          }
        }
      }

      return event;
    },

    // Additional configuration
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      // Random plugins/extensions
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      // Facebook borked
      'fb_xd_fragment',
      // ISP optimizers
      'bmi_SafeAddOnload',
      'EBCallBackMessageReceived',
      // Chrome extensions
      'chrome-extension://',
      'moz-extension://',
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
export function captureException(error: Error, context?: Record<string, any>): void {
  if (ENV !== 'production') {
    console.error('Error captured:', error, context);
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Manually capture a message
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
  if (ENV !== 'production') {
    console.log(`[${level}] ${message}`);
    return;
  }

  Sentry.captureMessage(message, level);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, category: string, data?: Record<string, any>): void {
  if (ENV !== 'production') return;

  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}

/**
 * Start a performance transaction
 */
export function startTransaction(name: string, op: string): Sentry.Transaction | null {
  if (ENV !== 'production') return null;

  return Sentry.startTransaction({
    name,
    op,
  });
}

/**
 * React Error Boundary
 * Wrap your app with this component
 */
export const SentryErrorBoundary = Sentry.ErrorBoundary;

/**
 * HOC for profiling React components
 */
export const withProfiler = Sentry.withProfiler;
