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
    const isAccountPage = req.nextUrl.pathname.startsWith("/account")

    if (isAuthPage) {
      if (isAuth) {
        const destination = token?.role === "Admin" ? "/dashboard" : "/account"
        return NextResponse.redirect(new URL(destination, req.url))
      }
      return null
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

    return null
  },
  {
    callbacks: {
      authorized: ({ token }) => true,
    },
  },
)

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/account"],
}
