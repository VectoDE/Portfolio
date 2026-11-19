// Pure registration decision behind POST /api/register. Kept free of imports so the unit
// tests can load it without Next.js, NextAuth or Prisma.

export type RegistrationDecision =
  | { outcome: "create"; admin: boolean }
  | { outcome: "closed" }
  | { outcome: "bootstrap-not-configured" }
  | { outcome: "bootstrap-email-mismatch" }

export interface RegistrationInput {
  /** Number of accounts that already exist. */
  existingUsers: number
  /** ALLOW_REGISTRATION === "true". */
  registrationEnabled: boolean
  /** Email address submitted by the client. */
  email: string
  /** Raw value of ADMIN_BOOTSTRAP_EMAIL. */
  bootstrapEmail: string | undefined
}

export function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : ""
}

/**
 * Decides whether an account may be created and whether it becomes the admin.
 *
 * - With no accounts yet, only the address in ADMIN_BOOTSTRAP_EMAIL may register; that account
 *   becomes the admin. A missing or empty ADMIN_BOOTSTRAP_EMAIL keeps the first registration
 *   closed (fail closed), so a fresh public instance cannot be claimed by whoever comes first.
 * - With existing accounts, ALLOW_REGISTRATION alone decides; new accounts are never admins.
 */
export function decideRegistration(input: RegistrationInput): RegistrationDecision {
  if (input.existingUsers > 0) {
    return input.registrationEnabled ? { outcome: "create", admin: false } : { outcome: "closed" }
  }

  const expected = normalizeEmail(input.bootstrapEmail)

  if (!expected) {
    return { outcome: "bootstrap-not-configured" }
  }

  if (normalizeEmail(input.email) !== expected) {
    return { outcome: "bootstrap-email-mismatch" }
  }

  return { outcome: "create", admin: true }
}
