import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }

    // Find subscriber by token
    const subscriber = await prisma.subscriber.findUnique({
      where: { token },
      include: { preferences: true },
    })

    if (!subscriber) {
      return NextResponse.json({ error: "Invalid subscription token" }, { status: 404 })
    }

    return NextResponse.json({
      email: subscriber.email,
      preferences: subscriber.preferences
        ? {
            projects: subscriber.preferences.projects,
            certificates: subscriber.preferences.certificates,
            skills: subscriber.preferences.skills,
            careers: subscriber.preferences.careers,
          }
        : null,
    })
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json({ error: "Failed to verify token" }, { status: 500 })
  }
}
