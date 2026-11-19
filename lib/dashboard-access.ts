// Pure decision for who may open /dashboard. Kept free of imports so the unit tests can
// load it without Next.js or Prisma.

export type DashboardAccess = "allow" | "login" | "forbidden"

export const DASHBOARD_LOGIN_PATH = "/login"
export const DASHBOARD_FORBIDDEN_PATH = "/"

export interface DashboardAccessInput {
  /** Id of the signed-in user, missing when nobody is signed in. */
  userId: string | null | undefined
  /** Admin role as read from the database, not from the session token. */
  isAdmin: boolean
}

export function decideDashboardAccess({ userId, isAdmin }: DashboardAccessInput): DashboardAccess {
  if (typeof userId !== "string" || userId.length === 0) {
    return "login"
  }

  return isAdmin ? "allow" : "forbidden"
}
