import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import type { Session } from "next-auth"

import { authOptions } from "@/lib/auth"
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
 * Resolves the current session. Returns a ready-made 401 response when nobody is signed in.
 */
export async function requireSession(): Promise<AuthzResult> {
  const session = await getServerSession(authOptions)

  if (!isAuthenticatedSession(session)) {
    return unauthorized()
  }

  return { ok: true, session }
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
 * Returns a ready-made 401 response without a session and 403 for any other role.
 */
export async function requireAdmin(): Promise<AuthzResult> {
  const result = await requireSession()

  if (!result.ok) {
    return result
  }

  if (!(await isAdminSession(result.session))) {
    return forbidden()
  }

  return result
}
