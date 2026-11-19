import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

import type { PrismaClient } from "@prisma/client"

import { ADMIN_ROLE } from "@/lib/authz"
import prisma from "@/lib/db"
import {
  classifyRegistrationError,
  decideRegistration,
  evaluateRegistrationRequest,
  REGISTRATION_CLOSED_MESSAGE,
  type RegistrationDecision,
} from "@/lib/registration-policy"

/**
 * Self-service registration is off by default. Only ALLOW_REGISTRATION="true" enables it.
 * The very first account is only accepted for the address in ADMIN_BOOTSTRAP_EMAIL and becomes
 * the admin; without that variable a fresh installation stays closed.
 */
function isRegistrationEnabled(): boolean {
  return process.env.ALLOW_REGISTRATION === "true"
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

async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json()
  } catch {
    return undefined
  }
}

export async function POST(req: Request) {
  try {
    const userCount = await prisma.user.count()

    if (userCount > 0 && !isRegistrationEnabled()) {
      return registrationClosed({ outcome: "closed" })
    }

    // On an empty database the bootstrap address is checked before any other validation, so
    // broken JSON, missing fields and wrong addresses all get the same 403.
    const gate = evaluateRegistrationRequest({
      existingUsers: userCount,
      registrationEnabled: isRegistrationEnabled(),
      bootstrapEmail: process.env.ADMIN_BOOTSTRAP_EMAIL,
      body: await readJson(req),
    })

    if (gate.outcome === "refuse") {
      return registrationClosed(gate.decision)
    }

    if (gate.outcome === "invalid") {
      return NextResponse.json({ error: gate.error }, { status: 400 })
    }

    const { email, password, name } = gate

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

    const result = await prisma.$transaction(
      async (tx: PrismaClient) => {
        // Re-decided inside the transaction so concurrent requests cannot bypass the switch or
        // the bootstrap address, e.g. two parallel first registrations.
        const decision = decideRegistration({
          existingUsers: await tx.user.count(),
          registrationEnabled: isRegistrationEnabled(),
          email,
          bootstrapEmail: process.env.ADMIN_BOOTSTRAP_EMAIL,
        })

        if (decision.outcome !== "create") {
          return { decision, user: null }
        }

        const user = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            name,
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
    const failure = classifyRegistrationError(error)
    console.error(`Error in register route: ${failure.code} (${failure.reason})`)
    return NextResponse.json({ error: failure.message }, { status: failure.status })
  }
}
