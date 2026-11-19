import type { Session } from "next-auth"
// Einzige erlaubte Stelle für getServerSession, siehe eslint.config.mjs (no-restricted-imports).
// eslint-disable-next-line no-restricted-imports
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { readSecret, reportMissingSecret } from "@/lib/env"

/**
 * Wird geworfen, wenn kein gültiges Auth-Secret konfiguriert ist.
 * Die Meldung enthält bewusst weder den Wert noch den Namen der Variablen.
 */
export class AuthConfigurationError extends Error {
  constructor() {
    super("Authentication is not configured.")
    this.name = "AuthConfigurationError"
  }
}

/**
 * Liefert die aktuelle Session. Ersetzt jeden direkten Aufruf von `getServerSession`.
 *
 * next-auth liest das Secret sonst selbst aus `process.env`, sobald `authOptions.secret`
 * leer ist, und würde dann auch ein nur aus Leerzeichen bestehendes Secret akzeptieren.
 * Deshalb wird vorher geprüft und mit dem geprüften Wert gearbeitet (fail closed).
 */
export async function getAppSession(): Promise<Session | null> {
  const secret = readSecret("NEXTAUTH_SECRET")

  if (!secret) {
    reportMissingSecret("NEXTAUTH_SECRET")
    throw new AuthConfigurationError()
  }

  return getServerSession({ ...authOptions, secret })
}
