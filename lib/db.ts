import type { PrismaClient as PrismaClientType } from "@prisma/client"

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

    const createStubResponse = <T>(value: T) => {
        notifyStubUsage()

        if (process.env.NODE_ENV === "production") {
            throw new Error(stubWarning)
        }

        return value
    }

    const readFallbacks: Record<string, () => Promise<unknown>> = {
        findMany: async () => createStubResponse([]),
        findFirst: async () => createStubResponse(null),
        findUnique: async () => createStubResponse(null),
        count: async () => createStubResponse(0),
        aggregate: async () => createStubResponse({}),
        groupBy: async () => createStubResponse([]),
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
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    PrismaClientCtor = require("@prisma/client").PrismaClient as PrismaClientConstructor
} catch (error) {
    if (process.env.NODE_ENV === "production") {
        throw new Error(
            "Prisma Client could not be loaded in production. Ensure `pnpm prisma generate` has been run and the generated client is bundled.",
            { cause: error },
        )
    }

    console.warn(
        "Prisma Client could not be loaded. Run `pnpm prisma generate` to enable database access. Falling back to a stub client.",
    )
    console.warn(error)
}

const prisma =
    globalForPrisma.prisma ||
    (PrismaClientCtor
        ? new PrismaClientCtor({
              log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
          })
        : createStubClient())

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma
}

export { prisma }
export default prisma
