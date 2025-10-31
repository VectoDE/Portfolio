import { NextResponse } from "next/server"
import prisma from "@/lib/db"

const DEFAULT_PREFERENCES = {
  projects: true,
  certificates: true,
  skills: true,
  careers: true,
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }

    const subscriber = await prisma.subscriber.findUnique({
      where: { token },
      include: { preferences: true },
    })

    if (!subscriber) {
      return NextResponse.json({ error: "Invalid subscription token" }, { status: 404 })
    }

    const preferences = subscriber.preferences
      ? {
          projects: subscriber.preferences.projects,
          certificates: subscriber.preferences.certificates,
          skills: subscriber.preferences.skills,
          careers: subscriber.preferences.careers,
        }
      : DEFAULT_PREFERENCES

    return NextResponse.json({
      email: subscriber.email,
      name: subscriber.name,
      preferences,
    })
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json({ error: "Failed to verify token" }, { status: 500 })
  }
}
