// Site operator for the Impressum (§ 5 DDG) and the privacy policy (controller, Art. 4 No. 7 GDPR).
//
// The details are not stored in the repository. They come from the environment variables
// IMPRESSUM_NAME, IMPRESSUM_STRASSE, IMPRESSUM_PLZ_ORT and IMPRESSUM_EMAIL at build time.
// There is deliberately no phone number; the contact form is the second quick way to get in touch.
// scripts/check-impressum.mjs stops a production build when one of them is missing.

export const IMPRESSUM_KEYS = ["IMPRESSUM_NAME", "IMPRESSUM_STRASSE", "IMPRESSUM_PLZ_ORT", "IMPRESSUM_EMAIL"]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Lists what is missing or invalid, as readable German messages.
 * @param {Record<string, string | undefined>} env
 * @returns {string[]}
 */
export function impressumProblems(env) {
  const problems = IMPRESSUM_KEYS.filter((key) => !env[key]?.trim()).map((key) => `${key} fehlt`)
  const email = env.IMPRESSUM_EMAIL?.trim()
  if (email && !EMAIL_RE.test(email)) problems.push("IMPRESSUM_EMAIL ist keine gültige E-Mail-Adresse")
  return problems
}

/**
 * Reads the operator, or null when any detail is missing, so the pages can show a notice
 * instead of an incomplete Impressum.
 * @param {Record<string, string | undefined>} env
 * @returns {{ name: string, street: string, postalCity: string, country: string, email: string } | null}
 */
export function operatorFromEnv(env) {
  if (impressumProblems(env).length > 0) return null
  return {
    name: env.IMPRESSUM_NAME.trim(),
    street: env.IMPRESSUM_STRASSE.trim(),
    postalCity: env.IMPRESSUM_PLZ_ORT.trim(),
    country: "Deutschland",
    email: env.IMPRESSUM_EMAIL.trim(),
  }
}
