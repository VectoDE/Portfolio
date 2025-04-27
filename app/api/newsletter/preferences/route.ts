import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function POST(req: Request) {
    try {
        const { token, preferences } = await req.json()

        if (!token) {
            return NextResponse.json({ error: "Invalid token" }, { status: 400 })
        }

        // Find subscriber by token
        const subscriber = await prisma.subscriber.findUnique({
            where: { token },
            include: { preferences: true },
        })

        if (!subscriber) {
            return NextResponse.json({ error: "Invalid subscription token" }, { status: 404 })
        }

        // Update preferences
        if (subscriber.preferences) {
            await prisma.subscriberPreference.update({
                where: { id: subscriber.preferences.id },
                data: {
                    projects: preferences.projects,
                    certificates: preferences.certificates,
                    skills: preferences.skills,
                    careers: preferences.careers,
                },
            })
        } else {
            await prisma.subscriberPreference.create({
                data: {
                    subscriberId: subscriber.id,
                    projects: preferences.projects,
                    certificates: preferences.certificates,
                    skills: preferences.skills,
                    careers: preferences.careers,
                },
            })
        }

        return NextResponse.json({
            message: "Your newsletter preferences have been updated successfully",
        })
    } catch (error) {
        console.error("Update preferences error:", error)
        return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 })
    }
}
