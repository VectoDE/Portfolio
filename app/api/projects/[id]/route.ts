import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import {
  normalizeBoolean,
  normalizeLongFormField,
  normalizeOptionalString,
  sanitizeFeatureList,
} from "@/lib/project-validation"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/projects/[id] - Get a project by ID
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id as string
    const { id: projectId } = await params

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId,
      },
      include: {
        features: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// PUT /api/projects/[id] - Update a project
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id as string
    const { id: projectId } = await params
    const data = await req.json()

    const {
      title,
      description,
      technologies,
      link,
      githubUrl,
      imageUrl,
      logoUrl,
      featured,
      developmentProcess,
      challengesFaced,
      futurePlans,
      logContent,
      features = [],
    } = data

    const sanitizedTitle = normalizeOptionalString(title)
    const sanitizedDescription = normalizeOptionalString(description)
    const sanitizedTechnologies = normalizeOptionalString(technologies)

    // Validate required fields
    if (!sanitizedTitle || !sanitizedDescription || !sanitizedTechnologies) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if project exists and belongs to user
    const existingProject = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId,
      },
    })

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Update project
    const sanitizedFeatureList = sanitizeFeatureList(features)

    const project = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        title: sanitizedTitle,
        description: sanitizedDescription,
        technologies: sanitizedTechnologies,
        link: normalizeOptionalString(link),
        githubUrl: normalizeOptionalString(githubUrl),
        imageUrl: normalizeOptionalString(imageUrl),
        logoUrl: normalizeOptionalString(logoUrl),
        featured: normalizeBoolean(featured),
        developmentProcess: normalizeLongFormField(developmentProcess),
        challengesFaced: normalizeLongFormField(challengesFaced),
        futurePlans: normalizeLongFormField(futurePlans),
        logContent: normalizeLongFormField(logContent),
        features: {
          deleteMany: {},
          create: sanitizedFeatureList,
        },
      },
      include: {
        features: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    revalidatePath("/projects")
    revalidatePath("/")
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/projects")
    revalidatePath(`/dashboard/projects/${projectId}`)
    revalidatePath(`/dashboard/projects/${projectId}/view`)

    return NextResponse.json({ project })
  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id as string
    const { id: projectId } = await params

    // Check if project exists and belongs to user
    const existingProject = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId,
      },
    })

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Delete project (features will be deleted via cascade)
    await prisma.project.delete({
      where: {
        id: projectId,
      },
    })

    revalidatePath("/projects")
    revalidatePath("/")
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/projects")
    revalidatePath(`/dashboard/projects/${projectId}`)
    revalidatePath(`/dashboard/projects/${projectId}/view`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
