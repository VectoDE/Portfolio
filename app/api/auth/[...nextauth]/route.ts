import { NextResponse } from "next/server"
import NextAuth from "next-auth/next"

import { authOptions } from "@/lib/auth"
import { readSecret, reportMissingSecret } from "@/lib/env"

const nextAuthHandler = NextAuth(authOptions)

type RouteContext = { params: Promise<{ nextauth: string[] }> }

// Fail closed: Ohne NEXTAUTH_SECRET werden weder Sessions ausgestellt noch geprüft.
// Die Prüfung läuft pro Anfrage, damit `next build` nicht vom Laufzeitwert abhängt.
async function handler(req: Request, context: RouteContext) {
  if (!readSecret("NEXTAUTH_SECRET")) {
    reportMissingSecret("NEXTAUTH_SECRET")
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
  }

  return nextAuthHandler(req, context)
}

export { handler as GET, handler as POST }
