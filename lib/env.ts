/**
 * Zugriff auf geheime Konfigurationswerte ohne Fallback (fail closed).
 *
 * Die Prüfung läuft bewusst erst beim Aufruf und nicht beim Import des Moduls,
 * damit `next build` beim Sammeln der Seiten nicht an fehlenden Laufzeitwerten scheitert.
 */

export type RequiredSecretName = "NEXTAUTH_SECRET" | "IP_HASH_SALT"

function describeVariable(variable: RequiredSecretName): string {
  return variable === "NEXTAUTH_SECRET" ? "NEXTAUTH_SECRET (oder AUTH_SECRET)" : variable
}

export class MissingSecretError extends Error {
  readonly variable: RequiredSecretName

  constructor(variable: RequiredSecretName) {
    super(
      `Die Umgebungsvariable ${describeVariable(variable)} ist nicht gesetzt oder leer. ` +
        "Ohne diesen Wert verweigert die Anwendung den Dienst (kein Fallback). " +
        "Siehe .env.example und README, Abschnitt Umgebungsvariablen.",
    )
    this.name = "MissingSecretError"
    this.variable = variable
  }
}

/**
 * Liest den Rohwert genauso aus wie next-auth 4: `NEXTAUTH_SECRET ?? AUTH_SECRET`.
 * Ist `NEXTAUTH_SECRET` gesetzt (auch leer), gewinnt es, wie in next-auth.
 */
function readRawValue(variable: RequiredSecretName): string | undefined {
  if (variable === "NEXTAUTH_SECRET") {
    return process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET
  }
  return process.env[variable]
}

/**
 * Liefert den Wert oder `undefined`, wenn er fehlt oder nur aus Leerzeichen besteht.
 *
 * Für `NEXTAUTH_SECRET` gilt dieselbe Auflösung wie in next-auth (`AUTH_SECRET` als
 * Rückfall nur, wenn `NEXTAUTH_SECRET` gar nicht gesetzt ist). So kommen Auth-Route,
 * Session-Prüfung und Middleware immer zum selben Ergebnis.
 */
export function readSecret(variable: RequiredSecretName): string | undefined {
  const value = readRawValue(variable)
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
