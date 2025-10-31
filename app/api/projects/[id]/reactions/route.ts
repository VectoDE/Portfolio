import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { getProjectReactionSummary, reactionTypes } from "@/lib/engagement"
import type { ReactionSummary, ReactionType } from "@/types/database"

const reactionSchema = z.object({
  type: z.enum(reactionTypes),
})

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

async function buildSummary(projectId: string, userId?: string | null): Promise<ReactionSummary> {
  const summary = await getProjectReactionSummary(projectId)

  if (!userId) {
    return summary
  }

  const existing = await prisma.projectReaction.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
    select: { type: true },
  })

  return {
    ...summary,
    userReaction: existing?.type as ReactionType | null,
  }
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    const { id: projectId } = await params

    if (!projectId) {
      return NextResponse.json({ error: "Project id is required" }, { status: 400 })
    }

    const summary = await buildSummary(projectId, session?.user?.id)

    return NextResponse.json(summary)
  } catch (error) {
    console.error("Error retrieving reaction summary", error)
    return NextResponse.json({ error: "Failed to load reactions" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { id: projectId } = await params

    if (!projectId) {
      return NextResponse.json({ error: "Project id is required" }, { status: 400 })
    }

    const body = await req.json()
    const parsed = reactionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
    }

    const projectExists = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    })

    if (!projectExists) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const existing = await prisma.projectReaction.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: session.user.id,
        },
      },
    })

    if (existing) {
      if (existing.type === parsed.data.type) {
        await prisma.projectReaction.delete({
          where: { id: existing.id },
        })
      } else {
        await prisma.projectReaction.update({
          where: { id: existing.id },
          data: { type: parsed.data.type },
        })
      }
    } else {
      await prisma.projectReaction.create({
        data: {
          projectId,
          userId: session.user.id,
          type: parsed.data.type,
        },
      })
    }

    const summary = await buildSummary(projectId, session.user.id)

    return NextResponse.json(summary)
  } catch (error) {
    console.error("Error updating reaction", error)
    return NextResponse.json({ error: "Failed to update reaction" }, { status: 500 })
  }
}
