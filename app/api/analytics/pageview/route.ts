import { NextResponse } from "next/server"
import prisma from "@/lib/db"

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

        const whereClause: any = {
            createdAt: {
                gte: periodStartDate,
                lte: periodEndDate,
            },
        }

        if (path) {
            whereClause.path = path
        }

        const totalViews = await prisma.pageView.count({
            where: whereClause,
        })

        const uniqueVisitorsRaw = await prisma.$queryRawUnsafe(
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
        )

        const uniqueVisitors = Number((uniqueVisitorsRaw as any[])[0]?.count || 0)

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
