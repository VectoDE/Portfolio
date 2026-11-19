import { unstable_noStore as noStore } from "next/cache"

import { getContentProjects, withContentFallback } from "@/lib/content"
import prisma from "@/lib/db"
import type { Project } from "@/types/database"

/** All projects, newest first, with their features. */
export async function getProjects(): Promise<Project[]> {
  noStore()
  return withContentFallback<Project[]>(
    () =>
      prisma.project.findMany({
        orderBy: { createdAt: "desc" },
        include: { features: true },
      }),
    getContentProjects,
    "projects",
  )
}

/** All projects for the public project list, featured ones first. */
export async function getAllProjects(): Promise<Project[]> {
  const projects = await getProjects()
  return [...projects].sort((a, b) => Number(b.featured) - Number(a.featured))
}

export async function getProjectById(id: string): Promise<Project | null> {
  noStore()
  return withContentFallback<Project | null>(
    () =>
      prisma.project.findUnique({
        where: { id },
        include: { features: true },
      }),
    () => getContentProjects().find((project) => project.id === id) ?? null,
    `project ${id}`,
  )
}

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  noStore()
  return withContentFallback<Project[]>(
    () =>
      prisma.project.findMany({
        where: { featured: true },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: { features: true },
      }),
    () => getContentProjects().filter((project) => project.featured).slice(0, limit),
    "featured projects",
  )
}
