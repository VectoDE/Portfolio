import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const certificates = await prisma.certificate.findMany({
      where: {
        userId: session.user.id as string,
      },
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json({ certificates })
  } catch (error) {
    console.error("Error fetching certificates:", error)
    return NextResponse.json({ error: "Failed to fetch certificates" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, issuer, date, link, imageUrl } = await req.json()

    const certificate = await prisma.certificate.create({
      data: {
        name,
        issuer,
        date: new Date(date),
        link,
        imageUrl,
        userId: session.user.id as string,
      },
    })

    return NextResponse.json({ certificate }, { status: 201 })
  } catch (error) {
    console.error("Error creating certificate:", error)
    return NextResponse.json({ error: "Failed to create certificate" }, { status: 500 })
  }
}
