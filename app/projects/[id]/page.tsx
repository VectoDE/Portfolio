import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Github, Terminal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation"
import { getProjectById } from "@/lib/projects"
import { getProjectComments, getProjectReactionSummary } from "@/lib/engagement"
import type { ProjectFeature } from "@/types/database"
import { CodeBlock } from "@/components/code-block"
import { ProjectFeedback } from "@/components/project-feedback"
import { ShareProject } from "@/components/share-project"
import { getSiteUrl, siteProfile } from "@/lib/site"

interface ProjectPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const { id } = await params
  if (!id) {
    return {
      title: "Project Not Found | Tim Hauke",
      description: "The requested project could not be found",
    }
  }
  const project = await getProjectById(id)

  if (!project) {
    return {
      title: "Project Not Found | Tim Hauke",
      description: "The requested project could not be found",
    }
  }

  const canonical = getSiteUrl(`/projects/${project.id}`)
  const imageUrl = project.imageUrl || `${getSiteUrl()}/placeholder.jpg`

  return {
    title: `${project.title} | Tim Hauke`,
    description: project.description,
    alternates: {
      canonical,
    },
    keywords: [
      project.title,
      "Tim Hauke projects",
      ...project.technologies.split(", ").map((tech) => tech.trim()),
    ],
    openGraph: {
      type: "article",
      url: canonical,
      title: `${project.title} | Tim Hauke`,
      description: project.description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${project.title} preview image`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} | Tim Hauke`,
      description: project.description,
      images: [imageUrl],
    },
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
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
  const imageUrl = project.imageUrl || `${getSiteUrl()}/placeholder.jpg`
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    url: projectUrl,
    image: imageUrl,
    isPartOf: {
      "@type": "CreativeWorkSeries",
      name: "Tim Hauke Portfolio Projects",
      url: getSiteUrl("/projects"),
    },
    author: {
      "@type": "Person",
      name: siteProfile.name,
      url: getSiteUrl(),
    },
    datePublished: new Date(project.createdAt).toISOString(),
    dateModified: new Date(project.updatedAt).toISOString(),
    inLanguage: "en",
    keywords: project.technologies.split(", ").map((tech) => tech.trim()),
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
      <BackgroundGradientAnimation
        firstColor="rgba(125, 39, 255, 0.2)"
        secondColor="rgba(0, 87, 255, 0.2)"
        thirdColor="rgba(0, 214, 242, 0.2)"
      />

      <div className="relative z-10">
        <MainNav />

        <main className="flex-1">
          <section className="w-full py-12 md:py-24 lg:py-12">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col space-y-8">
                <Link
                  href="/projects"
                  className="flex items-center gap-2 text-primary hover:underline w-fit"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Projects</span>
                </Link>

                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {project.logoUrl && (
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-white shadow-md flex-shrink-0">
                      <Image
                        src={project.logoUrl || "/placeholder.svg"}
                        alt={`${project.title} logo`}
                        width={96}
                        height={96}
                        className="object-contain w-full h-full"
                      />
                    </div>
                  )}
                  <div className="space-y-2 flex-1">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                      {project.title}
                    </h1>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.split(", ").map((tech: string) => (
                        <span
                          key={tech}
                          className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="aspect-video relative bg-muted rounded-lg overflow-hidden shadow-xl">
                  <Image
                    src={project.imageUrl || "/placeholder.svg?height=600&width=600"}
                    alt={project.title}
                    width={1280}
                    height={720}
                    className="object-cover w-full h-full"
                  />
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Project Overview</h2>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-4">
                    {project.link && (
                      <Link href={project.link} target="_blank" rel="noopener noreferrer">
                        <Button className="gap-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300">
                          Live Demo <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    {project.githubUrl && (
                      <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Button
                          variant="outline"
                          className="gap-1 border-purple-600/50 hover:border-purple-600 transition-all duration-300"
                        >
                          View Code <Github className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>

                  <ShareProject projectTitle={project.title} projectUrl={projectUrl} />
                </div>

                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                  <CardContent className="p-6 space-y-6">
                    <h2 className="text-2xl font-bold">Project Details</h2>
                    <div className="space-y-6">
                      {/* Features section */}
                      <div>
                        <h3 className="text-lg font-semibold">Features</h3>
                        {project.features && project.features.length > 0 ? (
                          <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-500 dark:text-gray-400">
                            {project.features.map((feature: ProjectFeature) => (
                              <li key={feature.id}>
                                <span className="font-medium">{feature.name}</span>
                                {feature.description && (
                                  <span className="block text-sm ml-2">{feature.description}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2 text-gray-500 dark:text-gray-400 italic">
                            No specific features listed for this project.
                          </p>
                        )}
                      </div>

                      {/* Technologies section */}
                      <div>
                        <h3 className="text-lg font-semibold">Technologies Used</h3>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                          {project.technologies}
                        </p>
                      </div>

                      {/* Development Process section */}
                      <div>
                        <h3 className="text-lg font-semibold">Development Process</h3>
                        {project.developmentProcess ? (
                          <p className="mt-2 text-gray-500 dark:text-gray-400">
                            {project.developmentProcess}
                          </p>
                        ) : (
                          <p className="mt-2 text-gray-500 dark:text-gray-400 italic">
                            No development process information provided.
                          </p>
                        )}
                      </div>

                      {/* Challenges Faced section - only show if data exists */}
                      {project.challengesFaced && (
                        <div>
                          <h3 className="text-lg font-semibold">Challenges Faced</h3>
                          <p className="mt-2 text-gray-500 dark:text-gray-400">
                            {project.challengesFaced}
                          </p>
                        </div>
                      )}

                      {/* Future Plans section - only show if data exists */}
                      {project.futurePlans && (
                        <div>
                          <h3 className="text-lg font-semibold">Future Plans</h3>
                          <p className="mt-2 text-gray-500 dark:text-gray-400">
                            {project.futurePlans}
                          </p>
                        </div>
                      )}

                      {/* Project Logs section - only show if data exists */}
                      {project.logContent && (
                        <div>
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Terminal className="h-4 w-4" />
                            Project Logs
                          </h3>
                          <div className="mt-2">
                            <CodeBlock language="shell" code={project.logContent} />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <ProjectFeedback
                  projectId={project.id}
                  initialComments={initialComments}
                  initialReactions={initialReactions}
                />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
              </div>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}
