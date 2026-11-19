/**
 * Static portfolio content from `content/*.json`.
 *
 * The same files feed `prisma/seed.mjs`, so a seeded database and the
 * fallback below show identical data. Public pages read from the database
 * first and use this content only when no database is configured or a query
 * fails (for example on preview deployments without a database).
 */
import careerData from "@/content/career.json"
import certificatesData from "@/content/certificates.json"
import profileData from "@/content/profile.json"
import projectsData from "@/content/projects.json"
import skillsData from "@/content/skills.json"
import type { Career, Certificate, Project, Skill } from "@/types/database"

export const CONTENT_OWNER_ID = "content-owner"

// A fixed timestamp keeps fallback output stable between requests and builds.
const CONTENT_TIMESTAMP = "2026-11-19T00:00:00.000Z"

export type ProfileContent = typeof profileData
export type ProjectContent = (typeof projectsData)[number]
export type CertificateContent = (typeof certificatesData)[number]
export type SkillContent = (typeof skillsData)[number]

export const profile: ProfileContent = profileData

/** True when a database URL is configured for this runtime. */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0)
}

/**
 * Runs a database read and falls back to static content when no database is
 * configured or the read throws. An empty result from a reachable database is
 * returned as is, so content removed in the dashboard stays removed.
 */
let missingDatabaseWarned = false

export async function withContentFallback<T>(read: () => Promise<T>, fallback: () => T, label: string): Promise<T> {
  if (!isDatabaseConfigured()) {
    // Previews run without a database on purpose. In production the same
    // state usually means a missing env var, so say so once per process.
    if (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV === "production" && !missingDatabaseWarned) {
      missingDatabaseWarned = true
      console.warn("DATABASE_URL is not set in production, public pages show static content")
    }
    return fallback()
  }

  try {
    return await read()
  } catch (error) {
    console.error(`Database read failed for ${label}, using static content`, error)
    return fallback()
  }
}

// Projects are listed newest first; the array order in projects.json is the
// intended order, so later entries get older timestamps.
function projectTimestamp(index: number): string {
  const base = Date.parse(CONTENT_TIMESTAMP)
  return new Date(base - index * 60_000).toISOString()
}

export function getContentProjects(): Project[] {
  return projectsData.map((project, index) => {
    const timestamp = projectTimestamp(index)
    return {
      id: project.id,
      title: project.title,
      description: project.description,
      technologies: project.technologies.join(", "),
      link: project.link,
      imageUrl: null,
      logoUrl: null,
      githubUrl: project.githubUrl,
      featured: project.featured,
      developmentProcess: project.developmentProcess,
      challengesFaced: project.challengesFaced,
      futurePlans: project.futurePlans,
      logContent: null,
      createdAt: timestamp,
      updatedAt: CONTENT_TIMESTAMP,
      userId: CONTENT_OWNER_ID,
      features: project.features.map((feature, featureIndex) => ({
        id: `${project.id}-feature-${featureIndex + 1}`,
        name: feature.name,
        description: feature.description,
        projectId: project.id,
        createdAt: timestamp,
        updatedAt: CONTENT_TIMESTAMP,
      })),
    }
  })
}

export function getContentSkills(): Skill[] {
  return skillsData.map((skill) => ({
    id: skill.id,
    name: skill.name,
    category: skill.category,
    level: skill.level,
    years: 0,
    iconName: null,
    createdAt: CONTENT_TIMESTAMP,
    updatedAt: CONTENT_TIMESTAMP,
    userId: CONTENT_OWNER_ID,
  }))
}

export function getContentCareer(): Career[] {
  return careerData
    .map((entry) => ({
      id: entry.id,
      position: entry.position,
      company: entry.company,
      startDate: entry.startDate,
      endDate: entry.endDate,
      description: entry.description,
      logoUrl: null,
      location: entry.location,
      createdAt: CONTENT_TIMESTAMP,
      updatedAt: CONTENT_TIMESTAMP,
      userId: CONTENT_OWNER_ID,
    }))
    .sort((a, b) => Date.parse(b.startDate) - Date.parse(a.startDate))
}

export function getContentCertificates(): Certificate[] {
  return certificatesData
    .map((certificate) => ({
      id: certificate.id,
      name: certificate.name,
      issuer: certificate.issuer,
      date: certificate.date,
      link: certificate.link,
      imageUrl: null,
      createdAt: CONTENT_TIMESTAMP,
      updatedAt: CONTENT_TIMESTAMP,
      userId: CONTENT_OWNER_ID,
    }))
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
}
