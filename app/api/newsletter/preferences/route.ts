import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import prisma from "@/lib/db"
import { authOptions } from "@/lib/auth"

const DEFAULT_SUBSCRIBER_PREFERENCES = {
  projects: true,
  certificates: true,
  skills: true,
  careers: true,
}

const DEFAULT_ANNOUNCEMENT_SETTINGS = {
  newProjects: true,
  newCertificates: true,
  newSkills: true,
  newCareers: true,
}

type PreferencePayload = {
  projects: boolean
  certificates: boolean
  skills: boolean
  careers: boolean
}

function parsePreferences(preferences: unknown): PreferencePayload | null {
  if (!preferences || typeof preferences !== "object") {
    return null
  }

  const prefs = preferences as Record<string, unknown>

  const parsed: PreferencePayload = {
    projects: Boolean(prefs.projects),
    certificates: Boolean(prefs.certificates),
    skills: Boolean(prefs.skills),
    careers: Boolean(prefs.careers),
  }

  return parsed
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")

    if (token) {
      const subscriber = await prisma.subscriber.findUnique({
        where: { token },
        include: { preferences: true },
      })

      if (!subscriber) {
        return NextResponse.json(DEFAULT_SUBSCRIBER_PREFERENCES)
      }

      if (!subscriber.preferences) {
        return NextResponse.json(DEFAULT_SUBSCRIBER_PREFERENCES)
      }

      return NextResponse.json({
        projects: subscriber.preferences.projects,
        certificates: subscriber.preferences.certificates,
        skills: subscriber.preferences.skills,
        careers: subscriber.preferences.careers,
      })
    }

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const settings = await prisma.announcementSettings.findUnique({
      where: { userId: session.user.id },
    })

    if (!settings) {
      return NextResponse.json(DEFAULT_ANNOUNCEMENT_SETTINGS)
    }

    return NextResponse.json({
      newProjects: settings.newProjects,
      newCertificates: settings.newCertificates,
      newSkills: settings.newSkills,
      newCareers: settings.newCareers,
    })
  } catch (error) {
    console.error("Fetch preferences error:", error)
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { token, preferences } = await req.json()

    const parsedPreferences = parsePreferences(preferences)

    if (!parsedPreferences) {
      return NextResponse.json({ error: "Invalid preferences" }, { status: 400 })
    }

    if (session?.user?.id) {
      const updatedSettings = await prisma.announcementSettings.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          newProjects: parsedPreferences.projects,
          newCertificates: parsedPreferences.certificates,
          newSkills: parsedPreferences.skills,
          newCareers: parsedPreferences.careers,
        },
        update: {
          newProjects: parsedPreferences.projects,
          newCertificates: parsedPreferences.certificates,
          newSkills: parsedPreferences.skills,
          newCareers: parsedPreferences.careers,
        },
      })

      return NextResponse.json({
        message: "Your newsletter announcement settings have been saved.",
        preferences: {
          newProjects: updatedSettings.newProjects,
          newCertificates: updatedSettings.newCertificates,
          newSkills: updatedSettings.newSkills,
          newCareers: updatedSettings.newCareers,
        },
      })
    }

    if (!token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }

    const subscriber = await prisma.subscriber.findUnique({
      where: { token },
      include: { preferences: true },
    })

    if (!subscriber) {
      return NextResponse.json({ error: "Invalid subscription token" }, { status: 404 })
    }

    await prisma.subscriberPreference.upsert({
      where: { subscriberId: subscriber.id },
      create: {
        subscriberId: subscriber.id,
        projects: parsedPreferences.projects,
        certificates: parsedPreferences.certificates,
        skills: parsedPreferences.skills,
        careers: parsedPreferences.careers,
      },
      update: {
        projects: parsedPreferences.projects,
        certificates: parsedPreferences.certificates,
        skills: parsedPreferences.skills,
        careers: parsedPreferences.careers,
      },
    })

    return NextResponse.json({
      message: "Your newsletter preferences have been updated successfully.",
      preferences: parsedPreferences,
    })
  } catch (error) {
    console.error("Update preferences error:", error)
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 })
  }
}
