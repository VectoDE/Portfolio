import { NextResponse } from "next/server"

import { requireSession } from "@/lib/authz"
import prisma from "@/lib/db"

// GET /api/user/profile - Get user profile
export async function GET(_req: Request) {
  try {
    const auth = await requireSession()

    if (!auth.ok) {
      return auth.response
    }

    const { session } = auth

    const userId = session.user.id as string

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
        username: true,
        role: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

const USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,24}$/

type UsernameResult =
  | { error: string; value?: undefined }
  | { error?: undefined; value: string | null | undefined }

async function normalizeUsername(username: unknown, userId: string): Promise<UsernameResult> {
  if (typeof username !== "string") {
    return { value: undefined }
  }

  const trimmed = username.trim()

  if (trimmed.length === 0) {
    return { value: null }
  }

  if (!USERNAME_PATTERN.test(trimmed)) {
    return {
      error:
        "Usernames may only contain letters, numbers, dots, underscores, and hyphens (3-24 characters).",
    }
  }

  const existingUsername = await prisma.user.findFirst({
    where: {
      username: trimmed,
      NOT: { id: userId },
    },
    select: { id: true },
  })

  if (existingUsername) {
    return { error: "This username is already taken" }
  }

  return { value: trimmed }
}

// PUT /api/user/profile - Update user profile
export async function PUT(req: Request) {
  try {
    const auth = await requireSession()

    if (!auth.ok) {
      return auth.response
    }

    const { session } = auth

    const userId = session.user.id as string
    const data = await req.json()
    const { name, email, imageUrl, username } = data

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json({ error: "Email is already in use" }, { status: 400 })
      }
    }

    const usernameResult = await normalizeUsername(username, userId)

    if (usernameResult.error) {
      return NextResponse.json({ error: usernameResult.error }, { status: 400 })
    }

    const normalizedUsername = usernameResult.value

    const updateData: {
      name: string
      email: string
      imageUrl: string | null
      username?: string | null
    } = {
      name,
      email,
      imageUrl: imageUrl?.trim() ? imageUrl.trim() : null,
    }

    if (normalizedUsername !== undefined) {
      updateData.username = normalizedUsername
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      username: updatedUser.username,
      imageUrl: updatedUser.imageUrl,
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
