import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Github } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation"
import { getProjectById } from "@/lib/projects"

interface ProjectPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const project = await getProjectById(params.id as string)

  if (!project) {
    return {
      title: "Project Not Found | Tim Hauke",
      description: "The requested project could not be found",
    }
  }

  return {
    title: `${project.title} | Tim Hauke`,
    description: project.description,
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = await getProjectById(params.id)

  if (!project) {
    notFound()
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
          <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col space-y-8">
                <Link href="/projects" className="flex items-center gap-2 text-primary hover:underline w-fit">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Projects</span>
                </Link>

                <div className="space-y-2">
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

                <div className="aspect-video relative bg-muted rounded-lg overflow-hidden shadow-xl">
                  <Image
                    src={`/placeholder.svg?height=720&width=1280&text=${encodeURIComponent(project.title)}`}
                    alt={project.title}
                    width={1280}
                    height={720}
                    className="object-cover w-full h-full"
                  />
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Project Overview</h2>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{project.description}</p>

                  <div className="flex flex-wrap gap-4">
                    {project.link && (
                      <Link href={project.link} target="_blank" rel="noopener noreferrer">
                        <Button className="gap-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300">
                          Live Demo <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
                      <Button
                        variant="outline"
                        className="gap-1 border-purple-600/50 hover:border-purple-600 transition-all duration-300"
                      >
                        View Code <Github className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                  <CardContent className="p-6 space-y-4">
                    <h2 className="text-2xl font-bold">Project Details</h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">Features</h3>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-500 dark:text-gray-400">
                          <li>Responsive design for all device sizes</li>
                          <li>Modern UI/UX with intuitive navigation</li>
                          <li>Optimized performance and accessibility</li>
                          <li>Secure authentication and data handling</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold">Technologies Used</h3>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">{project.technologies}</p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold">Development Process</h3>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                          This project was developed using an agile methodology, with regular iterations and feedback
                          cycles. The development process included planning, design, implementation, testing, and
                          deployment phases.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}

