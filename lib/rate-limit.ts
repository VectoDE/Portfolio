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

/**
 * A full sweep of expired windows in the in-memory limiter runs at most this often. Between
 * sweeps a full map only drops its oldest entry, so a flood of new keys costs O(1) per request
 * instead of a walk over all entries (#97).
 */
export const MEMORY_RATE_LIMIT_SWEEP_INTERVAL_MS = 10_000

/**
 * ioredis options for the rate-limit store. The connection fails fast instead of queueing
 * commands, and commandTimeout bounds a Redis that is connected but does not answer (#96): the
 * command rejects, and checkRateLimit falls back to the in-memory limiter.
 */
export const RATE_LIMIT_REDIS_OPTIONS = {
  enableOfflineQueue: false,
  maxRetriesPerRequest: 1,
  connectTimeout: 2_000,
  commandTimeout: 500,
} as const

export interface HeaderReader {
  get(name: string): string | null
}

/** Longest header value that is parsed at all; longer values are ignored as junk. */
export const MAX_IP_HEADER_LENGTH = 512

/** Longest single address candidate (IPv6 with embedded IPv4 is 45 characters). */
const MAX_IP_CANDIDATE_LENGTH = 64

function parseIpv4(value: string): string | null {
  const parts = value.split(".")

  if (parts.length !== 4) {
    return null
  }

  const octets: number[] = []

  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) {
      return null
    }

    const octet = Number(part)

    if (octet > 255) {
      return null
    }

    octets.push(octet)
  }

  return octets.join(".")
}

/** Expands an IPv6 address into eight 16-bit groups, or returns null when it is not one. */
function parseIpv6Groups(value: string): number[] | null {
  let text = value.toLowerCase()

  // An embedded IPv4 tail (e.g. ::ffff:192.0.2.1) becomes the last two groups.
  const lastColon = text.lastIndexOf(":")
  const tail = text.slice(lastColon + 1)

  if (tail.includes(".")) {
    const ipv4 = parseIpv4(tail)

    if (!ipv4) {
      return null
    }

    const [a, b, c, d] = ipv4.split(".").map(Number)
    text = `${text.slice(0, lastColon + 1)}${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`
  }

  const halves = text.split("::")

  if (halves.length > 2) {
    return null
  }

  const toGroups = (part: string) => (part === "" ? [] : part.split(":"))
  const head = toGroups(halves[0])
  const rest = halves.length === 2 ? toGroups(halves[1]) : []
  const missing = 8 - head.length - rest.length

  if (halves.length === 2 ? missing < 1 : missing !== 0) {
    return null
  }

  const groups = [...head, ...Array<string>(halves.length === 2 ? missing : 0).fill("0"), ...rest]

  if (!groups.every((group) => /^[0-9a-f]{1,4}$/.test(group))) {
    return null
  }

  return groups.map((group) => parseInt(group, 16))
}

/**
 * Normalizes one address candidate from a header: strips ports and brackets ("[2001:db8::1]:443",
 * "192.0.2.1:8080"), zone ids ("fe80::1%eth0") and case, turns IPv4-mapped IPv6 into plain IPv4
 * and writes IPv6 in one fixed form (eight lowercase groups without leading zeros), so the same
 * client always ends up in the same bucket. Returns null for anything that is not an IP address.
 */
export function normalizeIp(raw: string): string | null {
  let value = raw.trim()

  if (!value || value.length > MAX_IP_CANDIDATE_LENGTH) {
    return null
  }

  const bracketed = /^\[([^\]]+)\](?::\d{1,5})?$/.exec(value)

  if (bracketed) {
    value = bracketed[1]
  } else if (/^[\d.]+:\d{1,5}$/.test(value)) {
    value = value.slice(0, value.lastIndexOf(":"))
  }

  const zone = value.indexOf("%")

  if (zone !== -1) {
    value = value.slice(0, zone)
  }

  if (!value.includes(":")) {
    return parseIpv4(value)
  }

  const groups = parseIpv6Groups(value)

  if (!groups) {
    return null
  }

  const isMappedIpv4 = groups.slice(0, 5).every((group) => group === 0) && groups[5] === 0xffff

  if (isMappedIpv4) {
    return [groups[6] >> 8, groups[6] & 0xff, groups[7] >> 8, groups[7] & 0xff].join(".")
  }

  return groups.map((group) => group.toString(16)).join(":")
}

/** Last valid address in a comma-separated header such as x-forwarded-for, or null. */
function lastIpInHeader(headers: HeaderReader, name: string): string | null {
  const value = headers.get(name)

  if (!value || value.length > MAX_IP_HEADER_LENGTH) {
    return null
  }

  const entries = value.split(",")

  for (let i = entries.length - 1; i >= 0; i--) {
    const ip = normalizeIp(entries[i])

    if (ip) {
      return ip
    }
  }

  return null
}

export interface ClientIpOptions {
  /**
   * Read x-vercel-forwarded-for. Only set this when the app runs on Vercel (VERCEL=1): there the
   * edge network sets the header itself, elsewhere any client could send it.
   */
  trustVercelHeader?: boolean
}

/**
 * Client address for rate limiting and the hashed page view IP.
 *
 * Order: x-vercel-forwarded-for (only on Vercel), x-real-ip, then the LAST x-forwarded-for entry.
 * The first x-forwarded-for entry is whatever the client wrote into the header and can be forged
 * freely; the last one is added by the proxy closest to the app. Vercel overwrites
 * x-forwarded-for and sets x-vercel-forwarded-for and x-real-ip to the same client address
 * (https://vercel.com/docs/headers/request-headers). Behind a different reverse proxy, that proxy
 * has to set or overwrite x-real-ip / x-forwarded-for, otherwise no header is trustworthy.
 * Values are normalized (see normalizeIp) and length-limited; without a usable value every
 * client shares the "unknown" bucket.
 */
export function getClientIp(headers: HeaderReader, options: ClientIpOptions = {}): string {
  return (
    (options.trustVercelHeader ? lastIpInHeader(headers, "x-vercel-forwarded-for") : null) ??
    lastIpInHeader(headers, "x-real-ip") ??
    lastIpInHeader(headers, "x-forwarded-for") ??
    "unknown"
  )
}

/**
 * Rate limit bucket for a normalized address. IPv6 clients usually get a whole /64 and can rotate
 * through it freely, so all addresses of one /64 share a bucket; IPv4 stays per address.
 */
export function rateLimitKey(ip: string): string {
  if (!ip.includes(":")) {
    return ip
  }

  return `${ip.split(":").slice(0, 4).join(":")}::/64`
}

/** Minimum gap between two "store unavailable" log lines of one instance. */
export const STORE_ERROR_LOG_INTERVAL_MS = 60_000

export interface LogThrottle {
  /**
   * Returns how many events were suppressed since the last logged one when this event should be
   * logged, or null when it falls inside the quiet interval.
   */
  take(now?: number): number | null
}

/** Lets one event through per interval and counts the ones it swallows in between. */
export function createLogThrottle(intervalMs = STORE_ERROR_LOG_INTERVAL_MS): LogThrottle {
  let lastLoggedAt: number | null = null
  let suppressed = 0

  return {
    take(now = Date.now()) {
      if (lastLoggedAt !== null && now - lastLoggedAt < intervalMs) {
        suppressed += 1
        return null
      }

      const skipped = suppressed
      lastLoggedAt = now
      suppressed = 0
      return skipped
    },
  }
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

export function createMemoryRateLimiter(
  maxKeys = MEMORY_RATE_LIMIT_MAX_KEYS,
  sweepIntervalMs = MEMORY_RATE_LIMIT_SWEEP_INTERVAL_MS,
): MemoryRateLimiter {
  const windows = new Map<string, WindowEntry>()
  let lastSweep = Number.NEGATIVE_INFINITY

  function makeRoom(now: number) {
    // Expired windows are swept at most once per interval, not on every new key.
    if (now - lastSweep >= sweepIntervalMs) {
      lastSweep = now

      for (const [key, entry] of windows) {
        if (entry.resetAt <= now) {
          windows.delete(key)
        }
      }
    }

    // Map keeps insertion order and renewed windows are re-inserted, so the first key is the
    // window that started longest ago. Only as many entries as needed are dropped, never all.
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
