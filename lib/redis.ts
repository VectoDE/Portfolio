import IORedis from "ioredis"

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379"

const baseOptions = {
  maxRetriesPerRequest: null as number | null,
  enableReadyCheck: true,
}

const globalForRedis = globalThis as unknown as {
  redisConnection?: IORedis
}

export function createRedisConnection() {
  return new IORedis(redisUrl, baseOptions)
}

export function getRedisConnection() {
  if (!globalForRedis.redisConnection) {
    globalForRedis.redisConnection = createRedisConnection()
  }

  return globalForRedis.redisConnection
}

export function getRedisUrl() {
  return redisUrl
}
