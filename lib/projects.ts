import { unstable_noStore as noStore } from "next/cache"

import prisma from "@/lib/db"
import type { Project } from "@/types/database"

export async function getProjects() {
  noStore()
  try {
    if (!prisma) {
      console.error("Prisma client is not initialized")
      return []
    }

    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        features: true,
      },
    })
    return projects
  } catch (error) {
    console.error("Error fetching projects:", error)
    return []
  }
}

export async function getAllProjects(): Promise<Project[]> {
  noStore()
  try {
    if (!prisma) {
      console.error("Prisma client is not initialized")
      return []
    }

    const projects = await prisma.project.findMany({
      where: {
        featured: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return projects
  } catch (error) {
    console.error("Error fetching all projects:", error)
    return []
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  noStore()
  try {
    if (!prisma) {
      console.error("Prisma client is not initialized")
      return null
    }

    const project = await prisma.project.findUnique({
      where: {
        id,
      },
      include: {
        features: true,
      },
    })

    return project
  } catch (error) {
    console.error(`Error fetching project with id ${id}:`, error)
    return null
  }
}

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  noStore()
  try {
    if (!prisma) {
      console.error("Prisma client is not initialized")
      return []
    }

    const projects = await prisma.project.findMany({
      where: {
        featured: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      include: {
        features: true,
      },
    })

    return projects
  } catch (error) {
    console.error("Error fetching featured projects:", error)
    return []
  }
}
