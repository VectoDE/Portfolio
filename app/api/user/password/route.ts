import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

import { requireSession } from "@/lib/authz"
import prisma from "@/lib/db"
import { validatePassword } from "@/lib/password-policy"

// PUT /api/user/password - Update user password
export async function PUT(req: Request) {
  try {
    const auth = await requireSession()

    if (!auth.ok) {
      return auth.response
    }

    const { session } = auth

    const userId = session.user.id as string
    const data = await req.json()
    const { currentPassword, newPassword } = data

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 },
      )
    }

    const passwordError = validatePassword(newPassword)

    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    })
  } catch (error) {
    console.error("Error updating password:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
