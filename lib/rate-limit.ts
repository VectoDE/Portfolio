// Fixed-window rate limiting core. Kept free of imports so the unit tests can load it
// without Next.js or Redis; lib/rate-limit-store.ts wires it to Redis and the routes.

export interface RateLimitPolicy {
  /** Name used as part of the storage key, one per endpoint. */
  name: string
  /** Requests allowed per client within one window. */
  limit: number
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  /** Whole seconds until the window resets, for the Retry-After header. */
  retryAfterSeconds: number
}

/**
 * Client log endpoint: every page load sends two entries (page loaded, user agent) plus one
 * per uncaught error. 30 per minute leaves room for normal browsing behind a shared IP while
 * an error loop or a script cannot flood the server log.
 */
export const LOGGER_RATE_LIMIT: RateLimitPolicy = {
  name: "logger",
  limit: 30,
  windowMs: 60_000,
}

/**
 * Page view tracking: one request per navigation. 60 per minute covers fast clicking and
 * several visitors behind one NAT address while capping junk rows in the PageView table.
 */
export const PAGEVIEW_RATE_LIMIT: RateLimitPolicy = {
  name: "pageview",
  limit: 60,
  windowMs: 60_000,
}

/**
 * Upper bound for the in-memory fallback. Each entry is a few dozen bytes, so 10,000 clients
 * stay well below a megabyte; beyond that the oldest entries are dropped.
 */
export const MEMORY_RATE_LIMIT_MAX_KEYS = 10_000

export interface HeaderReader {
  get(name: string): string | null
}

/**
 * Client address for rate limiting: first x-forwarded-for entry, then x-real-ip.
 * Both headers are only trustworthy when the reverse proxy in front of the app sets them.
 */
export function getClientIp(headers: HeaderReader): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim()

  if (forwarded) {
    return forwarded
  }

  const realIp = headers.get("x-real-ip")?.trim()

  return realIp || "unknown"
}

/** Turns the request count inside the current window into a decision. */
export function evaluateWindow(
  count: number,
  limit: number,
  msUntilReset: number,
): RateLimitResult {
  const allowed = count <= limit

  return {
    allowed,
    remaining: Math.max(0, limit - count),
    retryAfterSeconds: Math.max(1, Math.ceil(msUntilReset / 1000)),
  }
}

interface WindowEntry {
  count: number
  resetAt: number
}

export interface MemoryRateLimiter {
  hit(key: string, policy: RateLimitPolicy, now?: number): RateLimitResult
  readonly size: number
}

export function createMemoryRateLimiter(maxKeys = MEMORY_RATE_LIMIT_MAX_KEYS): MemoryRateLimiter {
  const windows = new Map<string, WindowEntry>()

  function makeRoom(now: number) {
    for (const [key, entry] of windows) {
      if (entry.resetAt <= now) {
        windows.delete(key)
      }
    }

    // Map keeps insertion order, so the first keys are the oldest windows.
    while (windows.size >= maxKeys) {
      const oldest = windows.keys().next().value

      if (oldest === undefined) {
        break
      }

      windows.delete(oldest)
    }
  }

  return {
    hit(key, policy, now = Date.now()) {
      const storageKey = `${policy.name}:${key}`
      let entry = windows.get(storageKey)

      if (!entry || entry.resetAt <= now) {
        if (entry) {
          windows.delete(storageKey)
        } else if (windows.size >= maxKeys) {
          makeRoom(now)
        }

        entry = { count: 0, resetAt: now + policy.windowMs }
        windows.set(storageKey, entry)
      }

      entry.count += 1

      return evaluateWindow(entry.count, policy.limit, entry.resetAt - now)
    },
    get size() {
      return windows.size
    },
  }
}
