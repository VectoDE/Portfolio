import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

import prisma from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword }, { status: 201 })
  } catch (error) {
    console.error("Error in register route:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

