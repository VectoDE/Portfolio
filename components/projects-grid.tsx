import { ProjectsEmpty } from "@/components/project-card"
import { ProjectsFilter } from "@/components/projects-filter"
import { getAllProjects } from "@/lib/projects"

export async function ProjectsGrid() {
  const projects = await getAllProjects()

  if (projects.length === 0) {
    return <ProjectsEmpty />
  }

  return <ProjectsFilter projects={projects} />
}
