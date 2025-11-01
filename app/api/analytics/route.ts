import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { format, subDays, startOfDay, endOfDay } from "date-fns"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

// Function to calculate period change statistics
async function calculateStatsWithChange(
  userId: string,
  model: "project" | "certificate" | "skill" | "career" | "contact" | "pageview",
  days = 30,
): Promise<{
  count: number
  change: number
  percentage: number
}> {
  const periodEndDate = new Date()
  const periodStartDate = new Date()
  periodStartDate.setDate(periodStartDate.getDate() - days)

  // Previous period for comparison
  const prevPeriodStartDate = new Date(periodStartDate)
  prevPeriodStartDate.setDate(prevPeriodStartDate.getDate() - days)

  // Get total count, current period count, and previous period count based on model
  let totalCount = 0
  let currentPeriodCount = 0
  let previousPeriodCount = 0

  // Use a switch statement to handle each model type separately
  switch (model) {
    case "project":
      totalCount = await prisma.project.count({
        where: { userId },
      })
      currentPeriodCount = await prisma.project.count({
        where: {
          userId,
          createdAt: {
            gte: periodStartDate,
            lte: periodEndDate,
          },
        },
      })
      previousPeriodCount = await prisma.project.count({
        where: {
          userId,
          createdAt: {
            gte: prevPeriodStartDate,
            lt: periodStartDate,
          },
        },
      })
      break
    case "certificate":
      totalCount = await prisma.certificate.count({
        where: { userId },
      })
      currentPeriodCount = await prisma.certificate.count({
        where: {
          userId,
          createdAt: {
            gte: periodStartDate,
            lte: periodEndDate,
          },
        },
      })
      previousPeriodCount = await prisma.certificate.count({
        where: {
          userId,
          createdAt: {
            gte: prevPeriodStartDate,
            lt: periodStartDate,
          },
        },
      })
      break
    case "skill":
      totalCount = await prisma.skill.count({
        where: { userId },
      })
      currentPeriodCount = await prisma.skill.count({
        where: {
          userId,
          createdAt: {
            gte: periodStartDate,
            lte: periodEndDate,
          },
        },
      })
      previousPeriodCount = await prisma.skill.count({
        where: {
          userId,
          createdAt: {
            gte: prevPeriodStartDate,
            lt: periodStartDate,
          },
        },
      })
      break
    case "career":
      totalCount = await prisma.career.count({
        where: { userId },
      })
      currentPeriodCount = await prisma.career.count({
        where: {
          userId,
          createdAt: {
            gte: periodStartDate,
            lte: periodEndDate,
          },
        },
      })
      previousPeriodCount = await prisma.career.count({
        where: {
          userId,
          createdAt: {
            gte: prevPeriodStartDate,
            lt: periodStartDate,
          },
        },
      })
      break
    case "contact":
      totalCount = await prisma.contact.count()
      currentPeriodCount = await prisma.contact.count({
        where: {
          createdAt: {
            gte: periodStartDate,
            lte: periodEndDate,
          },
        },
      })
      previousPeriodCount = await prisma.contact.count({
        where: {
          createdAt: {
            gte: prevPeriodStartDate,
            lt: periodStartDate,
          },
        },
      })
      break
    case "pageview":
      totalCount = await prisma.pageView.count()
      currentPeriodCount = await prisma.pageView.count({
        where: {
          createdAt: {
            gte: periodStartDate,
            lte: periodEndDate,
          },
        },
      })
      previousPeriodCount = await prisma.pageView.count({
        where: {
          createdAt: {
            gte: prevPeriodStartDate,
            lt: periodStartDate,
          },
        },
      })
      break
  }

  // Calculate change
  const change = currentPeriodCount - previousPeriodCount

  // Calculate percentage change
  const percentage =
    previousPeriodCount === 0
      ? change > 0
        ? 100
        : 0
      : Math.round((change / previousPeriodCount) * 100)

  return {
    count: totalCount,
    change,
    percentage,
  }
}

// Function to get daily data for a specific model
async function getDailyData(
  userId: string,
  model: "project" | "certificate" | "skill" | "career" | "contact" | "pageview",
  days = 30,
): Promise<{ date: string; count: number }[]> {
  const result: { date: string; count: number }[] = []

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i)
    const formattedDate = format(date, "yyyy-MM-dd")
    const dayStart = startOfDay(date)
    const dayEnd = endOfDay(date)

    let count = 0
    switch (model) {
      case "project":
        count = await prisma.project.count({
          where: {
            userId,
            createdAt: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        })
        break
      case "certificate":
        count = await prisma.certificate.count({
          where: {
            userId,
            createdAt: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        })
        break
      case "skill":
        count = await prisma.skill.count({
          where: {
            userId,
            createdAt: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        })
        break
      case "career":
        count = await prisma.career.count({
          where: {
            userId,
            createdAt: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        })
        break
      case "contact":
        count = await prisma.contact.count({
          where: {
            createdAt: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        })
        break
      case "pageview":
        count = await prisma.pageView.count({
          where: {
            createdAt: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        })
        break
    }

    result.push({
      date: formattedDate,
      count,
    })
  }

  return result
}

// Function to get page view analytics
async function getPageViewAnalytics(days = 30) {
  const periodEndDate = new Date()
  const periodStartDate = new Date()
  periodStartDate.setDate(periodStartDate.getDate() - days)

  // Get total page views
  const totalViews = await prisma.pageView.count()

  // Get daily page views
  const dailyViews = await getDailyData("", "pageview", days)

  // Get top pages
  const topPagesRaw = await prisma.pageView.groupBy({
    by: ["path"],
    where: {
      createdAt: {
        gte: periodStartDate,
        lte: periodEndDate,
      },
    },
    _count: { _all: true },
    orderBy: {
      _count: {
        _all: "desc",
      },
    },
    take: 5,
  })

  const formattedTopPages = topPagesRaw.map(({ path, _count }) => ({
    path,
    count: _count._all,
  }))

  // Get unique visitors (approximated by unique IP addresses)
  const uniqueVisitors = await prisma.pageView
    .groupBy({
      by: ["ipAddress"],
      where: {
        createdAt: {
          gte: periodStartDate,
          lte: periodEndDate,
        },
        ipAddress: { not: null },
      },
    })
    .then((rows) => rows.length)

  return {
    totalViews,
    dailyViews,
    topPages: formattedTopPages,
    uniqueVisitors,
  }
}

// GET /api/analytics - Get all analytics
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id as string

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period") || "30" // Default to 30 days
    const periodDays = Number.parseInt(period)

    // Get stats with period changes
    const [projectStats, certificateStats, skillStats, careerStats, contactStats, pageViewStats] =
      await Promise.all([
        calculateStatsWithChange(userId, "project", periodDays),
        calculateStatsWithChange(userId, "certificate", periodDays),
        calculateStatsWithChange(userId, "skill", periodDays),
        calculateStatsWithChange(userId, "career", periodDays),
        calculateStatsWithChange(userId, "contact", periodDays),
        calculateStatsWithChange(userId, "pageview", periodDays),
      ])

    // Get daily data for each model
    const [projectDaily, certificateDaily, skillDaily, careerDaily, contactDaily] =
      await Promise.all([
        getDailyData(userId, "project", periodDays),
        getDailyData(userId, "certificate", periodDays),
        getDailyData(userId, "skill", periodDays),
        getDailyData(userId, "career", periodDays),
        getDailyData(userId, "contact", periodDays),
      ])

    // Get page view analytics
    const pageViewAnalytics = await getPageViewAnalytics(periodDays)

    // Get featured projects
    const featuredProjects = await prisma.project.findMany({
      where: { userId, featured: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    })

    // Get recent certificates
    const recentCertificates = await prisma.certificate.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 3,
    })

    // Get recent contacts
    const recentContacts = await prisma.contact.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
    })

    return NextResponse.json({
      projects: {
        ...projectStats,
        daily: projectDaily,
      },
      certificates: {
        ...certificateStats,
        daily: certificateDaily,
      },
      skills: {
        ...skillStats,
        daily: skillDaily,
      },
      career: {
        ...careerStats,
        daily: careerDaily,
      },
      contacts: {
        ...contactStats,
        daily: contactDaily,
      },
      pageViews: {
        ...pageViewStats,
        ...pageViewAnalytics,
      },
      featuredProjects,
      recentCertificates,
      recentContacts,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
