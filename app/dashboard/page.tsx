import Link from "next/link"
import {
  ArrowUpRight,
  FolderKanban,
  GraduationCap,
  Languages,
  Plus,
  FileText,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { getServerSession } from "next-auth"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/db"

// Import the necessary types
import type { Project, Certificate, StatsWithChange } from "@/types/database"

// Function to calculate 30-day change statistics
async function calculateStatsWithChange(
  userId: string,
  model: "project" | "certificate" | "skill" | "career",
): Promise<StatsWithChange> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Get total count
  const totalCount = await prisma[model].count({
    where: { userId },
  })

  // Get count from 30 days ago (items created before 30 days ago)
  const countBefore30Days = await prisma[model].count({
    where: {
      userId,
      createdAt: {
        lt: thirtyDaysAgo,
      },
    },
  })

  // Calculate change
  const change = totalCount - countBefore30Days

  // Calculate percentage change
  const percentage = countBefore30Days === 0 ? (change > 0 ? 100 : 0) : Math.round((change / countBefore30Days) * 100)

  return {
    count: totalCount,
    change,
    percentage,
  }
}

async function getStats() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return {
      projects: { count: 0, change: 0, percentage: 0 } as StatsWithChange,
      certificates: { count: 0, change: 0, percentage: 0 } as StatsWithChange,
      skills: { count: 0, change: 0, percentage: 0 } as StatsWithChange,
      career: { count: 0, change: 0, percentage: 0 } as StatsWithChange,
      featuredProjects: [] as Project[],
      recentCertificates: [] as Certificate[],
    }
  }

  const userId = session.user.id

  // Get stats with 30-day changes
  const [projectStats, certificateStats, skillStats, careerStats, featuredProjects, recentCertificates] =
    await Promise.all([
      calculateStatsWithChange(userId, "project"),
      calculateStatsWithChange(userId, "certificate"),
      calculateStatsWithChange(userId, "skill"),
      calculateStatsWithChange(userId, "career"),
      prisma.project.findMany({
        where: { userId, featured: true },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.certificate.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        take: 3,
      }),
    ])

  return {
    projects: projectStats,
    certificates: certificateStats,
    skills: skillStats,
    career: careerStats,
    featuredProjects,
    recentCertificates,
  }
}

export default async function DashboardPage() {
  const { projects, certificates, skills, career, featuredProjects, recentCertificates } = await getStats()

  return (
    <div className="space-y-8">
      <DashboardHeader heading="Dashboard" text="Welcome to your portfolio dashboard">
        <Link href="/">
          <Button variant="outline" size="sm" className="gap-1">
            View Portfolio <ArrowUpRight className="h-4 w-4" />
          </Button>
        </Link>
      </DashboardHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.count}</div>
            <div className="flex items-center mt-1">
              {projects.change > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : projects.change < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              ) : null}
              <p
                className={`text-xs ${projects.change > 0 ? "text-green-500" : projects.change < 0 ? "text-red-500" : "text-muted-foreground"}`}
              >
                {projects.change > 0 ? "+" : ""}
                {projects.change} in the last 30 days ({projects.percentage}%)
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/projects" className="w-full">
              <Button variant="outline" size="sm" className="w-full">
                Manage Projects
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <GraduationCap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificates.count}</div>
            <div className="flex items-center mt-1">
              {certificates.change > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : certificates.change < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              ) : null}
              <p
                className={`text-xs ${certificates.change > 0 ? "text-green-500" : certificates.change < 0 ? "text-red-500" : "text-muted-foreground"}`}
              >
                {certificates.change > 0 ? "+" : ""}
                {certificates.change} in the last 30 days ({certificates.percentage}%)
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/certificates" className="w-full">
              <Button variant="outline" size="sm" className="w-full">
                Manage Certificates
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skills</CardTitle>
            <Languages className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{skills.count}</div>
            <div className="flex items-center mt-1">
              {skills.change > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : skills.change < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              ) : null}
              <p
                className={`text-xs ${skills.change > 0 ? "text-green-500" : skills.change < 0 ? "text-red-500" : "text-muted-foreground"}`}
              >
                {skills.change > 0 ? "+" : ""}
                {skills.change} in the last 30 days ({skills.percentage}%)
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/skills" className="w-full">
              <Button variant="outline" size="sm" className="w-full">
                Manage Skills
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Career</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{career.count}</div>
            <div className="flex items-center mt-1">
              {career.change > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : career.change < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              ) : null}
              <p
                className={`text-xs ${career.change > 0 ? "text-green-500" : career.change < 0 ? "text-red-500" : "text-muted-foreground"}`}
              >
                {career.change > 0 ? "+" : ""}
                {career.change} in the last 30 days ({career.percentage}%)
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/career" className="w-full">
              <Button variant="outline" size="sm" className="w-full">
                Manage Career
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Featured Projects</CardTitle>
              <CardDescription>Your highlighted portfolio projects</CardDescription>
            </div>
            <Link href="/dashboard/projects/new">
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" /> Add Project
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {featuredProjects.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>No featured projects yet</p>
                <p className="text-sm mt-1">Add projects and mark them as featured</p>
              </div>
            ) : (
              <div className="space-y-4">
                {featuredProjects.map((project: Project) => (
                  <div key={project.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                    <div className="flex gap-3">
                      {project.imageUrl && (
                        <div className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                          <img
                            src={project.imageUrl || "/placeholder.svg"}
                            alt={project.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium">{project.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {project.technologies
                            .split(", ")
                            .slice(0, 3)
                            .map((tech: string) => (
                              <span
                                key={tech}
                                className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                              >
                                {tech}
                              </span>
                            ))}
                          {project.technologies.split(", ").length > 3 && (
                            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                              +{project.technologies.split(", ").length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Link href={`/dashboard/projects/${project.id}`}>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/projects" className="w-full">
              <Button variant="outline" className="w-full">
                View All Projects
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Certificates</CardTitle>
              <CardDescription>Your latest certifications</CardDescription>
            </div>
            <Link href="/dashboard/certificates/new">
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" /> Add Certificate
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentCertificates.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>No certificates added yet</p>
                <p className="text-sm mt-1">Add your professional certifications</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentCertificates.map((cert: Certificate) => (
                  <div key={cert.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                    <div className="flex gap-3">
                      {cert.imageUrl && (
                        <div className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                          <img
                            src={cert.imageUrl || "/placeholder.svg"}
                            alt={cert.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium">{cert.name}</h3>
                        <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(cert.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                    </div>
                    <Link href={`/dashboard/certificates/${cert.id}`}>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/certificates" className="w-full">
              <Button variant="outline" className="w-full">
                View All Certificates
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your portfolio content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Link href="/dashboard/projects/new" className="w-full">
                <Button variant="outline" className="w-full h-full py-6 flex flex-col gap-2">
                  <FolderKanban className="h-6 w-6" />
                  <span>New Project</span>
                </Button>
              </Link>
              <Link href="/dashboard/certificates/new" className="w-full">
                <Button variant="outline" className="w-full h-full py-6 flex flex-col gap-2">
                  <GraduationCap className="h-6 w-6" />
                  <span>New Certificate</span>
                </Button>
              </Link>
              <Link href="/dashboard/skills/new" className="w-full">
                <Button variant="outline" className="w-full h-full py-6 flex flex-col gap-2">
                  <Languages className="h-6 w-6" />
                  <span>New Skill</span>
                </Button>
              </Link>
              <Link href="/dashboard/career/new" className="w-full">
                <Button variant="outline" className="w-full h-full py-6 flex flex-col gap-2">
                  <FileText className="h-6 w-6" />
                  <span>New Position</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

