import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import nodemailer from "nodemailer"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

// POST /api/settings/email/test - Send a test email
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const { email } = data

    if (!email) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 })
    }

    const emailSettings = await prisma.emailSettings.findFirst()

    if (!emailSettings) {
      return NextResponse.json({ error: "Email settings not found" }, { status: 404 })
    }

    let transporter
    if (
      emailSettings.smtpServer &&
      emailSettings.smtpPort &&
      emailSettings.smtpUser &&
      emailSettings.smtpPassword
    ) {
      transporter = nodemailer.createTransport({
        host: emailSettings.smtpServer,
        port: Number(emailSettings.smtpPort),
        secure: Number(emailSettings.smtpPort) === 465,
        auth: {
          user: emailSettings.smtpUser,
          pass: emailSettings.smtpPassword,
        },
      })
    } else {
      const testAccount = await nodemailer.createTestAccount()
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      })
    }

    // Send test email
    const info = await transporter.sendMail({
      from: emailSettings.emailFrom || "Test <test@example.com>",
      to: email,
      subject: "Test Email from Your Portfolio",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Test Email</h2>
          
          <div style="margin: 20px 0;">
            <p>This is a test email from your portfolio website.</p>
            <p>If you received this email, your email notification settings are working correctly.</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
            <p>This is an automated test email from your portfolio website.</p>
          </div>
        </div>
      `,
      text: `
        Test Email
        
        This is a test email from your portfolio website.
        If you received this email, your email notification settings are working correctly.
        
        This is an automated test email from your portfolio website.
      `,
    })

    if (process.env.NODE_ENV !== "production" && info.messageId) {
      console.log("Email preview URL: %s", nodemailer.getTestMessageUrl(info))
    }

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      previewUrl: process.env.NODE_ENV !== "production" ? nodemailer.getTestMessageUrl(info) : null,
    })
  } catch (error) {
    console.error("Error sending test email:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
