import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import type { Session } from "next-auth"

import { authOptions } from "@/lib/auth"
import { decideAuthz } from "@/lib/authz-decision"
import prisma from "@/lib/db"

export const ADMIN_ROLE = "Admin"

export type AuthenticatedSession = Session & {
  user: Session["user"] & { id: string }
}

export type AuthzResult =
  | { ok: true; session: AuthenticatedSession; response?: undefined }
  | { ok: false; session?: undefined; response: NextResponse }

function unauthorized(): AuthzResult {
  return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
}

function forbidden(): AuthzResult {
  return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
}

function isAuthenticatedSession(session: Session | null): session is AuthenticatedSession {
  return typeof session?.user?.id === "string" && session.user.id.length > 0
}

/**
 * Resolves the session and loads the account behind it in a single query, so the role
 * check below does not need a second lookup.
 */
async function authorize(requiredRole?: string): Promise<AuthzResult> {
  const session = await getServerSession(authOptions)

  if (!isAuthenticatedSession(session)) {
    return unauthorized()
  }

  const account = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  })

  const decision = decideAuthz(account, requiredRole)

  if (decision === "unauthorized") {
    return unauthorized()
  }

  if (decision === "forbidden") {
    return forbidden()
  }

  return { ok: true, session }
}

/**
 * Resolves the current session. Returns a ready-made 401 response when nobody is signed in
 * or when the account behind the session token has been deleted.
 */
export async function requireSession(): Promise<AuthzResult> {
  return authorize()
}

/**
 * Checks whether the signed-in user holds the admin role, without producing a response.
 * The role is read from the database so that demoted or deleted accounts lose access
 * immediately instead of keeping it until their session token expires.
 */
export async function isAdminSession(session: AuthenticatedSession): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  return user?.role === ADMIN_ROLE
}

/**
 * Resolves the current session and requires the admin role.
 * Returns a ready-made 401 response without a session or account and 403 for any other role.
 */
export async function requireAdmin(): Promise<AuthzResult> {
  return authorize(ADMIN_ROLE)
}
