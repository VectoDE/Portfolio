import Image from "next/image"
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
  Mail,
} from "lucide-react"
import { getServerSession } from "next-auth"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

// Import the necessary types
import type { Project, Contact } from "@/types/database"

type ContactStatusRow = {
  status: string
  count: number | string
}

interface StatsWithChange {
  count: number
  change: number
  percentage: number
}

// Function to calculate 30-day change statistics
async function calculateStatsWithChange(
  userId: string,
  model: "project" | "certificate" | "skill" | "career" | "contact",
): Promise<StatsWithChange> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const sixtyDaysAgo = new Date()
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

  // Get total count
  let totalCount = 0
  let countLast30Days = 0
  let countPrevious30Days = 0

  // Use separate queries for each model to avoid TypeScript errors
  switch (model) {
    case "project":
      totalCount = await prisma.project.count({
        where: { userId },
      })
      countLast30Days = await prisma.project.count({
        where: {
          userId,
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      })
      countPrevious30Days = await prisma.project.count({
        where: {
          userId,
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo,
          },
        },
      })
      break
    case "certificate":
      totalCount = await prisma.certificate.count({
        where: { userId },
      })
      countLast30Days = await prisma.certificate.count({
        where: {
          userId,
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      })
      countPrevious30Days = await prisma.certificate.count({
        where: {
          userId,
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo,
          },
        },
      })
      break
    case "skill":
      totalCount = await prisma.skill.count({
        where: { userId },
      })
      countLast30Days = await prisma.skill.count({
        where: {
          userId,
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      })
      countPrevious30Days = await prisma.skill.count({
        where: {
          userId,
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo,
          },
        },
      })
      break
    case "career":
      totalCount = await prisma.career.count({
        where: { userId },
      })
      countLast30Days = await prisma.career.count({
        where: {
          userId,
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      })
      countPrevious30Days = await prisma.career.count({
        where: {
          userId,
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo,
          },
        },
      })
      break
    case "contact":
      totalCount = await prisma.contact.count()
      countLast30Days = await prisma.contact.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      })
      countPrevious30Days = await prisma.contact.count({
        where: {
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo,
          },
        },
      })
      break
  }

  // Calculate change
  const change = countLast30Days - countPrevious30Days

  // Calculate percentage change
  const percentage =
    countPrevious30Days === 0 ? (change > 0 ? 100 : 0) : Math.round((change / countPrevious30Days) * 100)

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
      contacts: { count: 0, change: 0, percentage: 0 } as StatsWithChange,
      featuredProjects: [] as Project[],
      recentContacts: [] as Contact[],
      contactStatusBreakdown: [] as { status: string; count: number }[],
    }
  }

  const userId = session.user.id

  // Get stats with 30-day changes
  const [
    projectStats,
    certificateStats,
    skillStats,
    careerStats,
    contactStats,
    featuredProjects,
    recentContacts,
    contactStatusBreakdown,
  ] = await Promise.all([
    calculateStatsWithChange(userId, "project"),
    calculateStatsWithChange(userId, "certificate"),
    calculateStatsWithChange(userId, "skill"),
    calculateStatsWithChange(userId, "career"),
    calculateStatsWithChange(userId, "contact"),
    prisma.project.findMany({
      where: { userId, featured: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }) as Promise<Project[]>,
    prisma.contact.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
    }) as Promise<Contact[]>,
    prisma.$queryRaw`
      SELECT status, COUNT(*) as count
      FROM "Contact"
      GROUP BY status
      ORDER BY count DESC
    ` as Promise<ContactStatusRow[]>,
  ])

  return {
    projects: projectStats,
    certificates: certificateStats,
    skills: skillStats,
    career: careerStats,
    contacts: contactStats,
    featuredProjects,
    recentContacts,
    contactStatusBreakdown,
  }
}

export default async function DashboardPage() {
  const {
    projects,
    certificates,
    skills,
    career,
    contacts,
    featuredProjects,
    recentContacts,
    contactStatusBreakdown,
  } = await getStats()

  return (
    <div className="space-y-8">
      <DashboardHeader heading="Dashboard" text="Welcome to your portfolio dashboard">
        <Link href="/">
          <Button variant="outline" size="sm" className="gap-1">
            View Portfolio <ArrowUpRight className="h-4 w-4" />
          </Button>
        </Link>
      </DashboardHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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

        <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contacts</CardTitle>
            <Mail className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contacts.count}</div>
            <div className="flex items-center mt-1">
              {contacts.change > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : contacts.change < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              ) : null}
              <p
                className={`text-xs ${contacts.change > 0 ? "text-green-500" : contacts.change < 0 ? "text-red-500" : "text-muted-foreground"}`}
              >
                {contacts.change > 0 ? "+" : ""}
                {contacts.change} in the last 30 days ({contacts.percentage}%)
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/contacts" className="w-full">
              <Button variant="outline" size="sm" className="w-full">
                Manage Contacts
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
                          <Image
                            src={project.imageUrl || "/placeholder.svg"}
                            alt={project.title}
                            width={48}
                            height={48}
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
              <CardTitle>Recent Contacts</CardTitle>
              <CardDescription>Latest contact form submissions</CardDescription>
            </div>
            <Link href="/dashboard/contacts/new">
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" /> Add Contact
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentContacts.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>No contacts received yet</p>
                <p className="text-sm mt-1">Contact submissions will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentContacts.map((contact: Contact) => {
                  const createdAt =
                    typeof contact.createdAt === "string"
                      ? new Date(contact.createdAt)
                      : new Date(contact.createdAt)

                  return (
                    <div key={contact.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                      <div>
                        <h3 className="font-medium">{contact.name}</h3>
                        <p className="text-sm text-muted-foreground">{contact.email}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{contact.subject}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Received {createdAt.toLocaleDateString()} at {createdAt.toLocaleTimeString()}
                        </p>
                        <div className="mt-1">
                          {contact.status === "unread" ? (
                            <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-100">
                              Unread
                            </span>
                          ) : contact.status === "read" ? (
                            <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-100">
                              Read
                            </span>
                          ) : contact.status === "replied" ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-2 py-0.5 text-xs font-medium text-green-800 dark:text-green-100">
                              Replied
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-900 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:text-yellow-100">
                              Archived
                            </span>
                          )}
                        </div>
                      </div>
                      <Link href={`/dashboard/contacts/${contact.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/contacts" className="w-full">
              <Button variant="outline" className="w-full">
                View All Contacts
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle>Contact Status Breakdown</CardTitle>
            <CardDescription>Distribution of contact statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {contactStatusBreakdown.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>No contact data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {contactStatusBreakdown.map((item: ContactStatusRow) => {
                  const totalCount = contactStatusBreakdown.reduce(
                    (acc: number, curr: ContactStatusRow) => acc + Number(curr.count),
                    0,
                  )
                  const percentage = totalCount > 0 ? Math.round((Number(item.count) / totalCount) * 100) : 0

                  return (
                    <div key={item.status} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className={`h-3 w-3 rounded-full mr-2 ${item.status === "unread"
                                ? "bg-blue-500"
                                : item.status === "read"
                                  ? "bg-gray-500"
                                  : item.status === "replied"
                                    ? "bg-green-500"
                                    : "bg-yellow-500"
                              }`}
                          />
                          <span className="capitalize">{item.status}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{item.count}</span>
                          <span className="text-sm text-muted-foreground">({percentage}%)</span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.status === "unread"
                              ? "bg-blue-500"
                              : item.status === "read"
                                ? "bg-gray-500"
                                : item.status === "replied"
                                  ? "bg-green-500"
                                  : "bg-yellow-500"
                            }`}
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/analytics" className="w-full">
              <Button variant="outline" className="w-full">
                View Detailed Analytics
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your portfolio content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
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
              <Link href="/dashboard/contacts/new" className="w-full">
                <Button variant="outline" className="w-full h-full py-6 flex flex-col gap-2">
                  <Mail className="h-6 w-6" />
                  <span>New Contact</span>
                </Button>
              </Link>
              <Link href="/dashboard/analytics" className="w-full">
                <Button variant="outline" className="w-full h-full py-6 flex flex-col gap-2">
                  <TrendingUp className="h-6 w-6" />
                  <span>Analytics</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
