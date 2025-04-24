"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { DashboardHeader } from "@/components/dashboard-header"
import { FileUpload } from "@/components/file-upload"
import { FeatureInput } from "@/components/feature-input"

export default function NewProjectPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [logContent, setLogContent] = useState("")
  const [features, setFeatures] = useState<any[]>([])
  const logFileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingLog, setUploadingLog] = useState(false)

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
    const developmentProcess = formData.get("developmentProcess") as string
    const challengesFaced = formData.get("challengesFaced") as string
    const futurePlans = formData.get("futurePlans") as string

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
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
          logContent,
          features: features.map((feature) => ({
            name: feature.name,
            description: feature.description,
          })),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create project")
      }

      toast({
        title: "Project created",
        description: "Your project has been created successfully.",
      })

      router.push("/dashboard/projects")
      router.refresh()
    } catch (error) {
      console.error("Project creation error:", error)
      toast({
        title: "Creation failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleLogFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingLog(true)

    try {
      // Read file content
      const text = await file.text()
      setLogContent(text)

      toast({
        title: "Log file loaded",
        description: "Log file has been loaded successfully.",
      })
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

  return (
    <div>
      <DashboardHeader heading="Add New Project" text="Create a new project for your portfolio">
        <Link href="/dashboard/projects">
          <Button variant="outline" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Projects
          </Button>
        </Link>
      </DashboardHeader>
      <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Fill in the details of your new project.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="Project title" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="Project description" rows={5} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="technologies">Technologies</Label>
              <Input id="technologies" name="technologies" placeholder="Next.js, TypeScript, Tailwind CSS" required />
              <p className="text-sm text-muted-foreground">Separate technologies with commas</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="link">Project Link</Label>
                <Input id="link" name="link" placeholder="https://example.com/project" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="githubUrl">GitHub Repository</Label>
                <Input id="githubUrl" name="githubUrl" placeholder="https://github.com/username/repo" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>

            <FeatureInput features={features} onChange={setFeatures} />

            <div className="space-y-2">
              <Label htmlFor="developmentProcess">Development Process</Label>
              <Textarea
                id="developmentProcess"
                name="developmentProcess"
                placeholder="Describe your development process, methodology, and approach"
                rows={3}
                defaultValue="This project was developed using an agile methodology, with regular iterations and feedback cycles. The development process included planning, design, implementation, testing, and deployment phases."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="challengesFaced">Challenges Faced</Label>
              <Textarea
                id="challengesFaced"
                name="challengesFaced"
                placeholder="Describe any challenges you faced during development and how you overcame them"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="futurePlans">Future Plans</Label>
              <Textarea
                id="futurePlans"
                name="futurePlans"
                placeholder="Describe any future plans or improvements for this project"
                rows={3}
              />
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
                  <Button type="button" variant="outline" onClick={triggerLogFileInput} disabled={uploadingLog}>
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
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input id="featured" name="featured" type="checkbox" className="h-4 w-4 rounded border-gray-300" />
              <Label htmlFor="featured">Featured Project</Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting || uploadingLog} className="w-full md:w-auto">
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
