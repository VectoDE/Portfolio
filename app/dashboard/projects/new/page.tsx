"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Upload, X } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { DashboardHeader } from "@/components/dashboard-header"

export default function NewProjectPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
          featured,
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

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    // Create a preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload the file
    setUploadingImage(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to upload project image")
      }

      const data = await response.json()
      setImageUrl(data.imageUrl)

      toast({
        title: "Image uploaded",
        description: "Project image has been uploaded successfully.",
      })
    } catch (error) {
      console.error("Image upload error:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
      // Reset preview on error
      setImagePreview(null)
    } finally {
      setUploadingImage(false)
    }
  }

  function triggerFileInput() {
    fileInputRef.current?.click()
  }

  function removeImage() {
    setImageUrl("")
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
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
          <CardContent className="space-y-4">
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
            <div className="space-y-2">
              <Label htmlFor="link">Project Link</Label>
              <Input id="link" name="link" placeholder="https://example.com/project" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub Repository</Label>
              <Input id="githubUrl" name="githubUrl" placeholder="https://github.com/username/repo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-image">Project Image</Label>
              <div className="mt-2 flex flex-col gap-4">
                {imagePreview && (
                  <div className="relative overflow-hidden rounded-md border">
                    <div className="aspect-video relative w-full max-w-md">
                      <Image
                        src={imagePreview || "/placeholder.svg"}
                        alt="Project preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2 h-6 w-6 rounded-full"
                      onClick={removeImage}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove image</span>
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={triggerFileInput}
                    disabled={uploadingImage}
                    className={imagePreview ? "w-auto" : "h-32 w-full border-dashed"}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {imagePreview ? "Change Image" : "Upload Project Screenshot"}
                  </Button>
                  <input
                    ref={fileInputRef}
                    id="project-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                  {uploadingImage && <p className="text-sm text-muted-foreground">Uploading image...</p>}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input id="featured" name="featured" type="checkbox" className="h-4 w-4 rounded border-gray-300" />
              <Label htmlFor="featured">Featured Project</Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting || uploadingImage} className="w-full md:w-auto">
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
