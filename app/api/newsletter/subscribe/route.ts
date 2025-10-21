import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import prisma from "@/lib/db"
import { sendSubscriptionConfirmation } from "@/lib/newsletter"

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if subscriber already exists
    const existingSubscriber = await prisma.subscriber.findUnique({
      where: { email },
    })

    if (existingSubscriber) {
      // If already confirmed, return success
      if (existingSubscriber.isConfirmed) {
        return NextResponse.json({
          message: "You are already subscribed to the newsletter",
        })
      }

      // If not confirmed, resend confirmation email
      await sendSubscriptionConfirmation(
        existingSubscriber.email,
        existingSubscriber.name || "",
        existingSubscriber.token,
      )

      return NextResponse.json({
        message: "Confirmation email has been resent",
      })
    }

    // Create a new subscriber
    const token = randomUUID()
    const subscriber = await prisma.subscriber.create({
      data: {
        email,
        name: name || null,
        token,
        isConfirmed: false,
        preferences: {
          create: {
            projects: true,
            certificates: true,
            skills: true,
            careers: true,
          },
        },
      },
    })

    // Send confirmation email
    await sendSubscriptionConfirmation(subscriber.email, subscriber.name || "", subscriber.token)

    return NextResponse.json({
      message: "Subscription initiated. Please check your email to confirm.",
    })
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return NextResponse.json({ error: "Failed to process subscription" }, { status: 500 })
  }
}
