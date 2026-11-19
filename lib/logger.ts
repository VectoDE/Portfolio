import { createLogger, format, transports } from "winston"
import path from "node:path"

import { shouldUseFileLogs } from "@/lib/log-config"

const logDirectory = path.join(process.cwd(), "logs")

type FileTransport = InstanceType<typeof transports.File>

function createFileTransports(): FileTransport[] {
  if (!shouldUseFileLogs(process.env)) {
    return []
  }

  try {
    return [
      new transports.File({ filename: path.join(logDirectory, "error.log"), level: "error" }),
      new transports.File({ filename: path.join(logDirectory, "info.log"), level: "info" }),
      new transports.File({ filename: path.join(logDirectory, "debug.log"), level: "debug" }),
      new transports.File({ filename: path.join(logDirectory, "combined.log") }),
    ]
  } catch (error) {
    // A read-only file system must not break every module that imports the logger (#103).
    console.warn("File logging disabled:", error instanceof Error ? error.message : error)
    return []
  }
}

const fileTransports = createFileTransports()

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`),
  ),
  transports: fileTransports,
})

// File transports report problems such as EACCES or EROFS asynchronously as "error" events.
// Without a listener such an event would crash the process; log a warning instead.
for (const transport of fileTransports) {
  transport.on("error", (error: unknown) => {
    console.warn("File logging failed:", error instanceof Error ? error.message : error)
  })
}

logger.on("error", (error: unknown) => {
  console.warn("Logger error:", error instanceof Error ? error.message : error)
})

if (process.env.NODE_ENV !== "production" || fileTransports.length === 0) {
  logger.add(
    new transports.Console({
      format: format.simple(),
    }),
  )
}

export default logger
