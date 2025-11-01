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

type InsensitiveFilter = {
  contains: string
  mode?: "insensitive"
}

interface ProjectWhereInput {
  userId: string
  featured?: boolean
  OR?: Array<{
    title?: InsensitiveFilter
    description?: InsensitiveFilter
    technologies?: InsensitiveFilter
  }>
}

// GET /api/projects - Get all projects
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id as string

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const featured = searchParams.get("featured") === "true"

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build where clause
    const where: ProjectWhereInput = { userId }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { technologies: { contains: search, mode: "insensitive" } },
      ]
    }

    if (featured) {
      where.featured = true
    }

    // Get projects with pagination
    const [projects, totalProjects] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          features: true,
        },
      }),
      prisma.project.count({ where }),
    ])

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalProjects / limit)
    const hasMore = page < totalPages

    return NextResponse.json({
      projects,
      pagination: {
        page,
        limit,
        totalProjects,
        totalPages,
        hasMore,
      },
    })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// POST /api/projects - Create a new project
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id as string
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

    const sanitizedFeatureList = sanitizeFeatureList(features)

    // Create project with features
    const project = await prisma.project.create({
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
        userId,
        features: {
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
    revalidatePath(`/dashboard/projects/${project.id}`)
    revalidatePath(`/dashboard/projects/${project.id}/view`)

    return NextResponse.json({ project })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
