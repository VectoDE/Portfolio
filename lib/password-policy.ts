// Shared password rule for registration and password changes. Kept free of imports so the
// unit tests can load it without dependencies.

export const PASSWORD_MIN_LENGTH = 8

/**
 * bcrypt only uses the first 72 bytes of a password and silently ignores the rest, so a longer
 * password would look accepted while only its prefix protects the account. The limit counts
 * UTF-8 bytes, not characters: umlauts take two bytes, many emoji four.
 */
export const PASSWORD_MAX_BYTES = 72

export const PASSWORD_TOO_SHORT_MESSAGE = "Password must be at least 8 characters long"

export const PASSWORD_TOO_LONG_MESSAGE =
  "Password must be at most 72 bytes long (about 72 plain letters or digits, fewer with umlauts or emoji)"

/** Returns an error message for an unacceptable password, or null when it passes. */
export function validatePassword(password: unknown): string | null {
  if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) {
    return PASSWORD_TOO_SHORT_MESSAGE
  }

  if (new TextEncoder().encode(password).length > PASSWORD_MAX_BYTES) {
    return PASSWORD_TOO_LONG_MESSAGE
  }

  return null
}
