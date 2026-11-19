// Picks the password for the seeded admin account. Kept free of path aliases so the unit
// tests can load it without dependencies.

import { randomBytes } from "node:crypto"

import { validatePassword } from "./password-policy.ts"

export type SeedPasswordResult =
  | { ok: true; password: string; generated: boolean }
  | { ok: false; error: string }

/**
 * Uses SEED_ADMIN_PASSWORD when set, otherwise generates a random one. A configured password
 * must pass the same rule as registration and password changes (#100), so the seed cannot
 * create an admin with a short password or one that bcrypt would cut off after 72 bytes.
 */
export function resolveSeedAdminPassword(configured: string | undefined): SeedPasswordResult {
  if (!configured) {
    return { ok: true, password: randomBytes(18).toString("base64url"), generated: true }
  }

  const error = validatePassword(configured)

  if (error) {
    return { ok: false, error: `SEED_ADMIN_PASSWORD: ${error}` }
  }

  return { ok: true, password: configured, generated: false }
}
