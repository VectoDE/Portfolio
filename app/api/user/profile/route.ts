import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
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
    const { name, email, imageUrl } = data

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

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        ...(imageUrl && imageUrl !== session.user.image ? { imageUrl } : {}),
      },
    })

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      imageUrl: updatedUser.imageUrl,
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
