import type { MetadataRoute } from "next"

import { getProjects } from "@/lib/projects"
import { getSiteUrl } from "@/lib/site"
import type { Project } from "@/types/database"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl()
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/projects",
    "/about",
    "/contact",
    "/newsletter",
    "/unsubscribe",
    "/login",
    "/register",
    "/privacy",
    "/impressum",
  ].map((route) => ({
    url: route === "" ? baseUrl : getSiteUrl(route),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }))

  const projects = (await getProjects()) as Project[]
  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: getSiteUrl(`/projects/${project.id}`),
    lastModified: project.updatedAt ? new Date(project.updatedAt) : new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }))

  return [...staticRoutes, ...projectRoutes]
}
