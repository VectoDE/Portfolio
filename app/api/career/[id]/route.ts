import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    const career = await prisma.career.findUnique({
      where: {
        id,
      },
    })

    if (!career) {
      return NextResponse.json({ error: "Career entry not found" }, { status: 404 })
    }

    return NextResponse.json({ career })
  } catch (error) {
    console.error("Error fetching career entry:", error)
    return NextResponse.json({ error: "Failed to fetch career entry" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { position, company, startDate, endDate, description, location, logoUrl } =
      await req.json()

    const { id } = await params

    // Check if career entry exists and belongs to user
    const existingCareer = await prisma.career.findFirst({
      where: {
        id,
        userId: session.user.id as string,
      },
    })

    if (!existingCareer) {
      return NextResponse.json({ error: "Career entry not found" }, { status: 404 })
    }

    const updatedCareer = await prisma.career.update({
      where: {
        id,
      },
      data: {
        position,
        company,
        startDate: new Date(startDate),
        endDate: endDate || "Present",
        description,
        location,
        logoUrl,
      },
    })

    return NextResponse.json({ career: updatedCareer })
  } catch (error) {
    console.error("Error updating career entry:", error)
    return NextResponse.json({ error: "Failed to update career entry" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Check if career entry exists and belongs to user
    const existingCareer = await prisma.career.findFirst({
      where: {
        id,
        userId: session.user.id as string,
      },
    })

    if (!existingCareer) {
      return NextResponse.json({ error: "Career entry not found" }, { status: 404 })
    }

    await prisma.career.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting career entry:", error)
    return NextResponse.json({ error: "Failed to delete career entry" }, { status: 500 })
  }
}
