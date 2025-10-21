import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { withAuth } from "next-auth/middleware"

export default withAuth(
  async function middleware(req) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })
    const isAuth = !!token
    const isAuthPage =
      req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register")

    // Check if registration is allowed
    if (req.nextUrl.pathname.startsWith("/register") && !isAuth) {
      try {
        // Check if there are any existing users
        const response = await fetch(`${process.env.NEXTAUTH_URL}/api/check-first-user`, {
          headers: {
            "x-middleware-internal": "true",
          },
        })

        if (response.ok) {
          const { hasUsers } = await response.json()

          // If users exist, redirect to login
          if (hasUsers) {
            return NextResponse.redirect(new URL("/login", req.url))
          }
        }
      } catch (error) {
        console.error("Error checking first user:", error)
      }
    }

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
      return null
    }

    if (!isAuth && req.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    return null
  },
  {
    callbacks: {
      authorized: ({ token }) => true,
    },
  },
)

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
}
