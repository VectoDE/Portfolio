// The rule itself lives in password-policy.mjs so that prisma/seed.mjs can use it without a
// TypeScript loader. Keep it there; this file only re-exports it.

export {
  PASSWORD_MAX_BYTES,
  PASSWORD_MIN_LENGTH,
  PASSWORD_TOO_LONG_MESSAGE,
  PASSWORD_TOO_SHORT_MESSAGE,
  validatePassword,
} from "./password-policy.mjs"
