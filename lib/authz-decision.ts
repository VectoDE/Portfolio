// Pure access decision behind requireSession and requireAdmin. Kept free of imports so the
// unit tests can load it without Next.js, NextAuth or Prisma.

export type AuthzDecision = "ok" | "unauthorized" | "forbidden"

export interface AuthzAccount {
  role: string | null
}

/**
 * Decides access from the account row loaded for the session user.
 * A missing row means the account was deleted after sign-in, so the session no longer counts.
 */
export function decideAuthz(
  account: AuthzAccount | null | undefined,
  requiredRole?: string,
): AuthzDecision {
  if (!account) {
    return "unauthorized"
  }

  if (requiredRole !== undefined && account.role !== requiredRole) {
    return "forbidden"
  }

  return "ok"
}
