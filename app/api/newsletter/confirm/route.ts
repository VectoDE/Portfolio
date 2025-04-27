import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { sendWelcomeEmail } from "@/lib/newsletter"

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const token = searchParams.get("token")

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

        // If already confirmed, just return success
        if (subscriber.isConfirmed) {
            return NextResponse.json({
                message: "Your subscription is already confirmed",
            })
        }

        // Update subscriber to confirmed status
        await prisma.subscriber.update({
            where: { id: subscriber.id },
            data: { isConfirmed: true },
        })

        // Send welcome email
        await sendWelcomeEmail(subscriber.email, subscriber.name || "")

        return NextResponse.json({
            message: "Your subscription has been confirmed successfully",
        })
    } catch (error) {
        console.error("Subscription confirmation error:", error)
        return NextResponse.json({ error: "Failed to confirm subscription" }, { status: 500 })
    }
}
