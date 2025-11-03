import type { PrismaClient } from "@prisma/client"

import { enqueueRealtimeEvent } from "@/lib/realtime-queue"

type PrismaMiddleware = Parameters<PrismaClient["$use"]>[0]
type PrismaMiddlewareParams = Parameters<PrismaMiddleware>[0]
type PrismaMiddlewareNext = Parameters<PrismaMiddleware>[1]

const MUTATION_ACTIONS = new Set([
  "create",
  "createMany",
  "update",
  "updateMany",
  "upsert",
  "delete",
  "deleteMany",
])

const globalForRealtime = globalThis as unknown as {
  prismaRealtimeRegistered?: boolean
}

export function registerPrismaRealtime(prisma: PrismaClient) {
  if (globalForRealtime.prismaRealtimeRegistered) {
    return
  }

  const middlewareCapablePrisma = prisma as PrismaClient & {
    $use?: PrismaClient["$use"]
  }

  if (typeof middlewareCapablePrisma.$use !== "function") {
    console.warn("Prisma client does not support middleware; skipping realtime registration")
    globalForRealtime.prismaRealtimeRegistered = true
    return
  }

  const realtimeMiddleware: PrismaMiddleware = async (
    params: PrismaMiddlewareParams,
    next: PrismaMiddlewareNext,
  ) => {
    const result = await next(params)

    if (MUTATION_ACTIONS.has(params.action)) {
      const model = params.model ?? "unknown"

      try {
        const enqueuePromise = enqueueRealtimeEvent(`prisma:${model}:${params.action}`, {
          model,
          action: params.action,
          args: params.args,
          result,
          timestamp: Date.now(),
        })

        void enqueuePromise.catch(error => {
          console.error("Failed to enqueue realtime Prisma event", error)
        })
      } catch (error) {
        console.error("Failed to enqueue realtime Prisma event", error)
      }
    }

    return result
  }

  middlewareCapablePrisma.$use(realtimeMiddleware)

  globalForRealtime.prismaRealtimeRegistered = true
}

export async function broadcastRealtimeEvent(event: string, payload: unknown) {
  try {
    await enqueueRealtimeEvent(event, payload)
  } catch (error) {
    console.error("Failed to enqueue realtime event", error)
  }
}
