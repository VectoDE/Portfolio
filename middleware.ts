import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
// Einzige erlaubte Stelle für getToken, siehe eslint.config.mjs (no-restricted-imports).
// eslint-disable-next-line no-restricted-imports
import { getToken } from "next-auth/jwt"

import { readSecret, reportMissingSecret } from "@/lib/env"

export default async function middleware(req: NextRequest) {
  // Kein Fallback (fail closed): Fehlt das Secret oder besteht es nur aus Leerzeichen,
  // wird abgelehnt, bevor ein Token gelesen wird. getToken bekommt das geprüfte Secret
  // ausdrücklich, sonst würde es den Rohwert aus process.env nehmen.
  // withAuth wird bewusst nicht verwendet: Es liest das Secret ebenfalls selbst aus
  // process.env, und die eigene Prüfung unten deckt alle Fälle ab.
  const secret = readSecret("NEXTAUTH_SECRET")

  if (!secret) {
    reportMissingSecret("NEXTAUTH_SECRET")
    return new NextResponse("Server configuration error", { status: 500 })
  }

  const token = await getToken({ req, secret })
  const isAuth = !!token
  const isAuthPage =
    req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register")
  const isAccountPage = req.nextUrl.pathname.startsWith("/account")

  if (isAuthPage) {
    if (isAuth) {
      const destination = token?.role === "Admin" ? "/dashboard" : "/account"
      return NextResponse.redirect(new URL(destination, req.url))
    }
    return NextResponse.next()
  }

  if (isAccountPage && !isAuth) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    if (!isAuth) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    if (token?.role !== "Admin") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/account"],
}
