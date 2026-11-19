import IORedis from "ioredis"
import { NextResponse } from "next/server"

import {
  createMemoryRateLimiter,
  evaluateWindow,
  getClientIp,
  type RateLimitPolicy,
  type RateLimitResult,
} from "@/lib/rate-limit"
import { getRedisUrl } from "@/lib/redis"

const globalForRateLimit = globalThis as unknown as {
  rateLimitMemory?: ReturnType<typeof createMemoryRateLimiter>
  rateLimitRedis?: IORedis
}

function getMemoryLimiter() {
  globalForRateLimit.rateLimitMemory ??= createMemoryRateLimiter()

  return globalForRateLimit.rateLimitMemory
}

/**
 * Redis is only used when REDIS_URL is set explicitly. The connection fails fast instead of
 * queueing commands, so an unreachable Redis falls back to the in-memory limiter rather than
 * stalling the request.
 */
function getRedis(): IORedis | null {
  if (!process.env.REDIS_URL) {
    return null
  }

  if (!globalForRateLimit.rateLimitRedis) {
    const redis = new IORedis(getRedisUrl(), {
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 2_000,
    })

    // Connection errors surface as rejected commands in checkRateLimit; without a listener
    // ioredis would report every reconnect attempt as an unhandled error event.
    redis.on("error", () => {})
    globalForRateLimit.rateLimitRedis = redis
  }

  return globalForRateLimit.rateLimitRedis
}

async function hitRedis(
  redis: IORedis,
  key: string,
  policy: RateLimitPolicy,
): Promise<RateLimitResult> {
  const storageKey = `ratelimit:${policy.name}:${key}`
  const count = await redis.incr(storageKey)

  if (count === 1) {
    await redis.pexpire(storageKey, policy.windowMs)
  }

  let ttl = await redis.pttl(storageKey)

  // A key without expiry would block the client forever, so repair it.
  if (ttl < 0) {
    await redis.pexpire(storageKey, policy.windowMs)
    ttl = policy.windowMs
  }

  return evaluateWindow(count, policy.limit, ttl)
}

export async function checkRateLimit(
  req: Request,
  policy: RateLimitPolicy,
): Promise<RateLimitResult> {
  const key = getClientIp(req.headers)
  const redis = getRedis()

  if (redis) {
    try {
      return await hitRedis(redis, key, policy)
    } catch (error) {
      console.error("Rate limit store unavailable, using in-memory fallback:", error)
    }
  }

  return getMemoryLimiter().hit(key, policy)
}

export function rateLimitExceeded(result: RateLimitResult) {
  return NextResponse.json(
    { error: "Too many requests" },
    {
      status: 429,
      headers: { "Retry-After": String(result.retryAfterSeconds) },
    },
  )
}
