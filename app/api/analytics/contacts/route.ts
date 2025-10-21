import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { format, subDays } from "date-fns"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

// GET /api/analytics/contacts - Get contact analytics
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
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
    const percentage =
      previousPeriodCount === 0
        ? change > 0
          ? 100
          : 0
        : Math.round((change / previousPeriodCount) * 100)

    // Get status breakdown
    const statusBreakdownRaw = await prisma.$queryRaw<Array<{ status: string; count: bigint }>>`
      SELECT status, COUNT(*) as count
      FROM "Contact"
      GROUP BY status
      ORDER BY count DESC
    `

    // Convert BigInt to Number to avoid serialization issues
    const statusBreakdown = statusBreakdownRaw.map(
      ({ status, count }: { status: string; count: bigint }) => ({
        status,
        count: Number(count),
      }),
    )

    // Get daily contacts for the period
    const dailyContacts: { date: string; count: number }[] = []

    // Generate dates for the last N days
    for (let i = periodDays - 1; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const formattedDate = format(date, "yyyy-MM-dd")

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

      dailyContacts.push({
        date: formattedDate,
        count,
      })
    }

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
