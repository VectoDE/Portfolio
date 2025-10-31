import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { getServerSession } from "next-auth"

import { AccountAnnouncementPreferences } from "@/components/account-announcement-preferences"
import { AccountProfileForm } from "@/components/account-profile-form"
import { AnimatedSection } from "@/components/animated-section"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import prisma from "@/lib/db"
import { authOptions } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Your account",
  description: "Review your membership details, personal data, and community preferences.",
}

export default async function AccountPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account")
  }

  const userId = session.user.id

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      imageUrl: true,
      role: true,
      createdAt: true,
      announcements: {
        select: {
          newProjects: true,
          newCertificates: true,
          newSkills: true,
          newCareers: true,
        },
      },
      _count: {
        select: {
          projects: true,
          certificates: true,
          skills: true,
          comments: true,
          reactions: true,
        },
      },
    },
  })

  const [recentProjects, recentCertificates, recentComments, recentReactions, topSkills] = await Promise.all([
    prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        featured: true,
      },
    }),
    prisma.certificate.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 3,
      select: {
        id: true,
        name: true,
        issuer: true,
        date: true,
      },
    }),
    prisma.projectComment.findMany({
      where: { userId },
      include: {
        project: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.projectReaction.findMany({
      where: { userId },
      include: {
        project: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.skill.findMany({
      where: { userId },
      orderBy: { years: "desc" },
      take: 4,
      select: {
        id: true,
        name: true,
        category: true,
        level: true,
        years: true,
      },
    }),
  ])

  type RecentProjectEntry = (typeof recentProjects)[number]
  type RecentCertificateEntry = (typeof recentCertificates)[number]
  type RecentCommentEntry = (typeof recentComments)[number]
  type RecentReactionEntry = (typeof recentReactions)[number]
  type TopSkillEntry = (typeof topSkills)[number]
  if (!user) {
    redirect("/register")
  }

  const stats = [
    {
      label: "Projects shipped",
      value: user._count.projects,
      helper: "Visible case studies in your portfolio",
    },
    {
      label: "Certifications",
      value: user._count.certificates,
      helper: "Verified achievements you have logged",
    },
    {
      label: "Skills tracked",
      value: user._count.skills,
      helper: "Areas of expertise showcased publicly",
    },
    {
      label: "Community activity",
      value: user._count.comments + user._count.reactions,
      helper: "Comments and appreciations you've shared",
    },
  ]

  const activityTimeline = [
    ...recentProjects.map((project: RecentProjectEntry) => ({
      id: project.id,
      label: "Project published",
      title: project.title,
      description: project.description,
      date: project.createdAt,
    })),
    ...recentCertificates.map((certificate: RecentCertificateEntry) => ({
      id: certificate.id,
      label: "Certification recorded",
      title: certificate.name,
      description: certificate.issuer,
      date: certificate.date,
    })),
    ...recentComments.map((comment: RecentCommentEntry) => ({
      id: comment.id,
      label: "Commented",
      title: comment.project.title,
      description: comment.content,
      date: comment.createdAt,
    })),
    ...recentReactions.map((reaction: RecentReactionEntry) => ({
      id: reaction.id,
      label: "Reacted",
      title: reaction.project.title,
      description: reaction.type.toLowerCase(),
      date: reaction.createdAt,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 6)

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(76,29,149,0.35),_transparent_55%)]" />
      <div className="relative z-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8">
          <AnimatedSection className="rounded-3xl border border-white/10 bg-background/70 p-8 shadow-xl backdrop-blur">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 border border-primary/40">
                  <AvatarImage src={user.imageUrl ?? undefined} alt={user.name ?? "Account avatar"} />
                  <AvatarFallback>{(user.name ?? user.email).slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Welcome back, {user.name ?? "there"}</h1>
                  <p className="text-sm text-muted-foreground">
                    Member since {format(user.createdAt, "MMMM d, yyyy")} &middot; Role: {user.role ?? "Member"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                <Badge variant="outline" className="border-primary/50 text-primary">
                  {user.username ? `@${user.username}` : "No username set"}
                </Badge>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {user.email}
                </Badge>
              </div>
            </div>
          </AnimatedSection>

          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <AnimatedSection delay={0.05} className="space-y-6">
              <AccountProfileForm
                user={{
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  username: user.username,
                  imageUrl: user.imageUrl,
                }}
              />
              <Card className="bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">Recent highlights</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    The latest work and recognitions associated with your profile.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentProjects.length === 0 && recentCertificates.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Add projects or certifications to see them here. Your newest entries will appear automatically.
                    </p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {recentProjects.map((project: RecentProjectEntry) => (
                        <div
                          key={project.id}
                          className="rounded-2xl border border-border/60 bg-background/40 p-4 shadow-sm"
                        >
                          <p className="text-xs font-semibold uppercase tracking-wide text-primary/80">
                            Project
                          </p>
                          <p className="mt-2 text-base font-medium">{project.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(project.createdAt, "MMM d, yyyy")} • {project.featured ? "Featured" : "Published"}
                          </p>
                        </div>
                      ))}
                      {recentCertificates.map((certificate: RecentCertificateEntry) => (
                        <div
                          key={certificate.id}
                          className="rounded-2xl border border-border/60 bg-background/40 p-4 shadow-sm"
                        >
                          <p className="text-xs font-semibold uppercase tracking-wide text-primary/80">
                            Certification
                          </p>
                          <p className="mt-2 text-base font-medium">{certificate.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {certificate.issuer} • {format(certificate.date, "MMM d, yyyy")}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={0.1} className="space-y-6">
              <Card className="bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">At a glance</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    A summary of how your account contributes across the platform.
                  </p>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="flex items-start justify-between gap-3 rounded-2xl border border-border/60 bg-background/40 p-4"
                    >
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                        <p className="text-xs text-muted-foreground/80">{stat.helper}</p>
                      </div>
                      <span className="text-2xl font-semibold text-primary">{stat.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">Signature skills</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    The competencies you’ve logged most experience with.
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topSkills.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Showcase your strengths by adding skills from the dashboard.
                    </p>
                  ) : (
                    topSkills.map((skill: TopSkillEntry) => (
                      <div
                        key={skill.id}
                        className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/40 p-4"
                      >
                        <div>
                          <p className="text-base font-medium">{skill.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {skill.category} • {skill.level} • {skill.years.toFixed(1)} yrs
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <AccountAnnouncementPreferences />
            </AnimatedSection>
          </div>

          <AnimatedSection delay={0.12} className="space-y-4 rounded-3xl border border-white/10 bg-background/70 p-8">
            <div>
              <h2 className="text-2xl font-semibold">Activity timeline</h2>
              <p className="text-sm text-muted-foreground">
                A quick look at the latest actions tied to your account.
              </p>
            </div>
            {activityTimeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Once you begin interacting with projects, your activity will appear here.
              </p>
            ) : (
              <div className="space-y-3">
                {activityTimeline.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-1 rounded-2xl border border-border/50 bg-background/40 p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-semibold uppercase tracking-wide text-primary/80">
                        {item.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(item.date, "MMM d, yyyy HH:mm")}
                      </span>
                    </div>
                    <p className="text-base font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                  </div>
                ))}
              </div>
            )}
          </AnimatedSection>
        </div>
      </div>
    </div>
  )
}
