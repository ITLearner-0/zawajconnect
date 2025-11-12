# Shared Edge Function Utilities

This directory contains shared utilities that can be imported by all Supabase Edge Functions.

## errorHandler.ts

Centralized error handling system providing:

- **Generic user messages**: Never expose internal implementation details to end users
- **Detailed server logging**: All error details logged server-side with context
- **Consistent error codes**: Standard error codes across all functions
- **Type-safe responses**: TypeScript interfaces for all error/success responses

### Usage

```typescript
import { handleError, handleAIError, successResponse, ErrorCode } from '../_shared/errorHandler.ts';

// Handle general errors
if (!data) {
  return handleError(
    new Error('Data not found'),
    ErrorCode.NOT_FOUND,
    'MY_FUNCTION'
  );
}

// Handle AI Gateway errors
if (!aiResponse.ok) {
  const errorText = await aiResponse.text();
  return handleAIError(aiResponse.status, errorText, 'MY_FUNCTION');
}

// Return success
return successResponse({ data: result });
```

### Error Codes

- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): Access denied
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid input data
- `OPERATION_FAILED` (400): Operation failed
- `AI_GATEWAY_ERROR` (503): AI service unavailable
- `RATE_LIMIT` (429): Rate limit exceeded
- `INSUFFICIENT_CREDITS` (402): Insufficient credits
- `INTERNAL_ERROR` (500): Internal server error

### Security Benefits

1. **No Information Leakage**: Users only see generic messages
2. **Debug-Friendly**: Detailed errors in server logs
3. **Audit Trail**: All errors logged with context and timestamp
4. **Consistent UX**: Same error format across all endpoints
5. **Type Safety**: Prevents accidental exposure of sensitive data
