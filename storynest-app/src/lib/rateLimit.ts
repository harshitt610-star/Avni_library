/**
 * Lightweight In-Memory Sliding Window Rate Limiter
 * Provides DDoS & Brute-Force defense for sensitive Next.js API endpoints.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory token store mapped by namespace + identifier (e.g. IP or email)
const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic garbage collection every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 300000);

  // Unref timer so it doesn't hold open test scripts
  if (timer.unref) {
    timer.unref();
  }
}

export interface RateLimitOptions {
  intervalMs: number; // Window size in milliseconds
  maxRequests: number; // Max requests allowed per window
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  options: RateLimitOptions = { intervalMs: 60000, maxRequests: 20 }
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    // New window
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + options.intervalMs,
    };
    rateLimitStore.set(key, newRecord);
    return {
      success: true,
      limit: options.maxRequests,
      remaining: options.maxRequests - 1,
      resetAt: newRecord.resetAt,
    };
  }

  // Existing active window
  if (record.count >= options.maxRequests) {
    return {
      success: false,
      limit: options.maxRequests,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  record.count += 1;
  return {
    success: true,
    limit: options.maxRequests,
    remaining: options.maxRequests - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Helper to extract client IP from NextRequest headers safely
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

