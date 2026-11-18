import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/authz"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const auth = await requireAdmin()

    if (!auth.ok) {
      return auth.response
    }

    const { session } = auth

    const skills = await prisma.skill.findMany({
      where: {
        userId: session.user.id as string,
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json({ skills })
  } catch (error) {
    console.error("Error fetching skills:", error)
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin()

    if (!auth.ok) {
      return auth.response
    }

    const { session } = auth

    const { name, category, level, years, iconName } = await req.json()

    const skill = await prisma.skill.create({
      data: {
        name,
        category,
        level,
        years: Number.parseFloat(years),
        iconName,
        userId: session.user.id as string,
      },
    })

    return NextResponse.json({ skill }, { status: 201 })
  } catch (error) {
    console.error("Error creating skill:", error)
    return NextResponse.json({ error: "Failed to create skill" }, { status: 500 })
  }
}
