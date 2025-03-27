import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic"

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const skill = await prisma.skill.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 })
    }

    return NextResponse.json({ skill })
  } catch (error) {
    console.error("Error fetching skill:", error)
    return NextResponse.json({ error: "Failed to fetch skill" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, category, level, years, iconName } = await req.json()

    // Check if skill exists and belongs to user
    const existingSkill = await prisma.skill.findFirst({
      where: {
        id: params.id,
        userId: session.user.id as string,
      },
    })

    if (!existingSkill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 })
    }

    const updatedSkill = await prisma.skill.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        category,
        level,
        years: Number.parseFloat(years),
        iconName,
      },
    })

    return NextResponse.json({ skill: updatedSkill })
  } catch (error) {
    console.error("Error updating skill:", error)
    return NextResponse.json({ error: "Failed to update skill" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if skill exists and belongs to user
    const existingSkill = await prisma.skill.findFirst({
      where: {
        id: params.id,
        userId: session.user.id as string,
      },
    })

    if (!existingSkill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 })
    }

    await prisma.skill.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting skill:", error)
    return NextResponse.json({ error: "Failed to delete skill" }, { status: 500 })
  }
}

