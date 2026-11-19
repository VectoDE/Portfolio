// Fills the database with the portfolio content from content/*.json.
//
//   node prisma/seed.mjs            create missing entries, leave existing ones untouched
//   node prisma/seed.mjs --update   also overwrite existing entries with the JSON content
//
// Content is attached to the first admin account. Without any account the script
// creates one from SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD; both are required then,
// and the password must pass the registration rule (lib/password-policy.mjs).
// The script never generates or prints a password.
import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

import { validatePassword } from "../lib/password-policy.mjs"

const ADMIN_ROLE = "Admin"
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const update = process.argv.includes("--update")

async function readContent(name) {
  const file = path.join(root, "content", `${name}.json`)
  return JSON.parse(await readFile(file, "utf8"))
}

// Mirrors projectTimestamp() in lib/content.ts so the list order matches the fallback.
const CONTENT_TIMESTAMP = Date.parse("2026-11-19T00:00:00.000Z")
const projectCreatedAt = (index) => new Date(CONTENT_TIMESTAMP - index * 60_000)

async function resolveOwner(prisma) {
  const admin = await prisma.user.findFirst({ where: { role: ADMIN_ROLE }, orderBy: { createdAt: "asc" } })
  if (admin) return admin

  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase()
  if (!email) {
    throw new Error("No admin account found. Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to create the admin account for the content.")
  }

  const password = process.env.SEED_ADMIN_PASSWORD
  if (!password) {
    throw new Error("No admin account found and SEED_ADMIN_PASSWORD is not set. Set it to the password for the new admin account.")
  }
  const passwordError = validatePassword(password)
  if (passwordError) {
    throw new Error(`SEED_ADMIN_PASSWORD: ${passwordError}`)
  }
  const profile = await readContent("profile")
  return prisma.user.create({
    data: {
      email,
      password: await bcrypt.hash(password, 12),
      name: profile.name,
      username: profile.handle,
      role: ADMIN_ROLE,
    },
  })
}

async function upsert(model, id, data) {
  const existing = await model.findUnique({ where: { id }, select: { id: true } })
  if (!existing) {
    await model.create({ data: { id, ...data } })
    return "created"
  }
  if (!update) return "kept"
  await model.update({ where: { id }, data })
  return "updated"
}

function tally(results) {
  return results.reduce((acc, result) => ({ ...acc, [result]: (acc[result] ?? 0) + 1 }), {})
}

async function main() {
  const prisma = new PrismaClient()
  try {
    const owner = await resolveOwner(prisma)
    const [projects, skills, career, certificates] = await Promise.all([
      readContent("projects"),
      readContent("skills"),
      readContent("career"),
      readContent("certificates"),
    ])

    const projectResults = []
    for (const [index, project] of projects.entries()) {
      const result = await upsert(prisma.project, project.id, {
        title: project.title,
        description: project.description,
        technologies: project.technologies.join(", "),
        link: project.link,
        githubUrl: project.githubUrl,
        featured: project.featured,
        developmentProcess: project.developmentProcess,
        challengesFaced: project.challengesFaced,
        futurePlans: project.futurePlans,
        createdAt: projectCreatedAt(index),
        userId: owner.id,
      })
      if (result !== "kept") {
        await prisma.projectFeature.deleteMany({ where: { projectId: project.id } })
        await prisma.projectFeature.createMany({
          data: project.features.map((feature, featureIndex) => ({
            id: `${project.id}-feature-${featureIndex + 1}`,
            name: feature.name,
            description: feature.description,
            projectId: project.id,
          })),
        })
      }
      projectResults.push(result)
    }

    const skillResults = []
    for (const skill of skills) {
      skillResults.push(
        await upsert(prisma.skill, skill.id, {
          name: skill.name,
          category: skill.category,
          level: skill.level,
          years: 0,
          iconName: null,
          userId: owner.id,
        }),
      )
    }

    const careerResults = []
    for (const entry of career) {
      careerResults.push(
        await upsert(prisma.career, entry.id, {
          position: entry.position,
          company: entry.company,
          startDate: new Date(entry.startDate),
          endDate: entry.endDate,
          description: entry.description,
          location: entry.location,
          userId: owner.id,
        }),
      )
    }

    const certificateResults = []
    for (const certificate of certificates) {
      certificateResults.push(
        await upsert(prisma.certificate, certificate.id, {
          name: certificate.name,
          issuer: certificate.issuer,
          date: new Date(certificate.date),
          link: certificate.link,
          userId: owner.id,
        }),
      )
    }

    console.log("Seed finished", {
      mode: update ? "update" : "create-only",
      projects: tally(projectResults),
      skills: tally(skillResults),
      career: tally(careerResults),
      certificates: tally(certificateResults),
    })
  } finally {
    await prisma.$disconnect()
  }
}

try {
  await main()
} catch (error) {
  console.error(error.message ?? error)
  process.exitCode = 1
}
