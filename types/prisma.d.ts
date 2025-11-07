declare module "@prisma/client" {
  export type Prisma = Record<string, unknown>

  export type PrismaPromise<T = unknown> = Promise<T>

  export class PrismaClient {
    constructor(...args: unknown[])
    $connect(): PrismaPromise<void>
    $disconnect(): PrismaPromise<void>
    $use(...args: unknown[]): void
    $on(event: string, handler: (...args: unknown[]) => void): void
    $transaction(...args: any[]): Promise<any>
    [key: string]: any
  }
}
