import Image from "next/image"
import Link from "next/link"
import { redirect, notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { ArrowLeft, ExternalLink, Pencil } from "lucide-react"

type ProjectFeatureItem = {
  id: string
  name: string
  description: string | null
}

import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

function formatDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Unknown"
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export default async function ProjectViewPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    redirect(`/login?callbackUrl=/dashboard/projects/${id}/view`)
  }

  const userId = session.user.id as string

  const project = await prisma.project.findUnique({
    where: {
      id,
      userId,
    },
    include: {
      features: {
        orderBy: {
          createdAt: "asc",
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  if (!project) {
    notFound()
  }

  const technologies: string[] = project.technologies
    ? project.technologies
        .split(",")
        .map((tech: string) => tech.trim())
        .filter((tech: string): tech is string => tech.length > 0)
    : []

  const projectFeatures: ProjectFeatureItem[] = (project.features ?? []).map(
    (feature: { id: string; name: string; description: string | null }) => ({
      id: feature.id,
      name: feature.name,
      description: feature.description,
    }),
  )

  const longFormSections = [
    {
      title: "Development Process",
      content: project.developmentProcess,
    },
    {
      title: "Challenges Faced",
      content: project.challengesFaced,
    },
    {
      title: "Future Plans",
      content: project.futurePlans,
    },
  ]

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading={project.title}
        text="Review every detail of this project from a single place."
      >
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/projects">
            <Button variant="outline" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
          <Link href={`/dashboard/projects/${project.id}`}>
            <Button size="sm" className="gap-1">
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          </Link>
          <Link href={`/projects/${project.id}`} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm" className="gap-1">
              <ExternalLink className="h-4 w-4" /> View Public Page
            </Button>
          </Link>
        </div>
      </DashboardHeader>

      <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
          <CardDescription>Key metadata and quick facts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Project</Badge>
            {project.featured && <Badge variant="default">Featured</Badge>}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Owner</p>
              <p className="text-base font-medium">{project.user?.name || "Unknown"}</p>
              {project.user?.email && (
                <p className="text-xs text-muted-foreground">{project.user.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-base font-medium">{formatDate(project.createdAt)}</p>
              <p className="text-sm text-muted-foreground">
                Last updated {formatDate(project.updatedAt)}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Technologies</p>
            {technologies.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {technologies.map((tech) => (
                  <Badge key={tech} variant="outline">
                    {tech}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No technologies recorded.</p>
            )}
          </div>

          {(project.link || project.githubUrl) && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Links</p>
              <div className="flex flex-col gap-2">
                {project.link && (
                  <Link
                    href={project.link}
                    className="text-sm text-primary underline underline-offset-2 hover:text-primary/80"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Project Website
                  </Link>
                )}
                {project.githubUrl && (
                  <Link
                    href={project.githubUrl}
                    className="text-sm text-primary underline underline-offset-2 hover:text-primary/80"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub Repository
                  </Link>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {(project.imageUrl || project.logoUrl) && (
        <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle>Media</CardTitle>
            <CardDescription>Reference visuals for the project.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6">
              {project.imageUrl && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground">Featured image</p>
                  <div className="relative h-48 w-80 overflow-hidden rounded-md border">
                    <Image
                      src={project.imageUrl}
                      alt={`${project.title} screenshot`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 320px"
                    />
                  </div>
                </div>
              )}
              {project.logoUrl && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground">Logo</p>
                  <div className="relative h-32 w-32 overflow-hidden rounded-md border bg-muted">
                    <Image
                      src={project.logoUrl}
                      alt={`${project.title} logo`}
                      fill
                      className="object-contain p-4"
                      sizes="128px"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle>Project Narrative</CardTitle>
          <CardDescription>All long-form notes captured for this project.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section className="space-y-2">
            <h3 className="text-lg font-semibold">Description</h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {project.description}
            </p>
          </section>

          {longFormSections.map(({ title, content }) => (
            <section key={title} className="space-y-2">
              <h3 className="text-lg font-semibold">{title}</h3>
              {content ? (
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {content}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">No information provided.</p>
              )}
            </section>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle>Feature Highlights</CardTitle>
          <CardDescription>Individual value propositions for this project.</CardDescription>
        </CardHeader>
        <CardContent>
          {projectFeatures.length > 0 ? (
            <ul className="space-y-4">
              {projectFeatures.map((feature) => (
                <li key={feature.id} className="rounded-lg border border-primary/10 p-4">
                  <h4 className="text-base font-semibold">{feature.name}</h4>
                  {feature.description ? (
                    <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">
                      {feature.description}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      No additional description provided.
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No feature highlights have been added yet.</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle>Project Log</CardTitle>
          <CardDescription>Raw log output or project journal entries.</CardDescription>
        </CardHeader>
        <CardContent>
          {project.logContent ? (
            <div className="max-h-96 overflow-auto rounded-md border border-primary/10 bg-muted/40 p-4">
              <pre className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
                {project.logContent}
              </pre>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No log content has been uploaded for this project.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
