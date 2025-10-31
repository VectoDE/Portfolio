import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { getProjectComments } from "@/lib/engagement"

const commentSchema = z.object({
  content: z
    .string({ required_error: "Comment text is required" })
    .trim()
    .min(3, "Comments must be at least 3 characters long")
    .max(600, "Comments cannot exceed 600 characters"),
})

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id: projectId } = await params

    if (!projectId) {
      return NextResponse.json({ error: "Project id is required" }, { status: 400 })
    }

    const comments = await getProjectComments(projectId)

    return NextResponse.json({ comments })
  } catch (error) {
    console.error("Error retrieving project comments", error)
    return NextResponse.json({ error: "Failed to load comments" }, { status: 500 })
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
    const parsed = commentSchema.safeParse(body)

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

    await prisma.projectComment.create({
      data: {
        projectId,
        userId: session.user.id,
        content: parsed.data.content,
      },
    })

    const comments = await getProjectComments(projectId)

    return NextResponse.json({ comments }, { status: 201 })
  } catch (error) {
    console.error("Error creating comment", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}
