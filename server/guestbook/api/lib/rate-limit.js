// Which bucket a request counts against. The hashing itself stays in the
// server, which holds the salt; this decides *what* gets hashed.

/**
 * Visitor IPs are hashed, never stored raw. The caller (the Next.js server
 * action) forwards the real client IP, since the request itself originates
 * from Vercel's infrastructure.
 *
 * A missing header must NOT disable rate limiting -- that failed open and let an
 * unlimited stream of signatures through. Callers without an IP share a single
 * bucket instead, so they stay throttled.
 */
const UNKNOWN_IP_BUCKET = "unknown-visitor";

/**
 * The value to hash for a request's rate-limit key. Never returns an empty
 * string: anything unusable collapses onto the shared bucket.
 */
const visitorBucket = (headerValue) => {
  const ip = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  const trimmed = typeof ip === "string" ? ip.trim() : "";
  return trimmed || UNKNOWN_IP_BUCKET;
};

export { UNKNOWN_IP_BUCKET, visitorBucket };
