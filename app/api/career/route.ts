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

    const careers = await prisma.career.findMany({
      where: {
        userId: session.user.id as string,
      },
      orderBy: {
        startDate: "desc",
      },
    })

    return NextResponse.json({ careers }, { status: 201 })
  } catch (error) {
    console.error("Error fetching career entries:", error)
    return NextResponse.json({ error: "Failed to fetch career entries" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin()

    if (!auth.ok) {
      return auth.response
    }

    const { session } = auth

    const { position, company, startDate, endDate, description, location, logoUrl } =
      await req.json()

    const career = await prisma.career.create({
      data: {
        position,
        company,
        startDate: new Date(startDate),
        endDate: endDate || "Present",
        description,
        location,
        logoUrl,
        userId: session.user.id as string,
      },
    })

    return NextResponse.json({ career }, { status: 201 })
  } catch (error) {
    console.error("Error creating career entry:", error)
    return NextResponse.json({ error: "Failed to create career entry" }, { status: 500 })
  }
}
