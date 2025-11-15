# Security Tests for SECURITY DEFINER Functions

This directory contains comprehensive security tests for all SECURITY DEFINER database functions to ensure they properly validate authentication, authorization, and handle edge cases.

## Test Structure

### securityDefinerFunctions.test.tsx

Tests core SECURITY DEFINER functions including:

- `is_user_in_active_conversation` - Conversation access validation
- `has_previous_conversation` - Conversation history checks
- `get_user_verification_status_secure` - Verification status access
- `is_premium_active` - Premium status checks
- `check_family_access_rate_limit` - Rate limiting validation
- `get_family_member_contact_secure` - Contact info access
- `assign_daily_quests_to_user` - Quest assignment validation
- `get_family_approval_status` - Family approval checks
- `increment_insight_views` - Insight view tracking

### roleBasedSecurityDefiner.test.tsx

Tests role-based access control functions including:

- `get_current_user_role_secure` - Current user role retrieval
- `get_user_role` - User role queries with authorization
- `get_validation_error_stats` - Admin-only statistics
- `get_onboarding_funnel` - Admin-only analytics
- `select_ab_test_variant` - A/B test variant assignment

## Test Categories

### Authentication Tests

Verify that all functions:

- ✅ Reject unauthenticated calls (no auth.uid())
- ✅ Require valid user session
- ✅ Return appropriate error messages

### Authorization Tests

Verify that functions:

- ✅ Enforce ownership checks (users can only access their own data)
- ✅ Validate relationship requirements (e.g., match participation)
- ✅ Respect role-based permissions (admin vs. regular user)
- ✅ Prevent privilege escalation

### Edge Case Tests

Verify proper handling of:

- ✅ SQL injection attempts
- ✅ Extremely long inputs
- ✅ Malformed UUIDs
- ✅ Empty strings
- ✅ Null values
- ✅ Concurrent requests

## Running Tests

### Run all security tests:

```bash
npm test src/test/security
```

### Run specific test file:

```bash
npm test src/test/security/securityDefinerFunctions.test.tsx
```

### Run with coverage:

```bash
npm test -- --coverage src/test/security
```

## Test Principles

1. **Fail Secure**: Tests verify that functions reject unauthorized access by default
2. **Explicit Authorization**: Functions must explicitly check auth.uid() and permissions
3. **No Information Leakage**: Error messages don't reveal sensitive data or system details
4. **Input Validation**: All user inputs are validated and sanitized
5. **Audit Logging**: Critical operations log security events

## Adding New Tests

When adding a new SECURITY DEFINER function, ensure you add tests for:

1. **Authentication**: Unauthenticated access should be rejected
2. **Authorization**: Unauthorized users should be denied access
3. **Ownership**: Users should only access their own resources
4. **Input Validation**: Invalid inputs should be rejected
5. **Edge Cases**: Null, empty, malformed inputs should be handled gracefully
6. **SQL Injection**: Parameterized queries prevent injection attacks

## Security Checklist

Before deploying a SECURITY DEFINER function:

- [ ] Function includes `SET search_path TO 'public'`
- [ ] Function validates `auth.uid() IS NOT NULL`
- [ ] Function checks ownership/authorization
- [ ] Function has comprehensive tests (auth, authz, edge cases)
- [ ] All tests pass
- [ ] Manual security review completed
- [ ] Function documented in SECURITY_DEFINER_AUDIT.md

## Monitoring

These tests should be:

- ✅ Run on every commit (CI/CD pipeline)
- ✅ Run before every deployment
- ✅ Reviewed quarterly as part of security audits
- ✅ Updated when new SECURITY DEFINER functions are added

## References

- [SECURITY_DEFINER_AUDIT.md](../../SECURITY_DEFINER_AUDIT.md) - Function audit results
- [SECURITY_DEFINER_BEST_PRACTICES.md](../../SECURITY_DEFINER_BEST_PRACTICES.md) - Security guidelines
- [Supabase Security Best Practices](https://supabase.com/docs/guides/database/postgres/row-level-security)
