// Pure helpers for the server logger and the client log endpoint. Kept free of imports so the
// unit tests can load them without dependencies.

const SERVERLESS_ENV_KEYS = ["VERCEL", "NETLIFY", "AWS_LAMBDA_FUNCTION_NAME"] as const

export const CLIENT_LOG_MAX_LENGTH = 1000

/** Largest request body /api/logger reads; larger bodies get 413 without being parsed. */
export const CLIENT_LOG_MAX_BODY_BYTES = 4 * 1024

// Control (Cc), format (Cf: bidi overrides, zero-width characters, BOM) and line/paragraph
// separators (Zl, Zp). Cc covers CR, LF, VT, FF, ESC and U+0085.
// Built with the constructor: tsconfig targets ES6, and TypeScript rejects \p{} in regex
// literals below ES2018. Node supports it at run time.
const UNSAFE_LOG_CHARACTERS = new RegExp("[\\p{Cc}\\p{Cf}\\p{Zl}\\p{Zp}]", "gu")

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
 * Client log messages are untrusted. Control and format characters (including CR, LF, bidi
 * overrides and zero-width characters) are replaced so a message can neither forge additional
 * log lines (CWE-117) nor hide or reorder text, and the length is capped without splitting a
 * surrogate pair.
 * Returns null when the value is not a non-empty string.
 */
export function sanitizeClientLogMessage(value: unknown): string | null {
  if (typeof value !== "string") {
    return null
  }

  const cleaned = value.replace(UNSAFE_LOG_CHARACTERS, " ").trim()

  if (!cleaned) {
    return null
  }

  if (cleaned.length <= CLIENT_LOG_MAX_LENGTH) {
    return cleaned
  }

  let cut = cleaned.slice(0, CLIENT_LOG_MAX_LENGTH)
  const last = cut.charCodeAt(cut.length - 1)

  // Do not leave half of a surrogate pair (e.g. an emoji) at the end.
  if (last >= 0xd800 && last <= 0xdbff) {
    cut = cut.slice(0, -1)
  }

  return `${cut}…`
}
