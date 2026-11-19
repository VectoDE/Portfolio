import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

import type { PrismaClient } from "@prisma/client"

import { ADMIN_ROLE } from "@/lib/authz"
import prisma from "@/lib/db"
import { validatePassword } from "@/lib/password-policy"

const REGISTRATION_CLOSED_MESSAGE = "Registration is currently closed."

/**
 * Self-service registration is off by default. Only ALLOW_REGISTRATION="true" enables it.
 * The very first account can always be created so that a fresh installation can be set up.
 */
function isRegistrationEnabled(): boolean {
  return process.env.ALLOW_REGISTRATION === "true"
}

function registrationClosed() {
  return NextResponse.json({ error: REGISTRATION_CLOSED_MESSAGE }, { status: 403 })
}

export async function POST(req: Request) {
  try {
    if (!isRegistrationEnabled() && (await prisma.user.count()) > 0) {
      return registrationClosed()
    }

    const { email, password, name } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : ""

    if (!normalizedEmail) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 })
    }

    const passwordError = validatePassword(password)

    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const sanitizedName = typeof name === "string" ? name.trim() : null

    const user = await prisma.$transaction(
      async (tx: PrismaClient) => {
        const existingUsers = await tx.user.count()

        // Re-checked inside the transaction so concurrent requests cannot bypass the switch.
        if (existingUsers > 0 && !isRegistrationEnabled()) {
          return null
        }

        const role = existingUsers === 0 ? ADMIN_ROLE : "Member"

        return tx.user.create({
          data: {
            email: normalizedEmail,
            password: hashedPassword,
            name: sanitizedName,
            role,
          },
        })
      },
      { isolationLevel: "Serializable" },
    )

    if (!user) {
      return registrationClosed()
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword }, { status: 201 })
  } catch (error) {
    console.error("Error in register route:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
