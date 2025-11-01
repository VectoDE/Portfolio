import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

type SubscriberPreferences = {
  projects: boolean
  certificates: boolean
  skills: boolean
  careers: boolean
}

const DEFAULT_PREFERENCES: SubscriberPreferences = {
  projects: true,
  certificates: true,
  skills: true,
  careers: true,
}

const PREFERENCE_FIELDS = Object.keys(
  DEFAULT_PREFERENCES,
) as (keyof SubscriberPreferences)[]

function sanitizePreferences(
  preferences?: Partial<SubscriberPreferences> | null,
): SubscriberPreferences {
  return PREFERENCE_FIELDS.reduce((acc, key) => {
    const value = preferences?.[key]
    if (typeof value === "boolean") {
      acc[key] = value
    }

    return acc
  }, { ...DEFAULT_PREFERENCES })
}

type SubscriberRecord = {
  id: string
  email: string
  isConfirmed: boolean
  createdAt: Date | string
  preferences?: SubscriberPreferences | null
}

function formatSubscriber(sub: SubscriberRecord) {
  return {
    id: sub.id,
    email: sub.email,
    confirmed: sub.isConfirmed,
    createdAt: sub.createdAt,
    preferences: sanitizePreferences(sub.preferences ?? undefined),
  }
}

export async function GET(_req: Request) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all subscribers with their preferences
    const subscribers = (await prisma.subscriber.findMany({
      include: { preferences: true },
      orderBy: { createdAt: "desc" },
    })) as SubscriberRecord[]

    return NextResponse.json({
      subscribers: subscribers.map((sub) => formatSubscriber(sub)),
    })
  } catch (error) {
    console.error("Error fetching subscribers:", error)
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { ids } = (await req.json()) as { ids?: string[] }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No subscriber ids provided" }, { status: 400 })
    }

    await prisma.subscriber.deleteMany({
      where: {
        id: { in: ids },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting subscribers:", error)
    return NextResponse.json({ error: "Failed to delete subscribers" }, { status: 500 })
  }
}

type UpdateSubscriberPayload = {
  id?: string
  isConfirmed?: boolean
  preferences?: Partial<SubscriberPreferences>
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, isConfirmed, preferences } = (await req.json()) as UpdateSubscriberPayload

    if (!id) {
      return NextResponse.json({ error: "Subscriber id is required" }, { status: 400 })
    }

    const preferenceUpdates = preferences
      ? Object.entries(preferences).reduce<Partial<SubscriberPreferences>>(
          (acc, [key, value]) => {
            if (
              PREFERENCE_FIELDS.includes(key as keyof SubscriberPreferences) &&
              typeof value === "boolean"
            ) {
              acc[key as keyof SubscriberPreferences] = value
            }

            return acc
          },
          {},
        )
      : null

    const subscriber = await prisma.subscriber.update({
      where: { id },
      data: {
        ...(typeof isConfirmed === "boolean" ? { isConfirmed } : {}),
        ...(preferenceUpdates && Object.keys(preferenceUpdates).length > 0
          ? {
              preferences: {
                upsert: {
                  update: preferenceUpdates,
                  create: sanitizePreferences(preferences ?? undefined),
                },
              },
            }
          : {}),
      },
      include: { preferences: true },
    })

    return NextResponse.json({ subscriber: formatSubscriber(subscriber as SubscriberRecord) })
  } catch (error) {
    console.error("Error updating subscriber:", error)
    return NextResponse.json({ error: "Failed to update subscriber" }, { status: 500 })
  }
}
