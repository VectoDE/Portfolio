"use client"

import { useMemo, useState } from "react"

import { ProjectCard } from "@/components/project-card"
import type { Project } from "@/types/database"

const ALL = "All"

function technologiesOf(project: Project) {
  return project.technologies
    .split(",")
    .map((tech) => tech.trim())
    .filter(Boolean)
}

/**
 * All projects with a filter by technology. Only technologies used by at least two projects
 * become filter buttons, so every button narrows the list instead of picking one project.
 */
export function ProjectsFilter({ projects }: Readonly<{ projects: Project[] }>) {
  const [active, setActive] = useState(ALL)

  const options = useMemo(() => {
    const counts = new Map<string, number>()
    for (const project of projects) {
      for (const tech of technologiesOf(project)) counts.set(tech, (counts.get(tech) ?? 0) + 1)
    }
    return [...counts.entries()]
      .filter(([, count]) => count > 1)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tech]) => tech)
  }, [projects])

  const visible = active === ALL ? projects : projects.filter((project) => technologiesOf(project).includes(active))

  return (
    <div>
      {options.length > 0 ? (
        <div role="group" aria-label="Filter projects by technology" className="flex flex-wrap gap-2">
          {[ALL, ...options].map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={active === option}
              onClick={() => setActive(option)}
              className="min-h-11 rounded-md border px-3 py-2 text-sm transition-colors hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
      <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
        {visible.length === projects.length
          ? `${projects.length} projects`
          : `${visible.length} of ${projects.length} projects use ${active}`}
      </p>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((project) => (
          <ProjectCard key={project.id} project={project} headingLevel="h2" />
        ))}
      </div>
    </div>
  )
}
