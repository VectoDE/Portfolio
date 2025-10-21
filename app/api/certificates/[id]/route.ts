import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    const certificate = await prisma.certificate.findUnique({
      where: {
        id,
      },
    })

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
    }

    return NextResponse.json({ certificate })
  } catch (error) {
    console.error("Error fetching certificate:", error)
    return NextResponse.json({ error: "Failed to fetch certificate" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, issuer, date, link, imageUrl } = await req.json()

    const { id } = await params

    // Check if certificate exists and belongs to user
    const existingCertificate = await prisma.certificate.findFirst({
      where: {
        id,
        userId: session.user.id as string,
      },
    })

    if (!existingCertificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
    }

    const updatedCertificate = await prisma.certificate.update({
      where: {
        id,
      },
      data: {
        name,
        issuer,
        date: new Date(date),
        link,
        imageUrl,
      },
    })

    return NextResponse.json({ certificate: updatedCertificate })
  } catch (error) {
    console.error("Error updating certificate:", error)
    return NextResponse.json({ error: "Failed to update certificate" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Check if certificate exists and belongs to user
    const existingCertificate = await prisma.certificate.findFirst({
      where: {
        id,
        userId: session.user.id as string,
      },
    })

    if (!existingCertificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
    }

    await prisma.certificate.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting certificate:", error)
    return NextResponse.json({ error: "Failed to delete certificate" }, { status: 500 })
  }
}

