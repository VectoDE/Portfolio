import { NextResponse } from "next/server"
import { createHash, randomBytes, timingSafeEqual } from "node:crypto"
import bcrypt from "bcryptjs"

import { ADMIN_ROLE } from "@/lib/authz"
import prisma from "@/lib/db"

const SEED_ADMIN_EMAIL = "admin@example.com"
const SEED_TOKEN_HEADER = "x-seed-token"

function notFound() {
  return NextResponse.json({ error: "Not found" }, { status: 404 })
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest()
}

function hasValidSeedToken(req: Request, expectedToken: string): boolean {
  const providedToken = req.headers.get(SEED_TOKEN_HEADER)

  if (!providedToken) {
    return false
  }

  // Hashing both values gives equal-length buffers, as required by timingSafeEqual.
  return timingSafeEqual(digest(providedToken), digest(expectedToken))
}

// POST /api/seed - Populate a development database with sample content.
// Disabled in production and without a configured SEED_TOKEN.
export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return notFound()
  }

  const seedToken = process.env.SEED_TOKEN

  if (!seedToken || !hasValidSeedToken(req, seedToken)) {
    return notFound()
  }

  try {
    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: SEED_ADMIN_EMAIL,
      },
    })

    if (existingUser) {
      return NextResponse.json({ message: "Seed data already exists" })
    }

    const configuredPassword = process.env.SEED_ADMIN_PASSWORD
    const generatedPassword = configuredPassword ? undefined : randomBytes(18).toString("base64url")
    const adminPassword = generatedPassword ?? configuredPassword ?? ""

    // Create admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    const user = await prisma.user.create({
      data: {
        email: SEED_ADMIN_EMAIL,
        password: hashedPassword,
        name: "Admin User",
        role: ADMIN_ROLE,
      },
    })

    // Create sample projects
    await prisma.project.createMany({
      data: [
        {
          title: "E-commerce Platform",
          description: "A modern e-commerce platform with advanced features",
          technologies: "Next.js, TypeScript, Tailwind CSS, Prisma",
          link: "https://example.com/project1",
          featured: true,
          userId: user.id,
        },
        {
          title: "Task Management App",
          description: "A collaborative task management application",
          technologies: "React, Node.js, Express, MongoDB",
          link: "https://example.com/project2",
          featured: true,
          userId: user.id,
        },
        {
          title: "Real-time Chat Application",
          description: "A real-time messaging platform with video calls",
          technologies: "Next.js, Socket.io, WebRTC, Supabase",
          link: "https://example.com/project3",
          featured: true,
          userId: user.id,
        },
      ],
    })

    // Create sample certificates
    await prisma.certificate.createMany({
      data: [
        {
          name: "AWS Certified Solutions Architect",
          issuer: "Amazon Web Services",
          date: new Date("2023-05-15"),
          link: "https://example.com/cert1",
          userId: user.id,
        },
        {
          name: "Professional Scrum Master I",
          issuer: "Scrum.org",
          date: new Date("2022-11-10"),
          link: "https://example.com/cert2",
          userId: user.id,
        },
        {
          name: "Google Professional Cloud Developer",
          issuer: "Google Cloud",
          date: new Date("2023-02-22"),
          link: "https://example.com/cert3",
          userId: user.id,
        },
      ],
    })

    // Create sample skills
    await prisma.skill.createMany({
      data: [
        {
          name: "React",
          category: "Frontend",
          level: "Expert",
          years: 4,
          userId: user.id,
        },
        {
          name: "Node.js",
          category: "Backend",
          level: "Advanced",
          years: 3,
          userId: user.id,
        },
        {
          name: "TypeScript",
          category: "Language",
          level: "Expert",
          years: 3,
          userId: user.id,
        },
        {
          name: "Next.js",
          category: "Frontend",
          level: "Advanced",
          years: 2,
          userId: user.id,
        },
        {
          name: "PostgreSQL",
          category: "Database",
          level: "Intermediate",
          years: 3,
          userId: user.id,
        },
      ],
    })

    // Create sample career entries
    await prisma.career.createMany({
      data: [
        {
          position: "Senior Full Stack Developer",
          company: "Tech Innovations Inc.",
          startDate: new Date("2021-06-01"),
          endDate: "Present",
          description:
            "Leading the development of enterprise web applications using Next.js, React, and Node.js.",
          userId: user.id,
        },
        {
          position: "Full Stack Developer",
          company: "Digital Solutions Ltd.",
          startDate: new Date("2019-03-15"),
          endDate: "2021-05-30",
          description:
            "Developed and maintained multiple client projects using React, Express, and MongoDB.",
          userId: user.id,
        },
        {
          position: "Frontend Developer",
          company: "WebCraft Agency",
          startDate: new Date("2017-09-01"),
          endDate: "2019-03-01",
          description:
            "Created responsive web interfaces for various clients using HTML, CSS, and JavaScript.",
          userId: user.id,
        },
      ],
    })

    return NextResponse.json(
      {
        message: "Database seeded successfully",
        email: SEED_ADMIN_EMAIL,
        // Only returned once, when no SEED_ADMIN_PASSWORD was configured.
        ...(generatedPassword ? { generatedPassword } : {}),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 })
  }
}
