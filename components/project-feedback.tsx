"use client"

import { useMemo, useState } from "react"
import type { ReactNode } from "react"
import useSWR from "swr"
import { formatDistanceToNow } from "date-fns"
import { MessageCircle, Sparkles, ThumbsUp } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import type {
  ProjectComment,
  ReactionSummary,
  ReactionType,
} from "@/types/database"

interface ProjectFeedbackProps {
  projectId: string
  initialComments: ProjectComment[]
  initialReactions: ReactionSummary
}

interface CommentsResponse {
  comments: ProjectComment[]
}

const fetcher = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(await response.text())
  }

  return response.json() as Promise<T>
}

const reactionLabels: Record<ReactionType, { label: string; icon: ReactNode }> = {
  LIKE: {
    label: "Like",
    icon: <ThumbsUp className="h-4 w-4" aria-hidden="true" />,
  },
  INSIGHTFUL: {
    label: "Insightful",
    icon: <Sparkles className="h-4 w-4" aria-hidden="true" />,
  },
  CELEBRATE: {
    label: "Celebrate",
    icon: <MessageCircle className="h-4 w-4" aria-hidden="true" />,
  },
}

export function ProjectFeedback({ projectId, initialComments, initialReactions }: ProjectFeedbackProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    data: commentsData,
    mutate: mutateComments,
    isLoading: commentsLoading,
  } = useSWR<CommentsResponse>(`/api/projects/${projectId}/comments`, fetcher, {
    fallbackData: { comments: initialComments },
  })

  const {
    data: reactions,
    mutate: mutateReactions,
  } = useSWR<ReactionSummary>(`/api/projects/${projectId}/reactions`, fetcher, {
    fallbackData: initialReactions,
  })

  const orderedComments = useMemo(() => commentsData?.comments ?? [], [commentsData])

  async function handleCommentSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!comment.trim()) {
      toast({
        title: "Add a comment first",
        description: "Please share a quick message before posting.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/projects/${projectId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || "We couldn't save your comment right now")
      }

      const next = (await response.json()) as CommentsResponse
      await mutateComments(next, { revalidate: false })
      setComment("")
      toast({
        title: "Thank you!",
        description: "Your comment is now live.",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Something went wrong",
        description:
          error instanceof Error ? error.message : "We couldn't save your comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleReactionClick(type: ReactionType) {
    try {
      const response = await fetch(`/api/projects/${projectId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || "We couldn't update your reaction")
      }

      const summary = (await response.json()) as ReactionSummary
      await mutateReactions(summary, { revalidate: false })
    } catch (error) {
      console.error(error)
      toast({
        title: "Action unavailable",
        description:
          error instanceof Error
            ? error.message
            : "We couldn't store your reaction. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-background/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-xl">
            Community feedback
            <span className="text-sm font-normal text-muted-foreground">
              {reactions?.total ?? initialReactions.total} reactions
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {(Object.keys(reactionLabels) as ReactionType[]).map((key) => {
              const isActive = reactions?.userReaction === key
              const count = reactions?.counts?.[key] ?? initialReactions.counts[key]

              return (
                <Button
                  key={key}
                  type="button"
                  variant={isActive ? "default" : "outline"}
                  onClick={() => handleReactionClick(key)}
                  disabled={!session?.user}
                  className="gap-2"
                >
                  {reactionLabels[key].icon}
                  <span>{reactionLabels[key].label}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                    {count}
                  </span>
                </Button>
              )
            })}
          </div>
          {!session?.user && (
            <p className="text-sm text-muted-foreground">
              <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
                Create a free account
              </Link>{" "}
              or sign in to leave reactions and comments.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-background/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {session?.user ? (
            <form onSubmit={handleCommentSubmit} className="space-y-3">
              <Textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Share your thoughts about this project..."
                maxLength={600}
                aria-label="Project comment"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{600 - comment.length} characters remaining</span>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Posting..." : "Publish comment"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="rounded-md border border-dashed border-primary/40 p-4 text-sm text-muted-foreground">
              <p className="mb-2 font-medium">Sign in to join the conversation.</p>
              <p>
                <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                  Sign in
                </Link>{" "}
                or{" "}
                <Link href="/register" className="text-primary underline-offset-4 hover:underline">
                  create a free account
                </Link>
                to share feedback.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {commentsLoading && orderedComments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Loading comments...</p>
            ) : orderedComments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No comments yet. Be the first to share your perspective!
              </p>
            ) : (
              orderedComments.map((item) => (
                <div key={item.id} className="rounded-md border border-border bg-background/80 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium">{item.user?.name ?? "Community member"}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">{item.content}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
