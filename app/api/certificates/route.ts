import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/authz"
import prisma from "@/lib/db"
import { certificatePublicSelect } from "@/lib/public-fields"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const auth = await requireAdmin()

    if (!auth.ok) {
      return auth.response
    }

    const { session } = auth

    const certificates = await prisma.certificate.findMany({
      where: {
        userId: session.user.id as string,
      },
      select: certificatePublicSelect,
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
    const auth = await requireAdmin()

    if (!auth.ok) {
      return auth.response
    }

    const { session } = auth

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
