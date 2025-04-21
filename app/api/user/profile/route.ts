import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/db"

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, email, imageUrl } = await req.json()

    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (existingUser) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 })
      }
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id as string,
      },
      data: {
        name,
        email,
        imageUrl,
      },
    })

    const { password: _, ...userWithoutPassword } = updatedUser

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

