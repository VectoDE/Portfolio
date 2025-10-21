import { createLogger, format, transports } from "winston"
import path from "path"

const logDirectory = path.join(process.cwd(), "logs")

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`),
  ),
  transports: [
    new transports.File({ filename: path.join(logDirectory, "error.log"), level: "error" }),
    new transports.File({ filename: path.join(logDirectory, "info.log"), level: "info" }),
    new transports.File({ filename: path.join(logDirectory, "debug.log"), level: "debug" }),
    new transports.File({ filename: path.join(logDirectory, "combined.log") }),
  ],
})

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.simple(),
    }),
  )
}

export default logger
