# Sentry Configuration Guide for ZawajConnect

**Date**: December 4, 2025
**Status**: ✅ Fully Configured

## 📋 Overview

Sentry is now fully integrated for production error monitoring and performance tracking. This guide explains how to complete the setup and use Sentry effectively.

---

## 🎯 What's Included

### ✅ Completed Configuration

1. **Sentry SDK installed** (`@sentry/react` v10.28.0, `@sentry/vite-plugin` v4.6.1)
2. **Configuration file** (`src/config/sentry.ts`) - Complete with privacy filters
3. **Logger integration** (`src/utils/logger.ts`) - Auto-sends errors to Sentry
4. **App initialization** (`src/main.tsx`) - Sentry starts before app
5. **Build integration** (`vite.config.ts`) - Automatic source maps upload
6. **Environment variables** (`.env.example`) - All variables documented

### 🔧 Features Configured

- ✅ **Error Tracking** - All errors captured and reported
- ✅ **Performance Monitoring** - Tracks page loads, API calls, navigation
- ✅ **Session Replay** - Captures 100% of sessions with errors, 10% of normal sessions
- ✅ **Privacy Filters** - Email, IP addresses, and sensitive data automatically removed
- ✅ **Smart Error Filtering** - Ignores browser extensions, network errors, and other noise
- ✅ **Source Maps** - Uploaded in production for readable stack traces
- ✅ **User Context** - Anonymous user tracking by ID (no PII)

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Sentry Account

1. Go to [https://sentry.io](https://sentry.io)
2. Sign up for a free account (generous free tier)
3. Create a new project:
   - Platform: **React**
   - Alert frequency: **On every issue** (recommended initially)

### Step 2: Get Your DSN

After creating the project, Sentry will show you a DSN. It looks like:

```
https://abc123def456@o123456.ingest.sentry.io/789012
```

### Step 3: Configure Environment Variables

Copy `.env.example` to `.env` and update these variables:

```bash
# Required for Sentry to work
VITE_SENTRY_DSN=https://your_actual_dsn@sentry.io/project_id
VITE_SENTRY_ENVIRONMENT=production
VITE_APP_VERSION=1.0.0
```

**For production builds with source maps** (optional but recommended):

```bash
# Get auth token from: https://sentry.io/settings/account/api/auth-tokens/
SENTRY_ORG=your-organization-slug
SENTRY_PROJECT=zawajconnect
SENTRY_AUTH_TOKEN=your-auth-token-here
```

### Step 4: Test in Development

Start your dev server:

```bash
npm run dev
```

You should see in the console:

```
Sentry not initialized: Development mode
```

This is normal! Sentry only runs in production to avoid noise.

### Step 5: Test in Production

Build and test production mode:

```bash
npm run build
npm run preview
```

You should see:

```
✅ Sentry initialized successfully
```

---

## 📊 Using Sentry

### Automatic Error Capture

All errors are automatically captured:

```typescript
// This error will be sent to Sentry automatically in production
throw new Error('Something went wrong');
```

### Manual Error Capture

```typescript
import { captureException, captureMessage } from '@/config/sentry';

// Capture an exception with context
try {
  riskyOperation();
} catch (error) {
  captureException(error, {
    userId: user.id,
    operation: 'riskyOperation',
    extra: 'context data',
  });
}

// Capture a message
captureMessage('User completed checkout', 'info', {
  amount: 49.99,
  plan: 'premium',
});
```

### Set User Context

```typescript
import { setUser } from '@/config/sentry';

// After user logs in
setUser({
  id: user.id,
  username: user.username,
});

// After user logs out
setUser(null);
```

### Add Breadcrumbs

```typescript
import { addBreadcrumb } from '@/config/sentry';

// Add debugging context
addBreadcrumb(
  'User clicked subscribe button',
  'user-action',
  'info',
  { planId: 'premium' }
);
```

### Use with Logger

The logger automatically sends errors to Sentry:

```typescript
import { logger } from '@/utils/logger';

// This will be sent to Sentry in production
logger.error('Payment failed', error, {
  userId: user.id,
  amount: 49.99,
});

// Warnings also go to Sentry
logger.warn('Slow API response', { duration: 5000 });
```

---

## 🔍 Understanding the Dashboard

### Issues Tab

- Shows all errors grouped by type
- Click an issue to see:
  - Stack trace (readable with source maps)
  - User context
  - Breadcrumbs leading to error
  - Browser/OS information
  - Number of users affected

### Performance Tab

- Shows page load times
- API call durations
- Slowest transactions
- Performance trends over time

### Replays Tab

- Watch actual user sessions that had errors
- See exactly what the user did before the error
- Privacy-safe: all text and media masked

---

## 🔒 Privacy & Security

### What's Filtered Out

Sentry is configured to respect user privacy:

- ✅ **Email addresses** - Automatically removed from errors
- ✅ **IP addresses** - Not collected
- ✅ **Session replays** - All text and media masked by default
- ✅ **Console logs** - Not sent as breadcrumbs
- ✅ **Network errors** - Expected failures filtered out
- ✅ **Browser extensions** - Ignored completely

### What's Collected

- Error messages and stack traces
- Anonymous user ID (UUID only, no PII)
- Page URLs (no query parameters)
- Browser type and version
- Device type (desktop/mobile)
- Performance metrics

---

## ⚙️ Configuration Options

### Adjust Sample Rates

In `src/config/sentry.ts`:

```typescript
// Performance monitoring sample rate (10% in production)
tracesSampleRate: ENV === 'production' ? 0.1 : 1.0,

// Session replay rates
replayIntegration({
  sessionSampleRate: 0.1, // 10% of normal sessions
  errorSampleRate: 1.0,   // 100% of error sessions
}),
```

**Recommendations:**

- **Development**: 100% (1.0) - capture everything for debugging
- **Production (small app)**: 100% (1.0) - capture all errors
- **Production (high traffic)**: 10-30% (0.1-0.3) - reduce quota usage

### Add Custom Tags

```typescript
Sentry.setTag('feature', 'payment');
Sentry.setTag('experiment', 'new-checkout-flow');
```

### Filter Additional Errors

Edit `ignoreErrors` array in `src/config/sentry.ts`:

```typescript
ignoreErrors: [
  'NetworkError',
  'My custom error to ignore',
  /regex pattern/i,
],
```

---

## 🧪 Testing Sentry Integration

### Test Error Capture

Create a test button in development:

```typescript
const TestSentryButton = () => (
  <button onClick={() => {
    throw new Error('Test Sentry Error');
  }}>
    Test Sentry
  </button>
);
```

In production, this error will appear in your Sentry dashboard within seconds.

### Test Performance Monitoring

```typescript
import * as Sentry from '@sentry/react';

// Start a custom transaction
const transaction = Sentry.startTransaction({
  name: 'Checkout Flow',
  op: 'user-interaction',
});

// Do work...
await processCheckout();

// End transaction
transaction.finish();
```

---

## 📈 Best Practices

### 1. Set Meaningful Contexts

```typescript
// Good ✅
captureException(error, {
  userId: user.id,
  action: 'subscribe',
  plan: 'premium',
  source: 'checkout-page',
});

// Bad ❌
captureException(error);
```

### 2. Use Appropriate Severity Levels

```typescript
// Critical errors affecting functionality
captureMessage('Payment gateway down', 'fatal');

// Important but not critical
captureMessage('Slow API response', 'warning');

// Just informational
captureMessage('User completed onboarding', 'info');
```

### 3. Group Related Errors

```typescript
Sentry.setTag('feature', 'authentication');
// All subsequent errors will be tagged with 'feature: authentication'
```

### 4. Add Release Information

Update `VITE_APP_VERSION` in `.env` when deploying:

```bash
VITE_APP_VERSION=1.2.3
```

This helps track which version introduced bugs.

---

## 🚨 Alerts & Notifications

### Set Up Alerts

In Sentry dashboard:

1. Go to **Settings** → **Alerts**
2. Create alert rules:
   - **New issue**: Alert on every new unique error
   - **Spike**: Alert if error rate increases 100%
   - **Critical errors**: Alert on 'fatal' severity

### Integrations

Connect Sentry to:

- **Slack** - Get alerts in your team channel
- **GitHub** - Auto-create issues for errors
- **Email** - Get daily/weekly digests

---

## 📊 Monitoring Checklist

### Daily

- [ ] Check for new critical errors
- [ ] Review spike alerts
- [ ] Confirm error rate is stable

### Weekly

- [ ] Review most common errors
- [ ] Check performance trends
- [ ] Review user feedback (if enabled)

### Monthly

- [ ] Adjust sample rates if needed
- [ ] Review and update ignored errors
- [ ] Clean up resolved issues

---

## 🐛 Troubleshooting

### Sentry Not Initializing

**Issue**: Console shows "Sentry not initialized"

**Solutions:**

1. Check `VITE_SENTRY_DSN` is set in `.env`
2. Verify you're running in production mode: `npm run build && npm run preview`
3. Check DSN format is correct (starts with `https://`)

### No Errors Appearing in Dashboard

**Issue**: Errors not showing up in Sentry

**Solutions:**

1. Check errors aren't filtered out in `beforeSend`
2. Verify DSN is correct
3. Wait 30-60 seconds (Sentry batches events)
4. Check your Sentry quota hasn't been exceeded

### Source Maps Not Working

**Issue**: Stack traces show minified code

**Solutions:**

1. Set `SENTRY_AUTH_TOKEN` in environment
2. Verify `SENTRY_ORG` and `SENTRY_PROJECT` are correct
3. Check build logs for source map upload confirmation
4. Ensure `sourcemap: 'hidden'` in `vite.config.ts`

### Too Many Events

**Issue**: Sentry quota exceeded

**Solutions:**

1. Reduce `tracesSampleRate` to 0.1 (10%)
2. Reduce `sessionSampleRate` to 0.05 (5%)
3. Add more patterns to `ignoreErrors`
4. Review and fix high-frequency errors

---

## 💰 Pricing & Quotas

### Free Tier (Developer Plan)

- **5,000 errors/month** - More than enough for small apps
- **500 replays/month** - Enough to debug most issues
- **10,000 performance units/month**
- **30 days data retention**
- **1 team member**

### When to Upgrade

Consider upgrading if:

- You exceed monthly quotas consistently
- You need longer data retention (90+ days)
- You need more team members
- You want priority support

---

## 🔗 Useful Links

- **Sentry Dashboard**: https://sentry.io/organizations/your-org/projects/
- **Documentation**: https://docs.sentry.io/platforms/javascript/guides/react/
- **React SDK**: https://docs.sentry.io/platforms/javascript/guides/react/
- **Best Practices**: https://docs.sentry.io/product/best-practices/
- **Privacy**: https://docs.sentry.io/product/data-management-settings/

---

## 📝 Summary

### What You Need to Do

1. ✅ Create Sentry account (free)
2. ✅ Get DSN from project settings
3. ✅ Add `VITE_SENTRY_DSN` to `.env`
4. ✅ Build and test: `npm run build && npm run preview`
5. ✅ Deploy to production
6. ✅ Monitor errors in Sentry dashboard

### What's Already Done

- ✅ Sentry SDK installed
- ✅ Configuration file created
- ✅ Logger integration
- ✅ Privacy filters configured
- ✅ Source maps setup
- ✅ Error boundaries ready

---

**You're all set!** 🎉

Just add your DSN and Sentry will start monitoring errors automatically in production.

---

**Last Updated**: December 4, 2025
**Configuration Version**: 1.0
**Sentry SDK Version**: 10.28.0
