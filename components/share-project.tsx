"use client"

import { useCallback, useState } from "react"
import Link from "next/link"
import { Check, Link2, Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface ShareProjectProps {
  projectTitle: string
  projectUrl: string
}

export function ShareProject({ projectTitle, projectUrl }: ShareProjectProps) {
  const { toast } = useToast()
  const [hasCopied, setHasCopied] = useState(false)

  const shareMessage = `Check out ${projectTitle} by Tim Hauke: ${projectUrl}`
  const encodedMessage = encodeURIComponent(shareMessage)
  const encodedUrl = encodeURIComponent(projectUrl)
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(projectUrl)
      setHasCopied(true)
      toast({
        title: "Link copied",
        description: "Share it with collaborators or leave a reaction.",
      })
      setTimeout(() => setHasCopied(false), 3000)
    } catch (error) {
      console.error("Copy failed", error)
      toast({
        title: "Copy failed",
        description: "Please copy the link manually.",
        variant: "destructive",
      })
    }
  }, [projectUrl, toast])

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: projectTitle,
          text: `Discover this project by Tim Hauke`,
          url: projectUrl,
        })
      } catch (error) {
        console.error("Share cancelled", error)
      }
    } else {
      await handleCopy()
    }
  }, [handleCopy, projectTitle, projectUrl])

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Button onClick={handleShare} className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
        <Share2 className="h-4 w-4" />
        Share project
      </Button>
      <Button variant="outline" onClick={handleCopy} className="gap-2">
        {hasCopied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
        {hasCopied ? "Copied" : "Copy link"}
      </Button>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="ghost" className="text-sm text-muted-foreground hover:text-primary">
          <Link
            href={`https://twitter.com/intent/tweet?text=${encodedMessage}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            X / Twitter
          </Link>
        </Button>
        <Button asChild variant="ghost" className="text-sm text-muted-foreground hover:text-primary">
          <Link
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </Link>
        </Button>
        <Button asChild variant="ghost" className="text-sm text-muted-foreground hover:text-primary">
          <Link
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook
          </Link>
        </Button>
        <Button asChild variant="ghost" className="text-sm text-muted-foreground hover:text-primary">
          <Link
            href={`https://wa.me/?text=${encodedMessage}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </Link>
        </Button>
      </div>
    </div>
  )
}
