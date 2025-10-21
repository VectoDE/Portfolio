import { NextResponse } from "next/server"
import prisma from "@/lib/db"

type DateRangeFilter = {
  gte?: Date
  lte?: Date
}

interface PageViewWhereInput {
  createdAt?: DateRangeFilter
  path?: string
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const { path, userAgent, referrer } = data

    const forwarded = req.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(/, /)[0] : null

    const pageView = await prisma.pageView.create({
      data: {
        path,
        userAgent,
        ipAddress: ip,
        referrer,
      },
    })

    return NextResponse.json({ success: true, id: pageView.id })
  } catch (error) {
    console.error("Error tracking page view:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const path = searchParams.get("path")
    const period = searchParams.get("period") || "30" // Default to 30 days
    const periodDays = Number.parseInt(period)

    const periodEndDate = new Date()
    const periodStartDate = new Date()
    periodStartDate.setDate(periodStartDate.getDate() - periodDays)

    const whereClause: PageViewWhereInput = {
      createdAt: {
        gte: periodStartDate,
        lte: periodEndDate,
      },
      path: path ?? undefined,
    }

    const totalViews = await prisma.pageView.count({
      where: whereClause,
    })

    const uniqueVisitorsRaw = (await prisma.$queryRawUnsafe(
      `
            SELECT COUNT(DISTINCT "ipAddress") as count
            FROM "PageView"
            WHERE "createdAt" >= $1
            AND "createdAt" <= $2
            ${path ? `AND "path" = $3` : ""}
        `,
      periodStartDate,
      periodEndDate,
      path || undefined,
    )) as Array<{ count: bigint }>

    const uniqueVisitorsCount = uniqueVisitorsRaw[0]?.count
    const uniqueVisitors = uniqueVisitorsCount ? Number(uniqueVisitorsCount) : 0

    return NextResponse.json({
      totalViews,
      uniqueVisitors,
      period: periodDays,
    })
  } catch (error) {
    console.error("Error getting page view statistics:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
