import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// POST: Update preferences
export async function POST(req: Request) {
    try {
        const { token, preferences } = await req.json();

        if (!token) {
            return NextResponse.json({ error: "Invalid token" }, { status: 400 });
        }

        const subscriber = await prisma.subscriber.findUnique({
            where: { token },
            include: { preferences: true },
        });

        if (!subscriber) {
            return NextResponse.json({ error: "Invalid subscription token" }, { status: 404 });
        }

        if (subscriber.preferences) {
            await prisma.subscriberPreference.update({
                where: { id: subscriber.preferences.id },
                data: {
                    projects: preferences.projects,
                    certificates: preferences.certificates,
                    skills: preferences.skills,
                    careers: preferences.careers,
                },
            });
        } else {
            await prisma.subscriberPreference.create({
                data: {
                    subscriberId: subscriber.id,
                    projects: preferences.projects,
                    certificates: preferences.certificates,
                    skills: preferences.skills,
                    careers: preferences.careers,
                },
            });
        }

        return NextResponse.json({
            message: "Your newsletter preferences have been updated successfully",
        });
    } catch (error) {
        console.error("Update preferences error:", error);
        return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json({
                projects: true,
                certificates: true,
                skills: true,
                careers: true,
            });
        }

        const subscriber = await prisma.subscriber.findUnique({
            where: { token },
            include: { preferences: true },
        });

        if (!subscriber) {
            return NextResponse.json({
                projects: true,
                certificates: true,
                skills: true,
                careers: true,
            });
        }

        if (!subscriber.preferences) {
            // Subscriber gefunden, aber keine gespeicherten Präferenzen → Defaults
            return NextResponse.json({
                projects: true,
                certificates: true,
                skills: true,
                careers: true,
            });
        }

        // Alles okay → gib gespeicherte Präferenzen zurück
        return NextResponse.json({
            projects: subscriber.preferences.projects,
            certificates: subscriber.preferences.certificates,
            skills: subscriber.preferences.skills,
            careers: subscriber.preferences.careers,
        });
    } catch (error) {
        console.error("Fetch preferences error:", error);
        return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
    }
}

