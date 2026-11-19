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

export const REGISTRATION_CLOSED_MESSAGE = "Registration is currently closed."
export const REGISTRATION_NOT_COMPLETED_MESSAGE = "Registration could not be completed."
export const REQUEST_TOO_LARGE_MESSAGE = "Request body is too large."

/** True only when accounts exist and ALLOW_REGISTRATION is on, i.e. sign-up is publicly open. */
export function isRegistrationOpen(input: { existingUsers: number; registrationEnabled: boolean }): boolean {
  return input.existingUsers > 0 && input.registrationEnabled
}

/**
 * Response for a body above the size limit. On an empty database and with closed registration it
 * is the same 403 as every other refusal, so the size limit reveals nothing about the instance.
 * Only with open registration, which is observable anyway, does the client get 413.
 */
export function oversizedBodyResponse(input: {
  existingUsers: number
  registrationEnabled: boolean
}): { status: number; message: string } {
  return isRegistrationOpen(input)
    ? { status: 413, message: REQUEST_TOO_LARGE_MESSAGE }
    : { status: 403, message: REGISTRATION_CLOSED_MESSAGE }
}

export type RegistrationRefusal = Exclude<RegistrationDecision, { outcome: "create" }>

export type RegistrationGate =
  | { outcome: "refuse"; decision: RegistrationRefusal }
  | { outcome: "invalid"; error: string }
  | { outcome: "proceed"; email: string; password: string; name: string | null; admin: boolean }

export interface RegistrationRequestInput {
  existingUsers: number
  registrationEnabled: boolean
  bootstrapEmail: string | undefined
  /** Parsed JSON body, or undefined when the body was not valid JSON. */
  body: unknown
}

function field(body: unknown, key: string): unknown {
  return typeof body === "object" && body !== null ? (body as Record<string, unknown>)[key] : undefined
}

/**
 * Checks a registration request before anything is written.
 *
 * On an empty database the bootstrap address is checked first: every request without a matching
 * address, including broken JSON and missing fields, is refused like a closed registration. Only
 * after a match do the usual 400 validations apply, so an empty instance looks the same from
 * outside as one with closed registration.
 */
export function evaluateRegistrationRequest(input: RegistrationRequestInput): RegistrationGate {
  const email = normalizeEmail(field(input.body, "email"))
  const decision = decideRegistration({
    existingUsers: input.existingUsers,
    registrationEnabled: input.registrationEnabled,
    email,
    bootstrapEmail: input.bootstrapEmail,
  })

  if (decision.outcome !== "create") {
    return { outcome: "refuse", decision }
  }

  if (input.body === undefined) {
    return { outcome: "invalid", error: "Invalid request body" }
  }

  const password = field(input.body, "password")

  if (!email || typeof password !== "string" || !password) {
    return { outcome: "invalid", error: "Email and password are required" }
  }

  if (password.length < 8) {
    return { outcome: "invalid", error: "Password must be at least 8 characters long" }
  }

  const name = field(input.body, "name")

  return {
    outcome: "proceed",
    email,
    password,
    name: typeof name === "string" ? name.trim() : null,
    admin: decision.admin,
  }
}

export interface RegistrationFailure {
  status: number
  message: string
  /** Error code for the log, e.g. a Prisma code; never the submitted data. */
  code: string
  reason: string
}

/**
 * Maps an unexpected error from the create step to a response. Prisma P2034 (serialization
 * conflict or deadlock) becomes 409 so the client can retry. P2002 (unique constraint, e.g. a
 * concurrent registration with the same address) becomes the generic closed 403 during the first
 * registration, so an empty instance stays indistinguishable from a closed one; with open
 * registration it becomes 409 "Registration could not be completed.", because a closed message
 * would be wrong there. Without context the safe bootstrap answer is used. The result carries only
 * a code and a short reason for the log, never the error object with its query details.
 */
export function classifyRegistrationError(
  error: unknown,
  context: { openRegistration: boolean } = { openRegistration: false },
): RegistrationFailure {
  const code =
    typeof error === "object" && error !== null && typeof (error as { code?: unknown }).code === "string"
      ? (error as { code: string }).code
      : undefined

  if (code === "P2034") {
    return {
      status: 409,
      message: "Registration could not be completed. Please try again.",
      code,
      reason: "transaction conflict or deadlock",
    }
  }

  if (code === "P2002") {
    return context.openRegistration
      ? {
          status: 409,
          message: REGISTRATION_NOT_COMPLETED_MESSAGE,
          code,
          reason: "unique constraint violation",
        }
      : {
          status: 403,
          message: REGISTRATION_CLOSED_MESSAGE,
          code,
          reason: "unique constraint violation",
        }
  }

  const name = error instanceof Error ? error.name : typeof error

  return {
    status: 500,
    message: "Something went wrong",
    code: code ?? "UNKNOWN",
    reason: name,
  }
}
