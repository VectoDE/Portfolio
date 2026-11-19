// Pure helpers for the server logger and the client log endpoint. Kept free of imports so the
// unit tests can load them without dependencies.

const SERVERLESS_ENV_KEYS = ["VERCEL", "NETLIFY", "AWS_LAMBDA_FUNCTION_NAME"] as const

export const CLIENT_LOG_MAX_LENGTH = 1000

/**
 * Serverless platforms only allow writes below /tmp. Creating file transports there throws
 * while the module loads, which turned every request to /api/logger into an empty 500 (#103).
 * LOG_TO_FILE=false switches file logs off everywhere, LOG_TO_FILE=true forces them on.
 */
export function shouldUseFileLogs(env: Record<string, string | undefined>): boolean {
  if (env.LOG_TO_FILE === "false") {
    return false
  }

  if (env.LOG_TO_FILE === "true") {
    return true
  }

  return !SERVERLESS_ENV_KEYS.some(key => Boolean(env[key]))
}

/**
 * Client log messages are untrusted. Control characters (including CR and LF) are replaced so
 * a message cannot forge additional log lines (CWE-117), and the length is capped.
 * Returns null when the value is not a non-empty string.
 */
export function sanitizeClientLogMessage(value: unknown): string | null {
  if (typeof value !== "string") {
    return null
  }

  // eslint-disable-next-line no-control-regex
  const cleaned = value.replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/g, " ").trim()

  if (!cleaned) {
    return null
  }

  return cleaned.length > CLIENT_LOG_MAX_LENGTH ? `${cleaned.slice(0, CLIENT_LOG_MAX_LENGTH)}…` : cleaned
}
