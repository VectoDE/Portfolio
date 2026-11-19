import { profile } from "@/lib/content"
import { getProjects } from "@/lib/projects"
import { getSiteUrl } from "@/lib/site"

export const revalidate = 3600

// llms.txt (https://llmstxt.org): a plain summary of the site for language models.
export async function GET() {
  const projects = await getProjects()
  const lines = [
    `# ${profile.name}`,
    "",
    `> ${profile.jobTitle} from ${profile.location}, ${profile.role.charAt(0).toLowerCase()}${profile.role.slice(1)}. Coding since ${profile.codingSince}. ${profile.availability}`,
    "",
    ...profile.about,
    "",
    "## Pages",
    "",
    `- [About](${getSiteUrl("/about")}): career, stack and certificates`,
    `- [Projects](${getSiteUrl("/projects")}): all projects with links to code`,
    `- [Contact](${getSiteUrl("/contact")}): contact form; email ${profile.contact.email}`,
    "",
    "## Projects",
    "",
    ...projects.map((project) => `- [${project.title}](${getSiteUrl(`/projects/${project.id}`)}): ${project.description}`),
    "",
    "## Profiles",
    "",
    ...profile.links.map((link) => `- [${link.label}](${link.url})`),
    "",
  ]

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  })
}
