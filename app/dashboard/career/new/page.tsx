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

export default function NewCareerPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPresentPosition, setIsPresentPosition] = useState(false)
  const [logoUrl, setLogoUrl] = useState("")
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const position = formData.get("position") as string
    const company = formData.get("company") as string
    const startDate = formData.get("startDate") as string
    const endDate = isPresentPosition ? "Present" : (formData.get("endDate") as string)
    const description = formData.get("description") as string
    const location = formData.get("location") as string

    try {
      const response = await fetch("/api/career", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          position,
          company,
          startDate,
          endDate,
          description,
          location,
          logoUrl,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create career entry")
      }

      toast({
        title: "Career entry created",
        description: "Your career entry has been created successfully.",
      })

      router.push("/dashboard/career")
      router.refresh()
    } catch (error) {
      console.error("Career entry creation error:", error)
      toast({
        title: "Creation failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    // Create a preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload the file
    setUploadingLogo(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to upload logo")
      }

      const data = await response.json()
      setLogoUrl(data.imageUrl)

      toast({
        title: "Logo uploaded",
        description: "Company logo has been uploaded successfully.",
      })
    } catch (error) {
      console.error("Logo upload error:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
      // Reset preview on error
      setLogoPreview(null)
    } finally {
      setUploadingLogo(false)
    }
  }

  function triggerFileInput() {
    fileInputRef.current?.click()
  }

  function removeLogo() {
    setLogoUrl("")
    setLogoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div>
      <DashboardHeader heading="Add New Position" text="Add a new career position to your portfolio">
        <Link href="/dashboard/career">
          <Button variant="outline" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Career
          </Button>
        </Link>
      </DashboardHeader>
      <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle>Position Details</CardTitle>
          <CardDescription>Fill in the details of your new career position.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input id="position" name="position" placeholder="Job position" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" placeholder="Company name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" placeholder="City, Country" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-logo">Company Logo</Label>
              <div className="mt-2 flex items-center gap-4">
                {logoPreview ? (
                  <div className="relative h-16 w-16 overflow-hidden rounded-md border">
                    <Image
                      src={logoPreview || "/placeholder.svg"}
                      alt="Company logo preview"
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-0 top-0 h-6 w-6 rounded-full"
                      onClick={removeLogo}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove logo</span>
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={triggerFileInput}
                    disabled={uploadingLogo}
                    className="h-16 w-16 rounded-md border border-dashed"
                  >
                    <Upload className="h-4 w-4" />
                    <span className="sr-only">Upload company logo</span>
                  </Button>
                )}
                <div>
                  <input
                    ref={fileInputRef}
                    id="company-logo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                  />
                  <p className="text-sm text-muted-foreground">
                    {uploadingLogo ? "Uploading logo..." : "Upload a company logo (PNG, JPG, GIF up to 5MB)"}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" name="startDate" type="date" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 pb-2">
                <input
                  id="currentPosition"
                  type="checkbox"
                  checked={isPresentPosition}
                  onChange={(e) => setIsPresentPosition(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="currentPosition">Current Position</Label>
              </div>
              {!isPresentPosition && (
                <>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" name="endDate" type="date" required={!isPresentPosition} />
                </>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Job description and responsibilities"
                rows={5}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting || uploadingLogo} className="w-full md:w-auto">
              {isSubmitting ? "Creating..." : "Create Position"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
