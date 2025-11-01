"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, X } from "lucide-react"

import { AnimatedList } from "@/components/animated-list"
import { AnimatedSection } from "@/components/animated-section"
import { DashboardHeader } from "@/components/dashboard-header"
import { FeatureInput } from "@/components/feature-input"
import type { FeatureDraft } from "@/components/feature-input"
import { FileUpload } from "@/components/file-upload"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { PROJECT_LONGFORM_MAX_LENGTH } from "@/lib/project-validation"
import type { Project } from "@/types/database"

interface EditProjectPageClientProps {
  id?: string
}

export default function EditProjectPageClient({ id }: EditProjectPageClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [project, setProject] = useState<Project | null>(null)
  const [imageUrl, setImageUrl] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [logContent, setLogContent] = useState("")
  const [features, setFeatures] = useState<FeatureDraft[]>([])
  const logFileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingLog, setUploadingLog] = useState(false)
  const formattedLongFormLimit = new Intl.NumberFormat().format(PROJECT_LONGFORM_MAX_LENGTH)

  useEffect(() => {
    if (id) {
      return
    }

    console.error("Missing project id in route params")
    toast({
      title: "Invalid route",
      description: "The project identifier is missing from the URL.",
      variant: "destructive",
    })
    setIsLoading(false)
  }, [id, toast])

  useEffect(() => {
    if (!id) {
      return
    }

    async function fetchProject() {
      try {
        const response = await fetch(`/api/projects/${id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch project")
        }

        const data: {
          project: Project & {
            features?: Array<{ id: string; name: string; description: string | null }>
          }
        } = await response.json()

        setProject(data.project)
        setImageUrl(data.project.imageUrl || "")
        setLogoUrl(data.project.logoUrl || "")
        setLogContent(data.project.logContent || "")
        setFeatures(
          (data.project.features || []).map((feature) => ({
            id: feature.id,
            name: feature.name,
            description: feature.description ?? "",
          })),
        )
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
  }, [id, toast])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    if (!id) {
      toast({
        title: "Missing project",
        description: "We couldn't determine which project should be updated.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    const formData = new FormData(event.currentTarget)
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const technologies = formData.get("technologies") as string
    const link = formData.get("link") as string
    const githubUrl = formData.get("githubUrl") as string
    const featured = Boolean(formData.get("featured"))
    const developmentProcess = formData.get("developmentProcess") as string
    const challengesFaced = formData.get("challengesFaced") as string
    const futurePlans = formData.get("futurePlans") as string
    const safeLogContent =
      logContent.length > PROJECT_LONGFORM_MAX_LENGTH
        ? logContent.slice(0, PROJECT_LONGFORM_MAX_LENGTH)
        : logContent

    try {
      const response = await fetch(`/api/projects/${id}`, {
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
          logoUrl,
          featured,
          developmentProcess,
          challengesFaced,
          futurePlans,
          logContent: safeLogContent,
          features: features
            .filter((feature) => feature.name.trim().length > 0)
            .map((feature) => ({
              name: feature.name,
              description: feature.description.trim() ? feature.description : null,
            })),
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

    if (!id) {
      toast({
        title: "Missing project",
        description: "We couldn't determine which project should be deleted.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/projects/${id}`, {
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

  async function handleLogFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingLog(true)

    try {
      const text = await file.text()
      if (text.length > PROJECT_LONGFORM_MAX_LENGTH) {
        setLogContent(text.slice(0, PROJECT_LONGFORM_MAX_LENGTH))
        toast({
          title: "Log truncated",
          description: `The uploaded log exceeded ${formattedLongFormLimit} characters and was truncated to fit the storage limit.`,
        })
      } else {
        setLogContent(text)
        toast({
          title: "Log file loaded",
          description: "Log file has been loaded successfully.",
        })
      }
    } catch (error) {
      console.error("Log file reading error:", error)
      toast({
        title: "File reading failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setUploadingLog(false)
    }
  }

  function triggerLogFileInput() {
    logFileInputRef.current?.click()
  }

  function removeLogFile() {
    setLogContent("")
    if (logFileInputRef.current) {
      logFileInputRef.current.value = ""
    }
  }

  if (isLoading) {
    return (
      <AnimatedSection className="space-y-6">
        <DashboardHeader heading="Edit Project" text="Loading project details..." />
        <div className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AnimatedSection>
    )
  }

  if (!project) {
    return (
      <AnimatedSection className="space-y-6">
        <DashboardHeader heading="Edit Project" text="Project not found" />
        <div className="flex flex-col items-center justify-center h-32 gap-4">
          <p className="text-muted-foreground">The requested project could not be found.</p>
          <Link href="/dashboard/projects">
            <Button>Back to Projects</Button>
          </Link>
        </div>
      </AnimatedSection>
    )
  }

  return (
    <AnimatedSection className="space-y-6">
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
          <CardContent>
            <AnimatedList className="space-y-6" initialDelay={0.1}>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={project.title}
                  placeholder="Project title"
                  required
                />
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

              <AnimatedList className="grid grid-cols-1 gap-6 md:grid-cols-2" stagger={0.12}>
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
              </AnimatedList>

              <AnimatedList className="grid grid-cols-1 gap-6 md:grid-cols-2" stagger={0.12} initialDelay={0.08}>
                <FileUpload
                  id="project-image"
                  label="Project Screenshot"
                  value={imageUrl}
                  onChange={setImageUrl}
                  accept="image/*"
                  maxSize={2}
                />

                <FileUpload
                  id="project-logo"
                  label="Project Logo"
                  value={logoUrl}
                  onChange={setLogoUrl}
                  accept="image/*"
                  maxSize={1}
                />
              </AnimatedList>

              <div className="space-y-4">
                <Label className="font-medium">Feature Highlights</Label>
                <FeatureInput features={features} onChange={setFeatures} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="developmentProcess">Development Process</Label>
                <Textarea
                  id="developmentProcess"
                  name="developmentProcess"
                  placeholder="Describe your development process, methodology, and approach"
                  rows={3}
                  maxLength={PROJECT_LONGFORM_MAX_LENGTH}
                  defaultValue={
                    project.developmentProcess ||
                    "This project was developed using an agile methodology, with regular iterations and feedback cycles. The development process included planning, design, implementation, testing, and deployment phases."
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Maximum {formattedLongFormLimit} characters. Longer entries will be trimmed automatically.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="challengesFaced">Challenges Faced</Label>
                <Textarea
                  id="challengesFaced"
                  name="challengesFaced"
                  placeholder="Describe any challenges you faced during development and how you overcame them"
                  rows={3}
                  maxLength={PROJECT_LONGFORM_MAX_LENGTH}
                  defaultValue={project.challengesFaced || ""}
                />
                <p className="text-xs text-muted-foreground">Maximum {formattedLongFormLimit} characters.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="futurePlans">Future Plans</Label>
                <Textarea
                  id="futurePlans"
                  name="futurePlans"
                  placeholder="Describe any future plans or improvements for this project"
                  rows={3}
                  maxLength={PROJECT_LONGFORM_MAX_LENGTH}
                  defaultValue={project.futurePlans || ""}
                />
                <p className="text-xs text-muted-foreground">Maximum {formattedLongFormLimit} characters.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="log-file">Project Log File</Label>
                <div className="mt-2 flex flex-col gap-4">
                  {logContent && (
                    <div className="relative overflow-hidden rounded-md border p-3 bg-gray-900 text-gray-200">
                      <pre className="text-xs overflow-auto max-h-40">
                        {logContent.slice(0, 500)}
                        {logContent.length > 500 && "..."}
                      </pre>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2 h-6 w-6 rounded-full"
                        onClick={removeLogFile}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove log file</span>
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={triggerLogFileInput}
                      disabled={uploadingLog}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {logContent ? "Change Log File" : "Upload Log File"}
                    </Button>
                    <input
                      ref={logFileInputRef}
                      id="log-file"
                      type="file"
                      accept=".log,.txt"
                      className="hidden"
                      onChange={handleLogFileUpload}
                      disabled={uploadingLog}
                    />
                    {uploadingLog && <p className="text-sm text-muted-foreground">Loading log file...</p>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Maximum {formattedLongFormLimit} characters of log content will be stored.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 rounded-lg border border-primary/10 bg-muted/20 p-4">
                <input
                  id="featured"
                  name="featured"
                  type="checkbox"
                  defaultChecked={project.featured}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="featured">Featured Project</Label>
              </div>
            </AnimatedList>
          </CardContent>
          <CardFooter>
            <AnimatedList className="flex w-full flex-col gap-4 sm:flex-row sm:justify-between" stagger={0.12}>
              <Button type="button" variant="destructive" onClick={handleDelete}>
                Delete Project
              </Button>
              <Button type="submit" disabled={isSubmitting || uploadingLog}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </AnimatedList>
          </CardFooter>
        </form>
      </Card>
    </AnimatedSection>
  )
}
