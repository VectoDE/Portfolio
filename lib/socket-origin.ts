// Allowed Socket.IO origin, kept free of imports so the unit tests can load it without
// dependencies.

/**
 * Allowed CORS origin from NEXT_PUBLIC_SITE_URL. Browsers send the Origin header without a path
 * or trailing slash, so "https://example.com/" would never match; new URL().origin turns any
 * configured URL into exactly that form. A missing or unparseable value means same-origin only
 * (false), never "*".
 */
export function getAllowedOrigin(
  siteUrl: string | undefined,
  warn: (message: string) => void = console.warn,
): string | false {
  const value = siteUrl?.trim()

  if (!value) {
    return false
  }

  try {
    const { origin } = new URL(value)

    return origin === "null" ? false : origin
  } catch {
    warn("NEXT_PUBLIC_SITE_URL is not a valid URL; Socket.IO allows same-origin clients only.")
    return false
  }
}
