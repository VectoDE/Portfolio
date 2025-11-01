import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { z } from "zod"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { sendContactNotification, sendContactAutoReply } from "@/lib/email"

const sanitizeText = (value: string) => value.replace(/[<>]/g, "")

const contactPayloadSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name must be 120 characters or fewer")
    .transform(sanitizeText),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("A valid email address is required")
    .max(254)
    .transform((value) => value.toLowerCase()),
  subject: z
    .preprocess(
      (value) => {
        if (typeof value !== "string") {
          return undefined
        }
        const trimmed = value.trim()
        if (!trimmed) {
          return undefined
        }
        return sanitizeText(trimmed)
      },
      z
        .string()
        .min(2, "Subject must be at least 2 characters")
        .max(160, "Subject must be 160 characters or fewer"),
    )
    .optional(),
  message: z
    .string({ required_error: "Message is required" })
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must be 5000 characters or fewer")
    .transform(sanitizeText),
})

const allowedStatuses = new Set(["unread", "read", "replied", "archived"])

// POST /api/contacts - Create a new contact message (public)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsedBody = contactPayloadSchema.safeParse(body)

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsedBody.error.flatten() },
        { status: 400 },
      )
    }

    const { name, email, subject, message } = parsedBody.data

    // Create the contact message
    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        subject: subject ?? null,
        message,
        status: "unread",
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
    const requestedStatus = searchParams.get("status")
    const status = requestedStatus && allowedStatuses.has(requestedStatus) ? requestedStatus : undefined
    const parsedPage = Number.parseInt(searchParams.get("page") || "1", 10)
    const parsedLimit = Number.parseInt(searchParams.get("limit") || "10", 10)
    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 100) : 10
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
