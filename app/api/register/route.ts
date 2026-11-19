import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

import type { PrismaClient } from "@prisma/client"

import { ADMIN_ROLE } from "@/lib/authz"
import prisma from "@/lib/db"
import {
  decideRegistration,
  normalizeEmail,
  type RegistrationDecision,
} from "@/lib/registration-policy"

const REGISTRATION_CLOSED_MESSAGE = "Registration is currently closed."

/**
 * Self-service registration is off by default. Only ALLOW_REGISTRATION="true" enables it.
 * The very first account is only accepted for the address in ADMIN_BOOTSTRAP_EMAIL and becomes
 * the admin; without that variable a fresh installation stays closed.
 */
function isRegistrationEnabled(): boolean {
  return process.env.ALLOW_REGISTRATION === "true"
}

function decide(existingUsers: number, email: string): RegistrationDecision {
  return decideRegistration({
    existingUsers,
    registrationEnabled: isRegistrationEnabled(),
    email,
    bootstrapEmail: process.env.ADMIN_BOOTSTRAP_EMAIL,
  })
}

/**
 * Every refusal gets the same response, so callers cannot tell whether the instance is still
 * waiting for its first account or which address it expects.
 */
function registrationClosed(decision: RegistrationDecision) {
  if (decision.outcome === "bootstrap-not-configured") {
    console.warn(
      "Initial registration refused: ADMIN_BOOTSTRAP_EMAIL is not set. Set it to the email " +
        "address of the first admin account and register with exactly that address.",
    )
  } else if (decision.outcome === "bootstrap-email-mismatch") {
    console.warn("Initial registration refused: email does not match ADMIN_BOOTSTRAP_EMAIL.")
  }

  return NextResponse.json({ error: REGISTRATION_CLOSED_MESSAGE }, { status: 403 })
}

export async function POST(req: Request) {
  try {
    const userCount = await prisma.user.count()

    if (userCount > 0 && !isRegistrationEnabled()) {
      return registrationClosed({ outcome: "closed" })
    }

    const { email, password, name } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const normalizedEmail = normalizeEmail(email)

    if (!normalizedEmail) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 })
    }

    const initialDecision = decide(userCount, normalizedEmail)

    if (initialDecision.outcome !== "create") {
      return registrationClosed(initialDecision)
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 },
      )
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

    const result = await prisma.$transaction(
      async (tx: PrismaClient) => {
        // Re-decided inside the transaction so concurrent requests cannot bypass the switch or
        // the bootstrap address, e.g. two parallel first registrations.
        const decision = decide(await tx.user.count(), normalizedEmail)

        if (decision.outcome !== "create") {
          return { decision, user: null }
        }

        const user = await tx.user.create({
          data: {
            email: normalizedEmail,
            password: hashedPassword,
            name: sanitizedName,
            role: decision.admin ? ADMIN_ROLE : "Member",
          },
        })

        return { decision, user }
      },
      { isolationLevel: "Serializable" },
    )

    if (!result.user) {
      return registrationClosed(result.decision)
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = result.user

    return NextResponse.json({ user: userWithoutPassword }, { status: 201 })
  } catch (error) {
    console.error("Error in register route:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
