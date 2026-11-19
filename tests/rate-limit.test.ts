import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  createMemoryRateLimiter,
  evaluateWindow,
  getClientIp,
  type RateLimitPolicy,
} from "../lib/rate-limit.ts"

const policy: RateLimitPolicy = { name: "test", limit: 3, windowMs: 60_000 }

function headers(values: Record<string, string>) {
  return { get: (name: string) => values[name] ?? null }
}

describe("getClientIp", () => {
  it("uses the first x-forwarded-for entry", () => {
    const ip = getClientIp(headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }))

    assert.equal(ip, "203.0.113.7")
  })

  it("falls back to x-real-ip, then to a shared bucket", () => {
    assert.equal(getClientIp(headers({ "x-real-ip": " 198.51.100.2 " })), "198.51.100.2")
    assert.equal(getClientIp(headers({ "x-forwarded-for": " , " })), "unknown")
    assert.equal(getClientIp(headers({})), "unknown")
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
