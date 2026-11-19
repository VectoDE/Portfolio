import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  createLogThrottle,
  createMemoryRateLimiter,
  evaluateWindow,
  MEMORY_RATE_LIMIT_SWEEP_INTERVAL_MS,
  RATE_LIMIT_REDIS_OPTIONS,
  getClientIp,
  MAX_IP_HEADER_LENGTH,
  normalizeIp,
  rateLimitKey,
  type RateLimitPolicy,
} from "../lib/rate-limit.ts"

const policy: RateLimitPolicy = { name: "test", limit: 3, windowMs: 60_000 }

function headers(values: Record<string, string>) {
  return { get: (name: string) => values[name] ?? null }
}

describe("getClientIp", () => {
  const vercel = { trustVercelHeader: true }

  it("prefers x-vercel-forwarded-for on Vercel", () => {
    const ip = getClientIp(
      headers({
        "x-vercel-forwarded-for": "203.0.113.7",
        "x-real-ip": "198.51.100.2",
        "x-forwarded-for": "192.0.2.9",
      }),
      vercel,
    )

    assert.equal(ip, "203.0.113.7")
  })

  it("ignores x-vercel-forwarded-for when not running on Vercel", () => {
    const values = { "x-vercel-forwarded-for": "203.0.113.7", "x-real-ip": "198.51.100.2" }

    assert.equal(getClientIp(headers(values)), "198.51.100.2")
  })

  it("falls back to x-real-ip, then to the last x-forwarded-for entry", () => {
    assert.equal(getClientIp(headers({ "x-real-ip": " 198.51.100.2 " }), vercel), "198.51.100.2")
    assert.equal(
      getClientIp(headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1, 203.0.113.7" }), vercel),
      "203.0.113.7",
    )
  })

  it("cannot be steered by a forged first x-forwarded-for entry", () => {
    const forged = ["1.1.1.1", "2.2.2.2", "3.3.3.3"].map((spoofed) =>
      getClientIp(headers({ "x-forwarded-for": `${spoofed}, 203.0.113.7` })),
    )

    assert.deepEqual(forged, ["203.0.113.7", "203.0.113.7", "203.0.113.7"])
  })

  it("skips invalid entries and falls back to a shared bucket", () => {
    assert.equal(getClientIp(headers({ "x-forwarded-for": "203.0.113.7, garbage" })), "203.0.113.7")
    assert.equal(
      getClientIp(headers({ "x-real-ip": "not-an-ip", "x-forwarded-for": "192.0.2.1" })),
      "192.0.2.1",
    )
    assert.equal(getClientIp(headers({ "x-forwarded-for": " , " })), "unknown")
    assert.equal(getClientIp(headers({})), "unknown")
  })

  it("ignores overlong header values", () => {
    const long = `${"9.9.9.9, ".repeat(MAX_IP_HEADER_LENGTH)}203.0.113.7`

    assert.equal(getClientIp(headers({ "x-forwarded-for": long })), "unknown")
  })
})

describe("normalizeIp", () => {
  it("strips ports, brackets and zone ids", () => {
    assert.equal(normalizeIp("192.0.2.1:8080"), "192.0.2.1")
    assert.equal(normalizeIp("[2001:db8::1]:443"), "2001:db8:0:0:0:0:0:1")
    assert.equal(normalizeIp("[2001:db8::1]"), "2001:db8:0:0:0:0:0:1")
    assert.equal(normalizeIp("fe80::1%eth0"), "fe80:0:0:0:0:0:0:1")
  })

  it("writes every IPv6 spelling of one address the same way", () => {
    const spellings = ["2001:DB8::1", "2001:0db8:0000:0000:0000:0000:0000:0001", "2001:db8:0::0:1"]

    assert.deepEqual(new Set(spellings.map(normalizeIp)), new Set(["2001:db8:0:0:0:0:0:1"]))
  })

  it("turns IPv4-mapped IPv6 into plain IPv4", () => {
    assert.equal(normalizeIp("::ffff:192.0.2.1"), "192.0.2.1")
    assert.equal(normalizeIp("::ffff:c000:201"), "192.0.2.1")
  })

  it("rejects anything that is not an IP address", () => {
    const invalid = [
      "",
      "unknown",
      "256.1.1.1",
      "1.2.3",
      "1.2.3.4.5",
      "1:2:3:4:5:6:7:8:9",
      "1::2::3",
      "g::1",
      "x".repeat(100),
    ]

    for (const value of invalid) {
      assert.equal(normalizeIp(value), null, value)
    }
  })
})

describe("rateLimitKey", () => {
  it("keeps IPv4 per address and groups IPv6 by /64", () => {
    assert.equal(rateLimitKey("192.0.2.1"), "192.0.2.1")
    assert.equal(rateLimitKey("2001:db8:1:2:aaaa:0:0:1"), "2001:db8:1:2::/64")
    assert.equal(rateLimitKey("2001:db8:1:2:bbbb:0:0:2"), "2001:db8:1:2::/64")
    assert.equal(rateLimitKey("unknown"), "unknown")
  })
})

describe("createLogThrottle", () => {
  it("logs at most once per interval and reports what it swallowed", () => {
    const throttle = createLogThrottle(60_000)

    assert.equal(throttle.take(0), 0)
    assert.equal(throttle.take(1_000), null)
    assert.equal(throttle.take(59_999), null)
    assert.equal(throttle.take(60_000), 2)
    assert.equal(throttle.take(60_001), null)
    assert.equal(throttle.take(200_000), 1)
  })
})

describe("evaluateWindow", () => {
  it("allows up to the limit and rounds Retry-After up to whole seconds", () => {
    assert.deepEqual(evaluateWindow(3, 3, 1_500), {
      allowed: true,
      remaining: 0,
      retryAfterSeconds: 2,
    })
    assert.equal(evaluateWindow(4, 3, 1_500).allowed, false)
    assert.equal(evaluateWindow(4, 3, 0).retryAfterSeconds, 1)
  })
})

describe("createMemoryRateLimiter", () => {
  it("blocks requests over the limit within one window", () => {
    const limiter = createMemoryRateLimiter()
    const start = 1_000_000

    assert.equal(limiter.hit("a", policy, start).allowed, true)
    assert.equal(limiter.hit("a", policy, start + 1).allowed, true)
    assert.equal(limiter.hit("a", policy, start + 2).allowed, true)

    const blocked = limiter.hit("a", policy, start + 30_000)
    assert.equal(blocked.allowed, false)
    assert.equal(blocked.retryAfterSeconds, 30)
  })

  it("counts clients and policies separately", () => {
    const limiter = createMemoryRateLimiter()
    const other: RateLimitPolicy = { ...policy, name: "other" }

    for (let i = 0; i < 3; i++) {
      limiter.hit("a", policy, 0)
    }

    assert.equal(limiter.hit("a", policy, 0).allowed, false)
    assert.equal(limiter.hit("b", policy, 0).allowed, true)
    assert.equal(limiter.hit("a", other, 0).allowed, true)
  })

  it("starts a new window after the old one expires", () => {
    const limiter = createMemoryRateLimiter()

    for (let i = 0; i < 4; i++) {
      limiter.hit("a", policy, 0)
    }

    assert.equal(limiter.hit("a", policy, policy.windowMs).allowed, true)
  })

  it("never tracks more keys than the configured maximum", () => {
    const limiter = createMemoryRateLimiter(5)

    for (let i = 0; i < 50; i++) {
      limiter.hit(`client-${i}`, policy, 0)
    }

    assert.ok(limiter.size <= 5)
    // The newest client is still tracked after eviction.
    assert.equal(limiter.hit("client-49", policy, 0).remaining, 1)
  })

  it("drops expired windows before evicting active ones", () => {
    const limiter = createMemoryRateLimiter(2)

    limiter.hit("old", policy, 0)
    limiter.hit("active", policy, 50_000)
    limiter.hit("new", policy, 70_000)

    assert.equal(limiter.size, 2)
    assert.equal(limiter.hit("active", policy, 70_000).remaining, 1)
  })
})

describe("createMemoryRateLimiter when full", () => {
  it("drops only the oldest window and keeps the counts of active clients", () => {
    const limiter = createMemoryRateLimiter(3)

    limiter.hit("a", policy, 0)
    limiter.hit("b", policy, 1)
    limiter.hit("c", policy, 2)
    limiter.hit("c", policy, 3)
    limiter.hit("c", policy, 4)

    limiter.hit("d", policy, 5)

    assert.equal(limiter.size, 3)
    // "c" kept its window: the fourth hit is over the limit of three.
    assert.equal(limiter.hit("c", policy, 6).allowed, false)
    // "b" kept its window: second hit, remaining 1.
    assert.equal(limiter.hit("b", policy, 7).remaining, 1)
  })

  it("sweeps expired windows at most once per interval", () => {
    const limiter = createMemoryRateLimiter(3, 1_000)
    const short: RateLimitPolicy = { name: "short", limit: 5, windowMs: 10 }

    limiter.hit("x", short, 0)
    limiter.hit("y", short, 0)
    limiter.hit("z", policy, 0)

    // First insert on a full map sweeps: x and y have expired, z stays.
    limiter.hit("n1", policy, 20)
    assert.equal(limiter.size, 2)

    limiter.hit("e1", short, 21)
    // Full again within the interval: no sweep, only the oldest entry (z) is dropped,
    // although e1 has expired by then.
    limiter.hit("n2", policy, 40)
    assert.equal(limiter.size, 3)
    assert.equal(limiter.hit("z", policy, 41).remaining, policy.limit - 1)
  })

  it("keeps the sweep interval positive and within one minute", () => {
    assert.ok(MEMORY_RATE_LIMIT_SWEEP_INTERVAL_MS > 0)
    assert.ok(MEMORY_RATE_LIMIT_SWEEP_INTERVAL_MS <= 60_000)
  })
})

describe("RATE_LIMIT_REDIS_OPTIONS", () => {
  it("fails fast and bounds every command", () => {
    assert.equal(RATE_LIMIT_REDIS_OPTIONS.enableOfflineQueue, false)
    assert.equal(RATE_LIMIT_REDIS_OPTIONS.maxRetriesPerRequest, 1)
    assert.ok(RATE_LIMIT_REDIS_OPTIONS.connectTimeout > 0)
    assert.ok(RATE_LIMIT_REDIS_OPTIONS.commandTimeout > 0 && RATE_LIMIT_REDIS_OPTIONS.commandTimeout <= 1_000)
  })
})
