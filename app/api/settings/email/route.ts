import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/db"
import { sendTestEmail } from "@/lib/email"

// GET /api/settings/email - Get email settings
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        let emailSettings = await prisma.emailSettings.findFirst()

        if (!emailSettings) {
            emailSettings = await prisma.emailSettings.create({
                data: {
                    adminEmail: process.env.ADMIN_EMAIL || "",
                    emailFrom: process.env.EMAIL_FROM || "",
                    smtpServer: process.env.EMAIL_SERVER || "",
                    smtpPort: process.env.EMAIL_PORT || "",
                    smtpUser: process.env.EMAIL_USER || "",
                    sendAutoReply: false,
                },
            })
        }

        return NextResponse.json({
            id: emailSettings.id,
            adminEmail: emailSettings.adminEmail,
            emailFrom: emailSettings.emailFrom,
            smtpServer: emailSettings.smtpServer,
            smtpPort: emailSettings.smtpPort,
            smtpUser: emailSettings.smtpUser,
            sendAutoReply: emailSettings.sendAutoReply,
        })
    } catch (error) {
        console.error("Error fetching email settings:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

// POST /api/settings/email - Update email settings
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const data = await req.json()
        const { adminEmail, emailFrom, smtpServer, smtpPort, smtpUser, smtpPassword, sendAutoReply } = data

        let emailSettings = await prisma.emailSettings.findFirst()

        if (emailSettings) {
            emailSettings = await prisma.emailSettings.update({
                where: { id: emailSettings.id },
                data: {
                    adminEmail,
                    emailFrom,
                    smtpServer,
                    smtpPort,
                    smtpUser,
                    ...(smtpPassword ? { smtpPassword } : {}),
                    sendAutoReply,
                },
            })
        } else {
            emailSettings = await prisma.emailSettings.create({
                data: {
                    adminEmail,
                    emailFrom,
                    smtpServer,
                    smtpPort,
                    smtpUser,
                    smtpPassword: smtpPassword || "",
                    sendAutoReply,
                },
            })
        }

        return NextResponse.json({
            success: true,
            message: "Email settings updated successfully",
        })
    } catch (error) {
        console.error("Error updating email settings:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

// POST /api/settings/email/test - Send test email
export async function PUT(req: Request, { params }: { params: { test: string } }) {
    if (params.test !== "test") {
        return NextResponse.json({ error: "Invalid endpoint" }, { status: 404 })
    }

    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const data = await req.json()
        const { email } = data

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        const result = await sendTestEmail(email)

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: "Test email sent successfully",
            })
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: "Failed to send test email",
                    error: result.error,
                },
                { status: 500 },
            )
        }
        return NextResponse.json({
            success: true,
            message: "Test email route disabled",
        })
    } catch (error) {
        console.error("Error sending test email:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
