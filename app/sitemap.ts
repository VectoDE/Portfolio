import type { MetadataRoute } from "next"

import { getProjects } from "@/lib/projects"
import { getSiteUrl } from "@/lib/site"

// Pages meant for search results. Sign-in, registration and unsubscribe are noindex.
const staticRoutes: Array<{
  path: string
  priority: number
  changeFrequency: "weekly" | "monthly" | "yearly"
}> = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/about", priority: 0.9, changeFrequency: "monthly" },
  { path: "/projects", priority: 0.9, changeFrequency: "weekly" },
  { path: "/contact", priority: 0.7, changeFrequency: "yearly" },
  { path: "/newsletter", priority: 0.4, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/impressum", priority: 0.2, changeFrequency: "yearly" },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects()
  const latestUpdate = projects.reduce<Date | undefined>((latest, project) => {
    const updated = new Date(project.updatedAt)
    return !latest || updated > latest ? updated : latest
  }, undefined)

  return [
    ...staticRoutes.map((route) => ({
      url: getSiteUrl(route.path),
      lastModified: route.path === "/projects" || route.path === "/" ? latestUpdate : undefined,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...projects.map((project) => ({
      url: getSiteUrl(`/projects/${project.id}`),
      lastModified: new Date(project.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ]
}
