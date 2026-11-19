import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/authz"
import prisma from "@/lib/db"

// GET /api/settings/email - Get email settings
export async function GET(_req: Request) {
  try {
    const auth = await requireAdmin()

    if (!auth.ok) {
      return auth.response
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
    const auth = await requireAdmin()

    if (!auth.ok) {
      return auth.response
    }

    const data = await req.json()
    const { adminEmail, emailFrom, smtpServer, smtpPort, smtpUser, smtpPassword, sendAutoReply } =
      data

    const emailSettings = await prisma.emailSettings.findFirst()

    if (emailSettings) {
      await prisma.emailSettings.update({
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
      await prisma.emailSettings.create({
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
