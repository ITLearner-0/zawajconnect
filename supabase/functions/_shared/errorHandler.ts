/**
 * Centralized error handling for Supabase Edge Functions
 * Provides generic user messages while logging detailed errors server-side
 */

export interface ErrorResponse {
  error: string;
  errorCode: string;
}

export enum ErrorCode {
  UNAUTHORIZED = 'ERR_UNAUTHORIZED',
  FORBIDDEN = 'ERR_FORBIDDEN',
  NOT_FOUND = 'ERR_NOT_FOUND',
  VALIDATION_ERROR = 'ERR_VALIDATION',
  OPERATION_FAILED = 'ERR_OPERATION_FAILED',
  AI_GATEWAY_ERROR = 'ERR_AI_GATEWAY',
  RATE_LIMIT = 'ERR_RATE_LIMIT',
  INSUFFICIENT_CREDITS = 'ERR_INSUFFICIENT_CREDITS',
  INTERNAL_ERROR = 'ERR_INTERNAL',
}

const genericMessages: Record<ErrorCode, string> = {
  [ErrorCode.UNAUTHORIZED]: 'Authentification requise',
  [ErrorCode.FORBIDDEN]: 'Accès non autorisé',
  [ErrorCode.NOT_FOUND]: 'Ressource introuvable',
  [ErrorCode.VALIDATION_ERROR]: 'Données invalides',
  [ErrorCode.OPERATION_FAILED]: 'Opération échouée',
  [ErrorCode.AI_GATEWAY_ERROR]: 'Service temporairement indisponible',
  [ErrorCode.RATE_LIMIT]: 'Limite de requêtes dépassée. Veuillez réessayer plus tard.',
  [ErrorCode.INSUFFICIENT_CREDITS]: 'Crédits insuffisants',
  [ErrorCode.INTERNAL_ERROR]: 'Une erreur est survenue. Veuillez réessayer.',
};

/**
 * Log error details server-side and return generic message to client
 */
export function handleError(error: unknown, errorCode: ErrorCode, context?: string): Response {
  // Detailed server-side logging
  const logPrefix = context ? `[${context}]` : '[ERROR]';
  console.error(logPrefix, {
    errorCode,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  });

  // Generic user-facing message
  const userMessage = genericMessages[errorCode];

  return new Response(
    JSON.stringify({
      error: userMessage,
      errorCode,
    }),
    {
      status: getHttpStatus(errorCode),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Handle AI Gateway specific errors with proper status codes
 */
export function handleAIError(status: number, errorText: string, context?: string): Response {
  console.error(`[${context || 'AI'}]`, {
    status,
    errorText,
    timestamp: new Date().toISOString(),
  });

  if (status === 429) {
    return handleError(new Error('Rate limit'), ErrorCode.RATE_LIMIT, context);
  }

  if (status === 402) {
    return handleError(new Error('Insufficient credits'), ErrorCode.INSUFFICIENT_CREDITS, context);
  }

  return handleError(new Error('AI Gateway error'), ErrorCode.AI_GATEWAY_ERROR, context);
}

/**
 * Map error codes to HTTP status codes
 */
function getHttpStatus(errorCode: ErrorCode): number {
  const statusMap: Record<ErrorCode, number> = {
    [ErrorCode.UNAUTHORIZED]: 401,
    [ErrorCode.FORBIDDEN]: 403,
    [ErrorCode.NOT_FOUND]: 404,
    [ErrorCode.VALIDATION_ERROR]: 400,
    [ErrorCode.OPERATION_FAILED]: 400,
    [ErrorCode.AI_GATEWAY_ERROR]: 503,
    [ErrorCode.RATE_LIMIT]: 429,
    [ErrorCode.INSUFFICIENT_CREDITS]: 402,
    [ErrorCode.INTERNAL_ERROR]: 500,
  };

  return statusMap[errorCode] || 500;
}

/**
 * Success response helper
 */
export function successResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
  });
}
