import { Queue, Worker } from "bullmq"
import type { JobsOptions } from "bullmq"

import { createRedisConnection, getRedisUrl } from "@/lib/redis"
import { getRealtimeIO } from "@/lib/realtime"

const queueName = "realtime-events"

const globalForQueue = globalThis as unknown as {
  realtimeQueue?: Queue
  realtimeWorker?: Worker
  realtimeQueueConnection?: ReturnType<typeof createRedisConnection>
  realtimeWorkerConnection?: ReturnType<typeof createRedisConnection>
}

function ensureConnections() {
  if (!globalForQueue.realtimeQueueConnection) {
    globalForQueue.realtimeQueueConnection = createRedisConnection()
  }

  if (!globalForQueue.realtimeWorkerConnection) {
    globalForQueue.realtimeWorkerConnection = createRedisConnection()
  }
}

export function getRealtimeQueue() {
  ensureConnections()

  if (!globalForQueue.realtimeQueue) {
    globalForQueue.realtimeQueue = new Queue(queueName, {
      connection: globalForQueue.realtimeQueueConnection,
    })
  }

  return globalForQueue.realtimeQueue
}

function ensureWorker() {
  ensureConnections()

  if (!globalForQueue.realtimeWorker) {
    globalForQueue.realtimeWorker = new Worker(
      queueName,
      async job => {
        const io = getRealtimeIO()

        if (io) {
          io.emit("realtime:event", {
            event: job.name,
            payload: job.data,
            jobId: job.id,
            timestamp: Date.now(),
          })

          io.emit(job.name, job.data)
        }
      },
      { connection: globalForQueue.realtimeWorkerConnection },
    )

    globalForQueue.realtimeWorker.on("error", error => {
      console.error("Realtime worker error", error)
    })
  }
}

export async function enqueueRealtimeEvent(event: string, payload: unknown, options?: JobsOptions) {
  const queue = getRealtimeQueue()
  ensureWorker()

  await queue.add(event, payload, {
    removeOnComplete: { age: 60, count: 1000 },
    removeOnFail: { age: 60 * 60, count: 100 },
    ...options,
  })
}

export function describeRealtimeQueue() {
  return {
    name: queueName,
    redis: getRedisUrl(),
  }
}
