/**
 * In-memory sliding-window rate limiter for production API endpoints.
 * Provides protection against brute force and denial of service without requiring Redis.
 */

const ipRequestMap = new Map();

// Periodic cleanup every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of ipRequestMap.entries()) {
      if (now > record.resetTime) {
        ipRequestMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Checks if a given identifier exceeds the rate limit.
 * @param {string} identifier - Client IP or session ID
 * @param {number} limit - Maximum allowed requests in the window (default: 60)
 * @param {number} windowMs - Window duration in milliseconds (default: 60,000ms = 1 min)
 * @returns {{ success: boolean, remaining: number, resetTime: number }}
 */
export function rateLimit(identifier, limit = 60, windowMs = 60 * 1000) {
  const now = Date.now();
  const clientRecord = ipRequestMap.get(identifier);

  if (!clientRecord || now > clientRecord.resetTime) {
    ipRequestMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    });
    return {
      success: true,
      remaining: limit - 1,
      resetTime: now + windowMs
    };
  }

  if (clientRecord.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: clientRecord.resetTime
    };
  }

  clientRecord.count += 1;
  return {
    success: true,
    remaining: limit - clientRecord.count,
    resetTime: clientRecord.resetTime
  };
}

/**
 * Helper to extract client IP address from Next.js request headers
 * @param {Request} request 
 * @returns {string}
 */
export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

