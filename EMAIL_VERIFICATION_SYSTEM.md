# Email Verification System - Technical Documentation

**Date**: December 4, 2025
**Status**: ⚠️ Temporarily Disabled
**Priority**: Medium (Deferred for architectural review)

## 📋 Overview

The email verification middleware in `src/hooks/useSecurityMiddleware.ts` has been temporarily disabled due to infinite redirect loops. This document explains the issue and proposes solutions for future implementation.

---

## 🐛 Current Issue

### Problem Description

The email verification enforcement was causing infinite redirect loops when enabled, preventing users from completing the verification flow.

### Location

File: `src/hooks/useSecurityMiddleware.ts`
Lines: 82-100 (commented out)

### Code Status

```typescript
// TEMPORARILY DISABLED - Allow all actions for authenticated users
// The email verification enforcement was causing infinite loops
// TODO: Re-enable with proper flow once email verification is working
```

---

## 🔍 Root Cause Analysis

### Why Infinite Loops Occurred

1. **Circular Navigation**
   - User tries to save profile → redirected to email verification
   - Email verification page requires profile data → redirects to profile
   - Profile page checks verification → back to verification
   - **Loop**: verification ↔ profile ↔ verification

2. **Middleware Overly Aggressive**
   - Blocked all actions for unverified users
   - Including actions needed to complete verification
   - No exemptions for verification flow itself

3. **State Management Issues**
   - Verification state not properly synchronized
   - `emailVerified` flag checked before update completed
   - Race conditions between auth state and profile state

---

## 🏗️ Architecture Problems

### Issue 1: No Exemption List

The middleware blocked **all** actions without distinguishing between:
- ✅ **Should allow**: Viewing verification page, completing verification
- ❌ **Should block**: Sending messages, creating matches, making payments

### Issue 2: Multiple Sources of Truth

Email verification status checked from:
1. `session.user.email_confirmed_at` (Supabase Auth)
2. `profile.email_verified` (Database)
3. `securityStatus.emailVerified` (Hook state)

These could be out of sync.

### Issue 3: No Flow Definition

No clear definition of:
- Which pages require verification
- Which actions require verification
- Where to redirect unverified users
- How to complete verification without being blocked

---

## ✅ Proposed Solution

### 1. Define Verification Flow

```typescript
// Verification flow exemptions
const VERIFICATION_EXEMPT_ROUTES = [
  '/verify-email',
  '/auth',
  '/logout',
  '/privacy',
  '/terms',
];

const VERIFICATION_EXEMPT_ACTIONS = [
  'verify_email',
  'resend_verification',
  'update_profile_basic', // Allow updating contact info for verification
  'logout',
];
```

### 2. Implement Tiered Access

Instead of binary (verified/not verified), use tiers:

```typescript
enum AccessTier {
  GUEST = 0,           // Not logged in
  UNVERIFIED = 1,      // Logged in, email not verified
  VERIFIED = 2,        // Email verified
  PHONE_VERIFIED = 3,  // Email + phone verified
  FULLY_VERIFIED = 4,  // Email + phone + ID verified
}

const TIER_PERMISSIONS = {
  [AccessTier.UNVERIFIED]: [
    'view_own_profile',
    'update_profile',
    'verify_email',
    'logout',
  ],
  [AccessTier.VERIFIED]: [
    ...TIER_PERMISSIONS[AccessTier.UNVERIFIED],
    'browse_profiles',
    'view_matches',
    'send_interest',
  ],
  [AccessTier.FULLY_VERIFIED]: [
    ...TIER_PERMISSIONS[AccessTier.VERIFIED],
    'send_messages',
    'video_call',
    'request_contact',
  ],
};
```

### 3. Single Source of Truth

Use only Supabase Auth as source of truth:

```typescript
const checkEmailVerified = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.email_confirmed_at !== null;
};
```

Remove `profile.email_verified` to avoid sync issues.

### 4. Graceful Degradation

Instead of blocking, show friendly prompts:

```typescript
const validateAction = async (action: string): Promise<ValidationResult> => {
  const tier = await getUserAccessTier();
  const required = getRequiredTier(action);

  if (tier < required) {
    return {
      allowed: false,
      reason: 'verification_required',
      message: 'Please verify your email to access this feature',
      redirectTo: '/verify-email',
      canBypass: false,
    };
  }

  return { allowed: true };
};
```

---

## 🛠️ Implementation Plan

### Phase 1: Infrastructure (2 hours)

1. **Create Access Tier System**
   ```typescript
   // src/types/access.ts
   export enum AccessTier { ... }
   export const TIER_PERMISSIONS = { ... }
   ```

2. **Update useSecurityMiddleware**
   ```typescript
   // src/hooks/useSecurityMiddleware.ts
   export const useSecurityMiddleware = () => {
     const [tier, setTier] = useState<AccessTier>(AccessTier.GUEST);

     const validateAction = async (action: string) => {
       const required = getRequiredTier(action);
       return tier >= required;
     };

     return { tier, validateAction };
   };
   ```

3. **Add Route Guards**
   ```typescript
   // src/components/RouteGuard.tsx
   const RouteGuard = ({ children, requiredTier }) => {
     const { tier } = useSecurityMiddleware();

     if (tier < requiredTier) {
       return <Redirect to="/verify-email" />;
     }

     return children;
   };
   ```

### Phase 2: User Experience (1 hour)

1. **Create Verification Prompt Component**
   ```typescript
   // src/components/VerificationPrompt.tsx
   const VerificationPrompt = ({ action, onComplete }) => {
     return (
       <Alert>
         <ShieldCheck className="h-4 w-4" />
         <AlertTitle>Verification Required</AlertTitle>
         <AlertDescription>
           To {action}, please verify your email address.
         </AlertDescription>
         <Button onClick={() => navigate('/verify-email')}>
           Verify Now
         </Button>
       </Alert>
     );
   };
   ```

2. **Update Pages with Graceful Degradation**
   ```typescript
   // Instead of hard blocking:
   const handleSendMessage = async () => {
     const result = await validateAction('send_message');

     if (!result.allowed) {
       // Show prompt instead of blocking
       setShowVerificationPrompt(true);
       return;
     }

     // Proceed with action
     await sendMessage();
   };
   ```

### Phase 3: Testing (1 hour)

1. **Test Verification Flow**
   - [ ] Unverified user can view own profile
   - [ ] Unverified user can update profile
   - [ ] Unverified user can access verification page
   - [ ] Unverified user sees prompts for restricted actions
   - [ ] After verification, all features unlock
   - [ ] No infinite loops occur

2. **Test Edge Cases**
   - [ ] Session expires during verification
   - [ ] User refreshes page during verification
   - [ ] Multiple tabs open
   - [ ] Network errors during verification

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
describe('useSecurityMiddleware', () => {
  it('should allow unverified users to access verification page', async () => {
    const { tier } = renderHook(() => useSecurityMiddleware());
    const result = await tier.validateAction('verify_email');
    expect(result.allowed).toBe(true);
  });

  it('should block unverified users from sending messages', async () => {
    const { tier } = renderHook(() => useSecurityMiddleware());
    const result = await tier.validateAction('send_message');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('verification_required');
  });

  it('should allow verified users to send messages', async () => {
    mockUserTier(AccessTier.VERIFIED);
    const { tier } = renderHook(() => useSecurityMiddleware());
    const result = await tier.validateAction('send_message');
    expect(result.allowed).toBe(true);
  });
});
```

### Integration Tests

```typescript
describe('Email Verification Flow', () => {
  it('should complete verification without loops', async () => {
    // 1. Start as unverified user
    await signIn('unverified@test.com');

    // 2. Try to browse profiles (should show prompt)
    await navigateTo('/browse');
    expect(screen.getByText('Verification Required')).toBeInTheDocument();

    // 3. Complete verification
    await clickButton('Verify Now');
    await completeEmailVerification();

    // 4. Should now be able to browse
    await navigateTo('/browse');
    expect(screen.getByText('Browse Profiles')).toBeInTheDocument();
  });
});
```

---

## 📊 Decision Matrix

### When to Require Verification

| Action | Tier Required | Reason |
|--------|---------------|---------|
| View own profile | UNVERIFIED | Need to complete profile |
| Update profile | UNVERIFIED | May need to add email |
| Browse profiles | VERIFIED | Prevent spam accounts |
| Send interest | VERIFIED | Ensure real users only |
| Send messages | VERIFIED | Prevent harassment |
| Video calls | PHONE_VERIFIED | Extra security |
| Request family contact | FULLY_VERIFIED | Sensitive information |

---

## 🚦 Migration Plan

### Step 1: Enable with Soft Launch (Week 1)

```typescript
// Enable but don't enforce
const validateAction = async (action: string) => {
  const result = checkPermissions(action);

  if (!result.allowed) {
    // Log but don't block
    console.warn('Action would be blocked:', action, result.reason);

    // Show non-blocking prompt
    toast({
      title: 'Verification Recommended',
      description: result.message,
      variant: 'info',
    });

    return true; // Allow anyway during soft launch
  }

  return true;
};
```

### Step 2: Monitor Metrics (Week 2)

Track:
- How many users hit verification prompts
- Conversion rate (prompt → verification)
- False positives (legitimate actions blocked)
- User complaints/feedback

### Step 3: Gradual Enforcement (Week 3)

```typescript
// Enforce for new users only
const shouldEnforce = user.created_at > ENFORCEMENT_DATE;

if (shouldEnforce && !result.allowed) {
  return false; // Block
}

return true; // Allow for existing users
```

### Step 4: Full Enforcement (Week 4)

Remove grace period, enforce for all users.

---

## 🔒 Security Considerations

### Email Verification Bypass Attempts

Protect against:

1. **Token Manipulation**
   - Use Supabase Auth tokens (cryptographically signed)
   - Never store verification status client-side only

2. **Race Conditions**
   - Lock user actions during verification
   - Atomic database updates

3. **Social Engineering**
   - Clear UI about what's being verified
   - No shortcuts or backdoors

### Privacy

- Don't expose email verification status publicly
- Log verification attempts for security audit
- Rate limit verification email sends

---

## 📝 Current Workaround

**Until proper implementation:**

```typescript
// In useSecurityMiddleware.ts (lines 82-103)
// validateAction currently returns true for all authenticated users
// This allows the app to function while we design the proper flow
```

**Impact:**
- ✅ App functions normally
- ✅ No infinite loops
- ⚠️ No email verification enforcement
- ⚠️ Spam risk slightly higher

**Mitigation:**
- Manual admin review of new accounts
- Flag suspicious activity
- Rate limiting on critical actions

---

## 🎯 Success Criteria

Verification system is ready when:

- [ ] No infinite redirect loops in any scenario
- [ ] Clear, user-friendly prompts for verification
- [ ] Exemptions for verification flow itself
- [ ] Single source of truth for verification status
- [ ] Graceful degradation (not hard blocks)
- [ ] Comprehensive test coverage (>90%)
- [ ] Monitoring and metrics in place
- [ ] User feedback is positive
- [ ] Admin dashboard shows verification stats

---

## 📚 Related Documentation

- **Supabase Auth**: https://supabase.com/docs/guides/auth
- **Email Verification**: https://supabase.com/docs/guides/auth/auth-email
- **RLS Policies**: https://supabase.com/docs/guides/auth/row-level-security

---

## 🤝 Recommended Next Steps

1. **Schedule Review Meeting**
   - Discuss proposed architecture
   - Get stakeholder buy-in
   - Prioritize vs. other features

2. **Create Epic/Story**
   - Break down into smaller tasks
   - Estimate effort (4-8 hours total)
   - Assign to developer

3. **Design User Experience**
   - Mock up verification prompts
   - User test the flow
   - Iterate based on feedback

4. **Implement & Test**
   - Follow implementation plan above
   - Comprehensive testing
   - Soft launch with monitoring

5. **Monitor & Iterate**
   - Track metrics
   - Gather user feedback
   - Adjust as needed

---

## ✅ Conclusion

Email verification is important for security and quality, but must be implemented carefully to avoid UX issues. The current temporary workaround is acceptable for the short term while we design a robust, user-friendly solution.

**Priority**: Medium
**Effort**: 4-8 hours
**Risk**: Low (current workaround is stable)
**Impact**: Medium (improves security and reduces spam)

---

**Last Updated**: December 4, 2025
**Next Review**: When prioritized for implementation
**Owner**: Backend Team
