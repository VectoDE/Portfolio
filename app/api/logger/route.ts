import { NextResponse } from "next/server"

import { sanitizeClientLogMessage } from "@/lib/log-config"
import logger from "@/lib/logger"
import { LOGGER_RATE_LIMIT } from "@/lib/rate-limit"
import { checkRateLimit, rateLimitExceeded } from "@/lib/rate-limit-store"

const ALLOWED_LEVELS = ["error", "info", "debug"] as const
type LogLevel = (typeof ALLOWED_LEVELS)[number]

function isLogLevel(value: unknown): value is LogLevel {
  return typeof value === "string" && (ALLOWED_LEVELS as readonly string[]).includes(value)
}

export async function POST(req: Request) {
  try {
    const rateLimit = await checkRateLimit(req, LOGGER_RATE_LIMIT)

    if (!rateLimit.allowed) {
      return rateLimitExceeded(rateLimit)
    }

    const body: unknown = await req.json().catch(() => null)
    const { level, message } = (body ?? {}) as { level?: unknown; message?: unknown }
    const cleanMessage = sanitizeClientLogMessage(message)

    if (!level || !cleanMessage) {
      return NextResponse.json({ message: "Missing level or message" }, { status: 400 })
    }

    // Client messages are untrusted; they are logged once, sanitized and labelled.
    const targetLevel: LogLevel = isLogLevel(level) ? level : "info"
    const label = isLogLevel(level) ? level : "unknown level"
    logger[targetLevel](`Client log (${label}): ${cleanMessage}`)

    return NextResponse.json({ message: "Log recorded" }, { status: 200 })
  } catch (error) {
    console.error("Logger API error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
