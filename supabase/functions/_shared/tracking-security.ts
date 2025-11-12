/**
 * Security utilities for email tracking with HMAC signatures
 */

const TRACKING_SECRET = Deno.env.get('TRACKING_SECRET') || 'default-tracking-secret-change-in-production';

/**
 * Generate HMAC signature for tracking token
 */
export async function generateTrackingSignature(
  resultId: string,
  userId: string,
  timestamp: number
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${resultId}:${userId}:${timestamp}`);
  
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(TRACKING_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, data);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verify HMAC signature for tracking token
 */
export async function verifyTrackingSignature(
  resultId: string,
  userId: string,
  timestamp: number,
  signature: string
): Promise<boolean> {
  const expectedSignature = await generateTrackingSignature(resultId, userId, timestamp);
  return expectedSignature === signature;
}

/**
 * Generate signed tracking URL
 */
export async function generateSignedTrackingUrl(
  baseUrl: string,
  resultId: string,
  userId: string,
  eventType: 'opened' | 'clicked'
): Promise<string> {
  const timestamp = Date.now();
  const signature = await generateTrackingSignature(resultId, userId, timestamp);
  
  return `${baseUrl}?result_id=${resultId}&event_type=${eventType}&timestamp=${timestamp}&signature=${signature}`;
}

/**
 * Parse and validate tracking parameters
 */
export interface TrackingParams {
  result_id: string;
  event_type: 'opened' | 'clicked';
  timestamp: number;
  signature: string;
}

export function parseTrackingParams(url: URL): TrackingParams | null {
  const result_id = url.searchParams.get('result_id');
  const event_type = url.searchParams.get('event_type') as 'opened' | 'clicked' | null;
  const timestamp = url.searchParams.get('timestamp');
  const signature = url.searchParams.get('signature');
  
  if (!result_id || !event_type || !timestamp || !signature) {
    return null;
  }
  
  return {
    result_id,
    event_type,
    timestamp: parseInt(timestamp, 10),
    signature
  };
}

/**
 * Validate tracking request (signature, timestamp, replay)
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export async function validateTrackingRequest(
  params: TrackingParams,
  userId: string
): Promise<ValidationResult> {
  // Check timestamp is within 7 days (email campaigns can be opened later)
  const now = Date.now();
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  if (now - params.timestamp > maxAge) {
    return { valid: false, error: 'Tracking link expired (older than 7 days)' };
  }
  
  // Prevent future timestamps (clock skew attack)
  if (params.timestamp > now + 60000) { // 1 minute tolerance
    return { valid: false, error: 'Invalid timestamp (future)' };
  }
  
  // Verify HMAC signature
  const signatureValid = await verifyTrackingSignature(
    params.result_id,
    userId,
    params.timestamp,
    params.signature
  );
  
  if (!signatureValid) {
    return { valid: false, error: 'Invalid signature - tracking link may have been tampered with' };
  }
  
  return { valid: true };
}
