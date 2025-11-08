import { unstable_noStore as noStore } from "next/cache"

import prisma from "@/lib/db"
import type {
  EngagementHighlightProject,
  EngagementHighlights,
  ProjectComment,
  ReactionSummary,
  ReactionType,
} from "@/types/database"

export const reactionTypes = ["LIKE", "INSIGHTFUL", "CELEBRATE"] as const satisfies ReactionType[]

type PrismaCommentWithUser = {
  id: string
  projectId: string
  userId: string
  content: string
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    name: string | null
    imageUrl: string | null
  } | null
}

type ReactionGroup = {
  type: ReactionType
  _count: {
    _all: number | null
  }
}

type RawProjectHighlight = {
  id: string
  title: string
  description: string
  updatedAt: Date
  _count: {
    comments: number
    reactions: number
  }
}

export async function getProjectComments(projectId: string): Promise<ProjectComment[]> {
  noStore()
  try {
    const comments = (await prisma.projectComment.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })) as PrismaCommentWithUser[]

    return comments.map((comment) => {
      const { user, ...rest } = comment

      return {
        ...rest,
        user: user
          ? {
              id: user.id,
              name: user.name,
              imageUrl: user.imageUrl,
            }
          : undefined,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
      }
    })
  } catch (error) {
    console.error("Error fetching project comments", error)
    return []
  }
}

export async function getProjectReactionSummary(projectId: string): Promise<ReactionSummary> {
  noStore()
  try {
    const counts = (await prisma.projectReaction.groupBy({
      by: ["type"],
      where: { projectId },
      _count: { _all: true },
    })) as ReactionGroup[]

    const normalizedCounts: Record<ReactionType, number> = {
      LIKE: 0,
      INSIGHTFUL: 0,
      CELEBRATE: 0,
    }

    counts.forEach((entry) => {
      const type = entry.type as ReactionType
      normalizedCounts[type] = entry._count._all ?? 0
    })

    const total = counts.reduce((acc, entry) => acc + (entry._count._all ?? 0), 0)

    return {
      counts: normalizedCounts,
      total,
      userReaction: null,
    }
  } catch (error) {
    console.error("Error fetching project reaction summary", error)
    return {
      counts: {
        LIKE: 0,
        INSIGHTFUL: 0,
        CELEBRATE: 0,
      },
      total: 0,
      userReaction: null,
    }
  }
}

export async function getEngagementHighlights(limit = 3): Promise<EngagementHighlights> {
  noStore()
  try {
    const [totalComments, totalReactions, memberCount, topProjectsRaw, latestCommentRaw] =
      await Promise.all([
        prisma.projectComment.count(),
        prisma.projectReaction.count(),
        prisma.user.count({
          where: {
            role: {
              not: "Admin",
            },
          },
        }),
        prisma.project.findMany({
          take: limit,
          orderBy: {
            comments: {
              _count: "desc",
            },
          },
          select: {
            id: true,
            title: true,
            description: true,
            updatedAt: true,
            _count: {
              select: {
                comments: true,
                reactions: true,
              },
            },
          },
        }),
        prisma.projectComment.findFirst({
          orderBy: {
            createdAt: "desc",
          },
          include: {
            project: {
              select: {
                id: true,
                title: true,
              },
            },
            user: {
              select: {
                name: true,
              },
            },
          },
        }),
      ])

    const topProjects = (topProjectsRaw as RawProjectHighlight[]).map(
      (project): EngagementHighlightProject => ({
        id: project.id,
        title: project.title,
        description: project.description,
        commentCount: project._count.comments,
        reactionCount: project._count.reactions,
        updatedAt: project.updatedAt.toISOString(),
      }),
    )

    const latestComment = latestCommentRaw
      ? {
          id: latestCommentRaw.id,
          projectId: latestCommentRaw.project.id,
          projectTitle: latestCommentRaw.project.title,
          content: latestCommentRaw.content,
          createdAt: latestCommentRaw.createdAt.toISOString(),
          authorName: latestCommentRaw.user?.name ?? null,
        }
      : null

    return {
      totalComments,
      totalReactions,
      memberCount,
      topProjects,
      latestComment,
    }
  } catch (error) {
    console.error("Error calculating engagement highlights", error)
    return {
      totalComments: 0,
      totalReactions: 0,
      memberCount: 0,
      topProjects: [],
      latestComment: null,
    }
  }
}
