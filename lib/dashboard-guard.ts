import { redirect } from "next/navigation"
import type { Session } from "next-auth"

import { isAdminSession } from "@/lib/authz"
import {
  DASHBOARD_FORBIDDEN_PATH,
  DASHBOARD_LOGIN_PATH,
  decideDashboardAccess,
} from "@/lib/dashboard-access"

/**
 * Lets only admins through to dashboard content and returns their user id.
 *
 * Next.js renders layouts and pages in parallel, and on client navigation or segment
 * requests the layout may not run at all. Pages that read data themselves therefore call
 * this right before their queries instead of relying on the layout check. The role is read
 * from the database, not from the session token.
 *
 * @param loginPath where to send visitors without a session (defaults to /login)
 */
export async function requireDashboardAdmin(
  session: Session | null,
  loginPath: string = DASHBOARD_LOGIN_PATH,
): Promise<string> {
  const userId = session?.user?.id
  const isAdmin = session && userId ? await isAdminSession(session) : false
  const access = decideDashboardAccess({ userId, isAdmin })

  if (access === "login" || !userId) {
    redirect(loginPath)
  }

  if (access === "forbidden") {
    redirect(DASHBOARD_FORBIDDEN_PATH)
  }

  return userId
}
