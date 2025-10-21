import { NextResponse } from "next/server"

import logger from "@/lib/logger"

const ALLOWED_LEVELS = ["error", "info", "debug"] as const
type LogLevel = (typeof ALLOWED_LEVELS)[number]

function isLogLevel(value: string): value is LogLevel {
    return (ALLOWED_LEVELS as readonly string[]).includes(value)
}

export async function POST(req: Request) {
    try {
        const { level, message } = await req.json()

        if (!level || !message) {
            return NextResponse.json({ message: "Missing level or message" }, { status: 400 })
        }

        if (isLogLevel(level)) {
            logger[level](message)
            logger.info(`Client log (${level}): ${message}`)
        } else {
            logger.info(`Client log (unknown level): ${message}`)
        }

        return NextResponse.json({ message: "Log recorded" }, { status: 200 })
    } catch (error) {
        console.error("Logger API error:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
