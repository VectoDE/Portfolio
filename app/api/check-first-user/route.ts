import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET(req: Request) {
  try {
    // Ensure this is an internal middleware request
    const isInternal = req.headers.get("x-middleware-internal") === "true"

    if (!isInternal) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Count users in the database
    const count = await prisma.user.count()

    // Return whether users exist
    return NextResponse.json({ hasUsers: count > 0 })
  } catch (error) {
    console.error("Error checking users:", error)
    return NextResponse.json({ error: "Failed to check users" }, { status: 500 })
  }
}
