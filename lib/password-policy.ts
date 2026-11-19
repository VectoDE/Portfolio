// Shared password rule for registration and password changes. Kept free of imports so the
// unit tests can load it without dependencies.

export const PASSWORD_MIN_LENGTH = 8

export const PASSWORD_TOO_SHORT_MESSAGE = "Password must be at least 8 characters long"

/** Returns an error message for an unacceptable password, or null when it passes. */
export function validatePassword(password: unknown): string | null {
  if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) {
    return PASSWORD_TOO_SHORT_MESSAGE
  }

  return null
}
