import Link from "next/link"
import { ExternalLink, Github } from "lucide-react"

import type { Project } from "@/types/database"

/**
 * Text-first project card. The whole card links to the detail page; live site and
 * repository links sit above that link so each target stays reachable by keyboard.
 */
export function ProjectCard({
  project,
  headingLevel = "h3",
}: Readonly<{ project: Project; headingLevel?: "h2" | "h3" }>) {
  const Heading = headingLevel
  const technologies = project.technologies
    .split(",")
    .map((tech) => tech.trim())
    .filter(Boolean)

  return (
    <article className="relative flex h-full flex-col rounded-lg border bg-card p-6 transition-colors hover:border-primary">
      <Heading className="font-display text-2xl font-normal">
        <Link
          href={`/projects/${project.id}`}
          className="after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ring"
        >
          {project.title}
        </Link>
      </Heading>
      <p className="mt-3 flex-1 leading-relaxed text-muted-foreground">{project.description}</p>
      {technologies.length > 0 ? (
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Technologies">
          {technologies.map((tech) => (
            <li key={tech} className="rounded-md bg-secondary px-2 py-1 text-sm">
              {tech}
            </li>
          ))}
        </ul>
      ) : null}
      {project.link || project.githubUrl ? (
        <div className="relative z-10 mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t pt-4 text-sm font-medium">
          {project.link ? (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary underline-offset-4 hover:underline"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Live site<span className="sr-only">: {project.title} (opens in a new tab)</span>
            </a>
          ) : null}
          {project.githubUrl ? (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary underline-offset-4 hover:underline"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              Code<span className="sr-only">: {project.title} on GitHub (opens in a new tab)</span>
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

export function ProjectsEmpty() {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center">
      <p className="font-medium">No projects published yet.</p>
      <p className="mt-2 text-muted-foreground">
        The code is on{" "}
        <a href="https://github.com/VectoDE" className="text-primary underline underline-offset-4">
          GitHub
        </a>{" "}
        in the meantime.
      </p>
    </div>
  )
}
