import type { PrismaClient as PrismaClientType } from "@prisma/client"

import { registerPrismaRealtime } from "@/lib/realtime-events"

type PrismaClientConstructor = new (...args: unknown[]) => PrismaClientType

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClientType }

const stubWarning =
  "Prisma Client is unavailable in this environment. Run `pnpm prisma generate` and ensure binaries are accessible."
let stubNoticeLogged = false

function notifyStubUsage() {
  if (!stubNoticeLogged && process.env.NODE_ENV !== "production") {
    console.warn(stubWarning)
    stubNoticeLogged = true
  }
}

function createStubClient(): PrismaClientType {
  const asyncError = async () => {
    notifyStubUsage()
    throw new Error(stubWarning)
  }

  const syncError = () => {
    notifyStubUsage()
    throw new Error(stubWarning)
  }

  const readFallbacks: Record<string, () => Promise<unknown>> = {
    findMany: async () => {
      notifyStubUsage()
      return []
    },
    findFirst: async () => {
      notifyStubUsage()
      return null
    },
    findUnique: async () => {
      notifyStubUsage()
      return null
    },
    count: async () => {
      notifyStubUsage()
      return 0
    },
    aggregate: async () => {
      notifyStubUsage()
      return {}
    },
    groupBy: async () => {
      notifyStubUsage()
      return []
    },
  }

  const createModelProxy = () =>
    new Proxy(
      {},
      {
        get(_, property) {
          if (typeof property !== "string") {
            return asyncError
          }

          const fallback = readFallbacks[property]
          return fallback ?? asyncError
        },
      },
    )

  const base = {
    $connect: asyncError,
    $disconnect: asyncError,
    $use: syncError,
    $on: syncError,
    $transaction: asyncError,
  } as Record<string, unknown>

  return new Proxy(base, {
    get(target, property) {
      if (property in target) {
        return target[property as keyof typeof target]
      }

      return createModelProxy()
    },
  }) as PrismaClientType
}

let PrismaClientCtor: PrismaClientConstructor | undefined

try {
  PrismaClientCtor = require("@prisma/client").PrismaClient as PrismaClientConstructor
} catch (error) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "Prisma Client could not be loaded. Run `pnpm prisma generate` to enable database access. Falling back to a stub client.",
    )
    console.warn(error)
  }
}

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL)
const shouldUseStub = !PrismaClientCtor || !hasDatabaseUrl

const prisma =
  globalForPrisma.prisma ||
  (shouldUseStub
    ? createStubClient()
    : new PrismaClientCtor!({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      }))

if (!shouldUseStub) {
  registerPrismaRealtime(prisma as PrismaClientType)
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

export { prisma }
export default prisma
