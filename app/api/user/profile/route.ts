import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

// GET /api/user/profile - Get user profile
export async function GET(_req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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

// PUT /api/user/profile - Update user profile
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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

    let normalizedUsername: string | null | undefined = undefined

    if (typeof username === "string") {
      const trimmed = username.trim()

      if (trimmed.length === 0) {
        normalizedUsername = null
      } else {
        const usernamePattern = /^[a-zA-Z0-9._-]{3,24}$/

        if (!usernamePattern.test(trimmed)) {
          return NextResponse.json(
            {
              error: "Usernames may only contain letters, numbers, dots, underscores, and hyphens (3-24 characters).",
            },
            { status: 400 },
          )
        }

        const existingUsername = await prisma.user.findFirst({
          where: {
            username: trimmed,
            NOT: { id: userId },
          },
          select: { id: true },
        })

        if (existingUsername) {
          return NextResponse.json({ error: "This username is already taken" }, { status: 400 })
        }

        normalizedUsername = trimmed
      }
    }

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
