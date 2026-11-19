// Pure registration decision behind POST /api/register. Only imports other dependency-free
// modules (with the .ts extension), so the unit tests can load it without Next.js, NextAuth or
// Prisma.

import { createHash, timingSafeEqual } from "node:crypto"

import { validatePassword } from "./password-policy.ts"

/** Shortest ADMIN_BOOTSTRAP_TOKEN that is accepted; shorter values keep the instance closed. */
export const BOOTSTRAP_TOKEN_MIN_LENGTH = 32

/** Body field of POST /api/register that carries the bootstrap token. */
export const BOOTSTRAP_TOKEN_FIELD = "bootstrapToken"

export type RegistrationDecision =
  | { outcome: "create"; admin: boolean }
  | { outcome: "closed" }
  | { outcome: "bootstrap-not-configured" }
  | { outcome: "bootstrap-email-mismatch" }
  | { outcome: "bootstrap-token-mismatch" }

export interface RegistrationInput {
  /** Number of accounts that already exist. */
  existingUsers: number
  /** ALLOW_REGISTRATION === "true". */
  registrationEnabled: boolean
  /** Email address submitted by the client. */
  email: string
  /** Raw value of ADMIN_BOOTSTRAP_EMAIL. */
  bootstrapEmail: string | undefined
  /** Raw value of ADMIN_BOOTSTRAP_TOKEN. Missing means not configured (fail closed). */
  bootstrapToken?: string | undefined
  /** Token submitted by the client in the bootstrapToken body field. */
  providedToken?: unknown
}

export function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : ""
}

function normalizeToken(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function sha256(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest()
}

/**
 * Compares the submitted token with the configured one in constant time. Hashing both values
 * gives equal-length buffers, as timingSafeEqual requires, so neither the content nor the length
 * of the configured token leaks through the response time.
 */
export function bootstrapTokenMatches(provided: unknown, expected: string): boolean {
  const candidate = normalizeToken(provided)
  const equal = timingSafeEqual(sha256(candidate), sha256(expected))

  return equal && candidate.length > 0
}

/** Reads the bootstrap token from a parsed JSON body; anything but a string counts as missing. */
export function bootstrapTokenFromBody(body: unknown): unknown {
  return field(body, BOOTSTRAP_TOKEN_FIELD)
}

/**
 * Decides whether an account may be created and whether it becomes the admin.
 *
 * - With no accounts yet, the first account needs both the address in ADMIN_BOOTSTRAP_EMAIL and
 *   the secret in ADMIN_BOOTSTRAP_TOKEN (at least BOOTSTRAP_TOKEN_MIN_LENGTH characters); that
 *   account becomes the admin. The address alone is guessable, the token is not. A missing
 *   address or a missing or too short token keeps the first registration closed (fail closed),
 *   so a fresh public instance cannot be claimed by whoever comes first.
 * - With existing accounts, ALLOW_REGISTRATION alone decides and the bootstrap values have no
 *   effect any more; new accounts are never admins.
 */
export function decideRegistration(input: RegistrationInput): RegistrationDecision {
  if (input.existingUsers > 0) {
    return input.registrationEnabled ? { outcome: "create", admin: false } : { outcome: "closed" }
  }

  const expectedEmail = normalizeEmail(input.bootstrapEmail)
  const expectedToken = normalizeToken(input.bootstrapToken)

  if (!expectedEmail || expectedToken.length < BOOTSTRAP_TOKEN_MIN_LENGTH) {
    return { outcome: "bootstrap-not-configured" }
  }

  // Both checks always run, so the response time does not show which of the two failed.
  const emailMatches = normalizeEmail(input.email) === expectedEmail
  const tokenMatches = bootstrapTokenMatches(input.providedToken, expectedToken)

  if (!emailMatches) {
    return { outcome: "bootstrap-email-mismatch" }
  }

  if (!tokenMatches) {
    return { outcome: "bootstrap-token-mismatch" }
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
  /** Raw value of ADMIN_BOOTSTRAP_TOKEN. */
  bootstrapToken?: string | undefined
  /** Parsed JSON body, or undefined when the body was not valid JSON. */
  body: unknown
}

function field(body: unknown, key: string): unknown {
  return typeof body === "object" && body !== null ? (body as Record<string, unknown>)[key] : undefined
}

/**
 * Checks a registration request before anything is written.
 *
 * On an empty database the bootstrap address and token are checked first: every request without
 * both, including broken JSON and missing fields, is refused like a closed registration. Only
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
    bootstrapToken: input.bootstrapToken,
    providedToken: bootstrapTokenFromBody(input.body),
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

  // Same rule as password changes (lib/password-policy.ts). It runs only here, after the
  // bootstrap address and token matched, so on an empty or closed instance a weak or overlong password
  // still gets the generic 403 like every other request.
  const passwordError = validatePassword(password)

  if (passwordError) {
    return { outcome: "invalid", error: passwordError }
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
