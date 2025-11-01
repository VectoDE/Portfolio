export const PROJECT_LONGFORM_MAX_LENGTH = 1_000_000

export function normalizeOptionalString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function normalizeBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value
  }

  if (typeof value === "string") {
    const normalized = value.toLowerCase()
    return normalized === "true" || normalized === "1" || normalized === "on"
  }

  if (typeof value === "number") {
    return value !== 0
  }

  return Boolean(value)
}

export function normalizeLongFormField(value: unknown): string | null {
  const normalized = normalizeOptionalString(value)

  if (!normalized) {
    return null
  }

  if (normalized.length > PROJECT_LONGFORM_MAX_LENGTH) {
    return normalized.slice(0, PROJECT_LONGFORM_MAX_LENGTH)
  }

  return normalized
}
