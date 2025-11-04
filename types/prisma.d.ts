declare module "@prisma/client" {
  export type Prisma = Record<string, unknown>

  export class PrismaClient {
    constructor(...args: unknown[])
    $connect(): Promise<void>
    $disconnect(): Promise<void>
    $use(...args: unknown[]): void
    [key: string]: unknown
  }
}
