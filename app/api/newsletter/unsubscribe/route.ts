import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { sendUnsubscribeConfirmation } from "@/lib/newsletter"

export async function POST(req: Request) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }

    // Find subscriber by token
    const subscriber = await prisma.subscriber.findUnique({
      where: { token },
    })

    if (!subscriber) {
      return NextResponse.json({ error: "Invalid subscription token" }, { status: 404 })
    }

    // Store email for confirmation
    const email = subscriber.email
    const name = subscriber.name

    // Delete subscriber
    await prisma.subscriber.delete({
      where: { id: subscriber.id },
    })

    // Send unsubscribe confirmation
    await sendUnsubscribeConfirmation(email, name || "")

    return NextResponse.json({
      message: "You have been successfully unsubscribed from the newsletter",
    })
  } catch (error) {
    console.error("Unsubscribe error:", error)
    return NextResponse.json({ error: "Failed to process unsubscribe request" }, { status: 500 })
  }
}
