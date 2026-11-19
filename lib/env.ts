/**
 * Zugriff auf geheime Konfigurationswerte ohne Fallback (fail closed).
 *
 * Die Prüfung läuft bewusst erst beim Aufruf und nicht beim Import des Moduls,
 * damit `next build` beim Sammeln der Seiten nicht an fehlenden Laufzeitwerten scheitert.
 */

export type RequiredSecretName = "NEXTAUTH_SECRET" | "IP_HASH_SALT"

export class MissingSecretError extends Error {
  readonly variable: RequiredSecretName

  constructor(variable: RequiredSecretName) {
    super(
      `Die Umgebungsvariable ${variable} ist nicht gesetzt. ` +
        "Ohne diesen Wert verweigert die Anwendung den Dienst (kein Fallback). " +
        "Siehe .env.example und README, Abschnitt Umgebungsvariablen.",
    )
    this.name = "MissingSecretError"
    this.variable = variable
  }
}

/** Liefert den Wert oder `undefined`, wenn er fehlt oder nur aus Leerzeichen besteht. */
export function readSecret(variable: RequiredSecretName): string | undefined {
  const value = process.env[variable]
  return value && value.trim().length > 0 ? value : undefined
}

/** Liefert den Wert oder wirft einen `MissingSecretError`. */
export function requireSecret(variable: RequiredSecretName): string {
  const value = readSecret(variable)
  if (!value) {
    throw new MissingSecretError(variable)
  }
  return value
}

const reportedMissing = new Set<RequiredSecretName>()

/** Meldet einen fehlenden Wert einmal pro Prozess im Server-Log. */
export function reportMissingSecret(variable: RequiredSecretName): void {
  if (reportedMissing.has(variable)) {
    return
  }
  reportedMissing.add(variable)
  console.error(`[config] ${new MissingSecretError(variable).message}`)
}
