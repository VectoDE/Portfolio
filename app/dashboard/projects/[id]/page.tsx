"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { FileUpload } from "@/components/file-upload"

interface EditProjectPageProps {
  params: {
    id: string
  }
}

export default function EditProjectPage({ params }: EditProjectPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [project, setProject] = useState<any>(null)
  const [imageUrl, setImageUrl] = useState("")

  useEffect(() => {
    async function fetchProject() {
      try {
        const response = await fetch(`/api/projects/${params.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch project")
        }

        const data = await response.json()
        setProject(data.project)
        setImageUrl(data.project.imageUrl || "")
      } catch (error) {
        console.error("Error fetching project:", error)
        toast({
          title: "Error",
          description: "Failed to load project details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [params.id, toast])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const technologies = formData.get("technologies") as string
    const link = formData.get("link") as string
    const githubUrl = formData.get("githubUrl") as string
    const featured = Boolean(formData.get("featured"))

    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          technologies,
          link,
          githubUrl,
          imageUrl,
          featured,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update project")
      }

      toast({
        title: "Project updated",
        description: "Your project has been updated successfully.",
      })

      router.push("/dashboard/projects")
      router.refresh()
    } catch (error) {
      console.error("Project update error:", error)
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this project?")) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete project")
      }

      toast({
        title: "Project deleted",
        description: "Your project has been deleted successfully.",
      })

      router.push("/dashboard/projects")
      router.refresh()
    } catch (error) {
      console.error("Project deletion error:", error)
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div>
        <DashboardHeader heading="Edit Project" text="Loading project details..." />
        <div className="flex items-center justify-center h-32">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div>
        <DashboardHeader heading="Edit Project" text="Project not found" />
        <div className="flex flex-col items-center justify-center h-32 gap-4">
          <p>The requested project could not be found.</p>
          <Link href="/dashboard/projects">
            <Button>Back to Projects</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <DashboardHeader heading="Edit Project" text="Update your project details">
        <Link href="/dashboard/projects">
          <Button variant="outline" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Projects
          </Button>
        </Link>
      </DashboardHeader>
      <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Update the details of your project.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={project.title} placeholder="Project title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={project.description}
                placeholder="Project description"
                rows={5}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="technologies">Technologies</Label>
              <Input
                id="technologies"
                name="technologies"
                defaultValue={project.technologies}
                placeholder="Next.js, TypeScript, Tailwind CSS"
                required
              />
              <p className="text-sm text-muted-foreground">Separate technologies with commas</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="link">Project Link</Label>
              <Input
                id="link"
                name="link"
                defaultValue={project.link || ""}
                placeholder="https://example.com/project"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub Repository</Label>
              <Input
                id="githubUrl"
                name="githubUrl"
                defaultValue={project.githubUrl || ""}
                placeholder="https://github.com/username/repo"
              />
            </div>
            <FileUpload
              id="project-image"
              label="Project Image"
              value={imageUrl}
              onChange={setImageUrl}
              accept="image/*"
              maxSize={2}
            />
            <div className="flex items-center space-x-2">
              <input
                id="featured"
                name="featured"
                type="checkbox"
                defaultChecked={project.featured}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="featured">Featured Project</Label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete Project
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

