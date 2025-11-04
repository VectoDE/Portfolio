declare module "socket.io-client" {
  export interface Socket {
    id: string
    emit(event: string, ...args: unknown[]): void
    on(event: string, listener: (...args: unknown[]) => void): this
    off(event: string, listener: (...args: unknown[]) => void): this
    connect(): void
    disconnect(): void
    broadcast?: {
      emit(event: string, ...args: unknown[]): void
    }
  }

  export interface SocketOptions {
    path?: string
    transports?: string[]
    autoConnect?: boolean
    reconnection?: boolean
    reconnectionDelay?: number
    reconnectionDelayMax?: number
  }

  export function io(opts?: SocketOptions): Socket
  export function io(uri: string, opts?: SocketOptions): Socket
  export { io }
  export default io
}

declare module "socket.io" {
  import type { Server as HTTPServer } from "http"

  export interface ServerOptions {
    path?: string
    cors?: {
      origin?: string | string[]
    }
  }

  export interface BroadcastOperator {
    emit(event: string, ...args: unknown[]): void
  }

  export type DisconnectReason = string

  export interface Socket {
    id: string
    emit(event: string, ...args: unknown[]): void
    on(event: "disconnect", listener: (reason: DisconnectReason) => void): this
    on(event: string, listener: (...args: unknown[]) => void): this
    broadcast: BroadcastOperator
  }

  export class Server {
    constructor(httpServer?: HTTPServer, opts?: ServerOptions)
    emit(event: string, ...args: unknown[]): boolean
    on(event: "connection", listener: (socket: Socket) => void): this
    on(event: string, listener: (...args: unknown[]) => void): this
  }

  export { Server as IOServer }
}

declare module "bullmq" {
  export interface JobsOptions {
    removeOnComplete?: boolean | { age?: number; count?: number }
    removeOnFail?: boolean | { age?: number; count?: number }
    [key: string]: unknown
  }

  export interface QueueOptions {
    connection?: unknown
  }

  export interface WorkerOptions {
    connection?: unknown
  }

  export interface Job<Data = unknown> {
    id?: string | number
    name: string
    data: Data
  }

  export class Queue<Data = unknown, _Result = unknown, Name extends string = string> {
    constructor(name: Name, opts?: QueueOptions)
    add(name: Name, data: Data, opts?: JobsOptions): Promise<Job<Data>>
  }

  export class Worker<Data = unknown, Name extends string = string> {
    constructor(name: Name, processor: (job: Job<Data>) => Promise<unknown>, opts?: WorkerOptions)
    on(event: "error", handler: (error: Error) => void): this
  }
}

declare module "ioredis" {
  export interface RedisOptions {
    [key: string]: unknown
  }

  export default class IORedis {
    constructor(url?: string, options?: RedisOptions)
  }
}
