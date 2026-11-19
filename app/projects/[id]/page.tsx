import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Github, Terminal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { getProjectById } from "@/lib/projects"
import { getProjectComments, getProjectReactionSummary } from "@/lib/engagement"
import type { ProjectFeature } from "@/types/database"
import { CodeBlock } from "@/components/code-block"
import { ProjectFeedback } from "@/components/project-feedback"
import { ShareProject } from "@/components/share-project"
import { getSiteUrl, siteProfile } from "@/lib/site"
import { pageMetadata } from "@/lib/seo"
import { AnimatedSection } from "@/components/animated-section"
import { AnimatedList } from "@/components/animated-list"

interface ProjectPageProps {
  params: Promise<{
    id: string
  }>
}

export const revalidate = 0

export async function generateMetadata({ params }: Readonly<ProjectPageProps>) {
  const { id } = await params
  if (!id) {
    return {
      title: "Project not found",
      description: "The requested project could not be found",
    }
  }
  const project = await getProjectById(id)

  if (!project) {
    return {
      title: "Project not found",
      description: "The requested project could not be found",
    }
  }

  return {
    ...pageMetadata({
      title: project.title,
      description: project.description,
      path: `/projects/${project.id}`,
      type: "article",
    }),
    keywords: [project.title, ...project.technologies.split(",").map((tech) => tech.trim())],
  }
}

export default async function ProjectPage({ params }: Readonly<ProjectPageProps>) {
  const { id } = await params
  if (!id) {
    notFound()
  }
  const project = await getProjectById(id)

  if (!project) {
    notFound()
  }

  const [initialComments, initialReactions] = await Promise.all([
    getProjectComments(project.id),
    getProjectReactionSummary(project.id),
  ])

  const projectUrl = getSiteUrl(`/projects/${project.id}`)
  const imageUrl = project.imageUrl || getSiteUrl("/opengraph-image")
  const structuredData = {
    "@context": "https://schema.org",
    "@type": project.githubUrl ? "SoftwareSourceCode" : "CreativeWork",
    name: project.title,
    ...(project.githubUrl ? { codeRepository: project.githubUrl } : {}),
    ...(project.link ? { sameAs: project.link } : {}),
    description: project.description,
    url: projectUrl,
    image: imageUrl,
    isPartOf: {
      "@type": "CreativeWorkSeries",
      name: "Projects by Tim Hauke",
      url: getSiteUrl("/projects"),
    },
    author: {
      "@type": "Person",
      "@id": `${getSiteUrl()}/#person`,
      name: siteProfile.name,
      url: getSiteUrl(),
    },
    datePublished: new Date(project.createdAt).toISOString(),
    dateModified: new Date(project.updatedAt).toISOString(),
    inLanguage: "en",
    keywords: project.technologies.split(",").map((tech) => tech.trim()),
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/CommentAction",
        userInteractionCount: initialComments.length,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: initialReactions.total,
      },
    ],
    discussionUrl: projectUrl,
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative z-10">
        <MainNav />

        <main id="main" className="flex-1">
          <AnimatedSection className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <AnimatedList className="flex flex-col space-y-12" initialDelay={0.1}>
                <Link
                  href="/projects"
                  className="flex items-center gap-2 text-primary hover:underline w-fit"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>All projects</span>
                </Link>

                <AnimatedList
                  className="flex flex-col md:flex-row gap-6 items-start"
                  stagger={0.12}
                >
                  {project.logoUrl && (
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-white/80 dark:bg-slate-900/60 ring-1 ring-primary/20 flex-shrink-0">
                      <Image
                        src={project.logoUrl || "/placeholder.svg"}
                        alt={`${project.title} logo`}
                        width={96}
                        height={96}
                        className="object-contain w-full h-full"
                      />
                    </div>
                  )}
                  <div className="space-y-4 flex-1">
                    <div className="space-y-3">
                      <h1 className="font-display text-5xl md:text-6xl">{project.title}</h1>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.split(", ").map((tech: string) => (
                        <span key={tech} className="rounded-md bg-secondary px-2 py-1 text-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </AnimatedList>

                {project.imageUrl ? (
                  <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
                    <Image
                      src={project.imageUrl}
                      alt={`Screenshot of ${project.title}`}
                      width={1280}
                      height={720}
                      className="h-full w-full object-cover"
                      priority
                    />
                  </div>
                ) : null}

                <AnimatedList className="space-y-6" stagger={0.1}>
                  <div className="space-y-4">
                    <h2 className="font-display text-3xl">Overview</h2>
                    <p className="max-w-prose text-lg leading-relaxed">{project.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {project.link && (
                      <Button asChild className="gap-2">
                        <Link href={project.link} target="_blank" rel="noopener noreferrer">
                          Live site <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </Button>
                    )}
                    {project.githubUrl && (
                      <Button asChild variant="outline" className="gap-2">
                        <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                          Code on GitHub <Github className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </Button>
                    )}
                  </div>

                  <ShareProject projectTitle={project.title} projectUrl={projectUrl} />
                </AnimatedList>

                <Card>
                  <CardContent className="p-6 space-y-8">
                    <h2 className="font-display text-3xl">Details</h2>
                    <AnimatedList className="space-y-6" stagger={0.08}>
                      <div>
                        <h3 className="text-lg font-semibold">Features</h3>
                        {project.features && project.features.length > 0 ? (
                          <AnimatedList
                            className="mt-3 space-y-3"
                            stagger={0.06}
                            initialDelay={0.05}
                          >
                            {project.features.map((feature: ProjectFeature) => (
                              <div key={feature.id} className="rounded-md border px-4 py-3">
                                <span className="font-medium">{feature.name}</span>
                                {feature.description && (
                                  <span className="block text-sm text-muted-foreground mt-1">
                                    {feature.description}
                                  </span>
                                )}
                              </div>
                            ))}
                          </AnimatedList>
                        ) : (
                          <p className="mt-2 text-muted-foreground">No features listed yet.</p>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold">Technologies Used</h3>
                        <p className="mt-2 text-muted-foreground">{project.technologies}</p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold">Development Process</h3>
                        {project.developmentProcess ? (
                          <p className="mt-2 text-muted-foreground">{project.developmentProcess}</p>
                        ) : (
                          <p className="mt-2 text-muted-foreground">Not written up yet.</p>
                        )}
                      </div>

                      {project.challengesFaced && (
                        <div>
                          <h3 className="text-lg font-semibold">Challenges Faced</h3>
                          <p className="mt-2 text-muted-foreground">{project.challengesFaced}</p>
                        </div>
                      )}

                      {project.futurePlans && (
                        <div>
                          <h3 className="text-lg font-semibold">Future Plans</h3>
                          <p className="mt-2 text-muted-foreground">{project.futurePlans}</p>
                        </div>
                      )}

                      {project.logContent && (
                        <div>
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Terminal className="h-4 w-4" />
                            Project Logs
                          </h3>
                          <div className="mt-3 overflow-hidden rounded-lg border border-primary/10 bg-background/80">
                            <CodeBlock language="shell" code={project.logContent} />
                          </div>
                        </div>
                      )}
                    </AnimatedList>
                  </CardContent>
                </Card>

                <AnimatedSection delay={0.05} className="space-y-6">
                  <ProjectFeedback
                    projectId={project.id}
                    initialComments={initialComments}
                    initialReactions={initialReactions}
                  />
                </AnimatedSection>
              </AnimatedList>
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
              />
            </div>
          </AnimatedSection>
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}
