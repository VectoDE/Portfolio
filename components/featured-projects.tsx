import { ProjectCard, ProjectsEmpty } from "@/components/project-card"
import { getFeaturedProjects } from "@/lib/projects"

export async function FeaturedProjects() {
  const projects = await getFeaturedProjects(3)

  if (projects.length === 0) {
    return <ProjectsEmpty />
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
