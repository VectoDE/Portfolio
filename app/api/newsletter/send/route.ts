import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { sendEmail } from "@/lib/email"

export async function POST(req: Request) {
    try {
        const { type, contentId, title, description } = await req.json()

        // Validate required fields
        if (!type || !contentId || !title) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Check if announcements are enabled for this content type
        const announcementSettings = await prisma.announcementSettings.findFirst({
            where: { userId: "admin" }, // Assuming admin user manages announcements
        })

        if (!announcementSettings) {
            return NextResponse.json({ error: "Announcement settings not found" }, { status: 404 })
        }

        // Check if this type of announcement is enabled
        let isEnabled = false
        switch (type) {
            case "project":
                isEnabled = announcementSettings.newProjects
                break
            case "certificate":
                isEnabled = announcementSettings.newCertificates
                break
            case "skill":
                isEnabled = announcementSettings.newSkills
                break
            case "career":
                isEnabled = announcementSettings.newCareers
                break
            default:
                return NextResponse.json({ error: "Invalid content type" }, { status: 400 })
        }

        if (!isEnabled) {
            return NextResponse.json({
                message: `Announcements for ${type} are disabled`,
                sent: false,
            })
        }

        // Get all confirmed subscribers with their preferences
        const subscribers = await prisma.subscriber.findMany({
            where: { isConfirmed: true },
            include: { preferences: true },
        })

        if (subscribers.length === 0) {
            return NextResponse.json({
                message: "No subscribers found",
                sent: false,
            })
        }

        // Filter subscribers based on their preferences
        const eligibleSubscribers = subscribers.filter((subscriber) => {
            if (!subscriber.preferences) return true // Default to all if no preferences

            switch (type) {
                case "project":
                    return subscriber.preferences.projects
                case "certificate":
                    return subscriber.preferences.certificates
                case "skill":
                    return subscriber.preferences.skills
                case "career":
                    return subscriber.preferences.careers
                default:
                    return false
            }
        })

        if (eligibleSubscribers.length === 0) {
            return NextResponse.json({
                message: "No eligible subscribers found",
                sent: false,
            })
        }

        // Send emails to eligible subscribers
        let sentCount = 0
        for (const subscriber of eligibleSubscribers) {
            try {
                // Create unsubscribe link with token
                const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?token=${subscriber.token}`

                // Prepare email content
                const emailContent = `
          <h1>New ${type.charAt(0).toUpperCase() + type.slice(1)}: ${title}</h1>
          ${description ? `<p>${description}</p>` : ""}
          <p>View more details on our website.</p>
          <p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/${type}s/${contentId}" style="display: inline-block; padding: 10px 20px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 4px;">
              View Details
            </a>
          </p>
          <hr />
          <p style="font-size: 12px; color: #666;">
            You're receiving this email because you subscribed to our newsletter.
            <br />
            <a href="${unsubscribeUrl}">Unsubscribe</a> or <a href="${unsubscribeUrl}">manage your preferences</a>.
          </p>
        `

                // Send the email
                await sendEmail({
                    to: subscriber.email,
                    subject: `New ${type.charAt(0).toUpperCase() + type.slice(1)}: ${title}`,
                    html: emailContent,
                })

                sentCount++
            } catch (error) {
                console.error(`Failed to send email to ${subscriber.email}:`, error)
            }
        }

        return NextResponse.json({
            message: `Newsletter sent to ${sentCount} subscribers`,
            sent: true,
            sentCount,
        })
    } catch (error) {
        console.error("Error sending newsletter:", error)
        return NextResponse.json({ error: "Failed to send newsletter" }, { status: 500 })
    }
}
