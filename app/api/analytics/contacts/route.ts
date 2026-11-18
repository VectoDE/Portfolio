import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { format, subDays } from "date-fns"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

// GET /api/analytics/contacts - Get contact analytics
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period") || "30" // Default to 30 days
    const periodDays = Number.parseInt(period)

    const periodEndDate = new Date()
    const periodStartDate = new Date()
    periodStartDate.setDate(periodStartDate.getDate() - periodDays)

    // Previous period for comparison
    const prevPeriodStartDate = new Date(periodStartDate)
    prevPeriodStartDate.setDate(prevPeriodStartDate.getDate() - periodDays)

    // Get total contacts
    const total = await prisma.contact.count()

    // Get contacts in current period
    const currentPeriodCount = await prisma.contact.count({
      where: {
        createdAt: {
          gte: periodStartDate,
          lte: periodEndDate,
        },
      },
    })

    // Get contacts in previous period
    const previousPeriodCount = await prisma.contact.count({
      where: {
        createdAt: {
          gte: prevPeriodStartDate,
          lt: periodStartDate,
        },
      },
    })

    // Calculate change and percentage
    const change = currentPeriodCount - previousPeriodCount
    let percentage: number
    if (previousPeriodCount !== 0) {
      percentage = Math.round((change / previousPeriodCount) * 100)
    } else {
      percentage = change > 0 ? 100 : 0
    }

    // Get status breakdown
    const statusBreakdownRows: { status: string; _count: { _all: number; status: number } }[] = await prisma.contact.groupBy({
      by: ["status"],
      _count: { _all: true, status: true },
      orderBy: {
        _count: {
          status: "desc",
        },
      },
    })

    const statusBreakdown = statusBreakdownRows.map(({ status, _count }) => ({
      status,
      count: _count._all,
    }))

    // Get daily contacts for the period
    // Generate dates for the last N days; the daily counts are independent, so they run in parallel
    const dayOffsets = Array.from({ length: Math.max(periodDays, 0) }, (_, index) => periodDays - 1 - index)

    const dailyContacts: { date: string; count: number }[] = await Promise.all(
      dayOffsets.map(async (offset) => {
        const formattedDate = format(subDays(new Date(), offset), "yyyy-MM-dd")

        // Count contacts for this day
        const startOfDay = new Date(formattedDate)
        const endOfDay = new Date(formattedDate)
        endOfDay.setHours(23, 59, 59, 999)

        const count = await prisma.contact.count({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        })

        return { date: formattedDate, count }
      }),
    )

    return NextResponse.json({
      total,
      currentPeriod: {
        count: currentPeriodCount,
        change,
        percentage,
      },
      statusBreakdown,
      dailyContacts,
    })
  } catch (error) {
    console.error("Error fetching contact analytics:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
