import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { MessageCircle, ThumbsUp, Users, Sparkles } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { EngagementHighlights } from "@/types/database"

interface CommunityHighlightsProps {
  highlights: EngagementHighlights
}

export function CommunityHighlights({ highlights }: CommunityHighlightsProps) {
  const { totalComments, totalReactions, memberCount, topProjects, latestComment } = highlights

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30 backdrop-blur-sm">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
              Community momentum
            </h2>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              Join a focused builder community. Share feedback, celebrate launches, and keep discussions constructive.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border border-purple-200 dark:border-purple-900/50 bg-background/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Comments shared</CardTitle>
              <MessageCircle className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalComments}</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Real insights and implementation notes from peers.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-purple-200 dark:border-purple-900/50 bg-background/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Reactions logged</CardTitle>
              <ThumbsUp className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalReactions}</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Highlight the case studies that resonate with you most.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-purple-200 dark:border-purple-900/50 bg-background/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Community members</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{memberCount}</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Free profiles can comment and react—perfect for collaborators.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border border-purple-200 dark:border-purple-900/50 bg-background/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Most discussed projects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {topProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Be the first to add feedback—new projects are waiting for your input.
                </p>
              ) : (
                topProjects.map((project) => (
                  <div key={project.id} className="rounded-lg border border-border/60 bg-background/60 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <Link
                          href={`/projects/${project.id}`}
                          className="text-base font-semibold hover:text-primary"
                        >
                          {project.title}
                        </Link>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                      </Badge>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" /> {project.commentCount} comments
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" /> {project.reactionCount} reactions
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border border-purple-200 dark:border-purple-900/50 bg-background/80 backdrop-blur">
            <CardHeader>
              <CardTitle>Latest community activity</CardTitle>
            </CardHeader>
            <CardContent>
              {latestComment ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4 text-left">
                    <p className="text-sm text-muted-foreground">
                      “{latestComment.content.length > 180
                        ? `${latestComment.content.slice(0, 177)}...`
                        : latestComment.content}”
                    </p>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium text-foreground">
                        {latestComment.authorName ?? "Community member"}
                      </span>{" "}
                      on{" "}
                      <Link href={`/projects/${latestComment.projectId}`} className="text-primary underline-offset-4 hover:underline">
                        {latestComment.projectTitle}
                      </Link>
                    </p>
                    <p>Shared {formatDistanceToNow(new Date(latestComment.createdAt), { addSuffix: true })}</p>
                  </div>
                  <div className="pt-2">
                    <Link href="/register" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                      Create a free profile to join the conversation →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>No comments yet—your feedback can shape the roadmap.</p>
                  <Link href="/register" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                    Register now and leave the first comment →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
