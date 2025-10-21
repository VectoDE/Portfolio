import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { sendContactNotification, sendContactAutoReply } from "@/lib/email"

// POST /api/contacts - Create a new contact message (public)
export async function POST(req: Request) {
  try {
    const { name, email, subject, message, status, createdAt } = await req.json()

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create the contact message
    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        subject,
        message,
        status: status || "unread",
        createdAt: createdAt || new Date(),
      },
    })

    // Send email notification to admin
    const notificationResult = await sendContactNotification({
      name,
      email,
      subject,
      message,
    })

    // Send auto-reply to the contact
    if (process.env.SEND_AUTO_REPLY === "true") {
      await sendContactAutoReply({
        name,
        email,
      })
    }

    // Log email sending result
    if (!notificationResult.success) {
      console.error("Failed to send email notification:", notificationResult.error)
    }

    return NextResponse.json({ contact }, { status: 201 })
  } catch (error) {
    console.error("Error creating contact:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// GET /api/contacts - Get all contacts (protected)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Build the query
    const where = status ? { status } : {}

    // Get contacts with pagination
    const contacts = await prisma.contact.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    })

    // Get total count for pagination
    const total = await prisma.contact.count({ where })

    return NextResponse.json({
      contacts,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    })
  } catch (error) {
    console.error("Error fetching contacts:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
