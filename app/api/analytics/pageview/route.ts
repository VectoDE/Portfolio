import { NextResponse } from "next/server"
import { createHash } from "crypto"

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
    const { path, userAgent, referrer, consentGranted } = data

    if (!consentGranted) {
      return new NextResponse(null, { status: 204 })
    }

    if (!path || typeof path !== "string") {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 })
    }

    const forwarded = req.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(/, /)[0] : null
    const ipHash = ip
      ? createHash("sha256").update(`${process.env.IP_HASH_SALT ?? ""}${ip}`).digest("hex")
      : null

    const pageView = await prisma.pageView.create({
      data: {
        path,
        userAgent,
        ipAddress: ipHash,
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

    const uniqueVisitors = await prisma.pageView
      .groupBy({
        by: ["ipAddress"],
        where: {
          ...whereClause,
          ipAddress: { not: null },
        },
      })
      .then((rows) => rows.length)

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
