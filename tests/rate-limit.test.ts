import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  createLogThrottle,
  createMemoryRateLimiter,
  evaluateWindow,
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
