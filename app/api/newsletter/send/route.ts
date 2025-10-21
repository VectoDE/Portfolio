import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { sendEmail } from "@/lib/email"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Definiere die erlaubten Content-Typen
type ContentType = "project" | "certificate" | "skill" | "career"

// Mapping von ContentType zu Preferences-Feldnamen
const preferenceMap: Record<ContentType, "projects" | "certificates" | "skills" | "careers"> = {
    project: "projects",
    certificate: "certificates",
    skill: "skills",
    career: "careers",
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()

        const { type, contentId, title, description }: {
            type: ContentType,
            contentId: string,
            title: string,
            description?: string
        } = body

        const validTypes: ContentType[] = ["project", "certificate", "skill", "career"]
        if (!validTypes.includes(type)) {
            return NextResponse.json({ error: "Invalid content type" }, { status: 400 })
        }

        const preferenceField = preferenceMap[type]

        const subscribers = await prisma.subscriber.findMany({
            where: {
                isConfirmed: true,
                preferences: {
                    [preferenceField]: true,
                },
            },
            include: {
                preferences: true,
            },
        })

        if (subscribers.length === 0) {
            return NextResponse.json({ message: "No eligible subscribers found", sent: false })
        }

        let sentCount = 0

        for (const subscriber of subscribers) {
            try {
                const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?token=${subscriber.token}`

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

                const result = await sendEmail({
                    to: subscriber.email,
                    subject: `New ${type.charAt(0).toUpperCase() + type.slice(1)}: ${title}`,
                    html: emailContent,
                })

                if (result.success) {
                    sentCount++
                } else {
                    console.error(`Failed to send email to ${subscriber.email}:`, result.error)
                }
            } catch (err) {
                console.error(`Error sending email to ${subscriber.email}:`, err)
            }
        }

        return NextResponse.json({
            message: `Newsletter sent to ${sentCount} subscriber(s)`,
            sent: true,
            sentCount,
        })

    } catch (error) {
        console.error("Error sending newsletter:", error)
        return NextResponse.json({ error: "Failed to send newsletter" }, { status: 500 })
    }
}
