import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import prisma from "@/lib/db"

type SubscriberPreferences = {
    projects: boolean
    certificates: boolean
    skills: boolean
    careers: boolean
}

type SubscriberRecord = {
    id: string
    email: string
    isConfirmed: boolean
    createdAt: Date | string
    preferences?: SubscriberPreferences | null
}

export async function GET(req: Request) {
    try {
        // Get the current user session
        const session = await getServerSession()

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Get all subscribers with their preferences
        const subscribers = (await prisma.subscriber.findMany({
            include: { preferences: true },
            orderBy: { createdAt: "desc" },
        })) as SubscriberRecord[]

        return NextResponse.json({
            subscribers: subscribers.map((sub) => ({
                id: sub.id,
                email: sub.email,
                confirmed: sub.isConfirmed,
                createdAt: sub.createdAt,
                preferences: sub.preferences || {
                    projects: true,
                    certificates: true,
                    skills: true,
                    careers: true,
                },
            })),
        })
    } catch (error) {
        console.error("Error fetching subscribers:", error)
        return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 })
    }
}
