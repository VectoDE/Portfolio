"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Upload, X } from "lucide-react"
import Image from "next/image"

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
import { useToast } from "@/components/ui/use-toast"
import { DashboardHeader } from "@/components/dashboard-header"

export default function NewCertificatePage() {
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
    const name = formData.get("name") as string
    const issuer = formData.get("issuer") as string
    const date = formData.get("date") as string
    const link = formData.get("link") as string

    try {
      const response = await fetch("/api/certificates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          issuer,
          date,
          link,
          imageUrl,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create certificate")
      }

      toast({
        title: "Certificate created",
        description: "Your certificate has been created successfully.",
      })

      router.push("/dashboard/certificates")
      router.refresh()
    } catch (error) {
      console.error("Certificate creation error:", error)
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
        throw new Error(error.error || "Failed to upload certificate image")
      }

      const data = await response.json()
      setImageUrl(data.imageUrl)

      toast({
        title: "Image uploaded",
        description: "Certificate image has been uploaded successfully.",
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
      <DashboardHeader
        heading="Add New Certificate"
        text="Add a new certification to your portfolio"
      >
        <Link href="/dashboard/certificates">
          <Button variant="outline" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Certificates
          </Button>
        </Link>
      </DashboardHeader>
      <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle>Certificate Details</CardTitle>
          <CardDescription>Fill in the details of your new certification.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Certificate Name</Label>
              <Input id="name" name="name" placeholder="Certificate name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issuer">Issuer</Label>
              <Input id="issuer" name="issuer" placeholder="Certificate issuer" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link">Certificate Link</Label>
              <Input id="link" name="link" placeholder="https://example.com/certificate" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="certificate-image">Certificate Image</Label>
              <div className="mt-2 flex flex-col gap-4">
                {imagePreview && (
                  <div className="relative overflow-hidden rounded-md border">
                    <div className="aspect-video relative w-full max-w-md">
                      <Image
                        src={imagePreview || "/placeholder.svg"}
                        alt="Certificate preview"
                        fill
                        className="object-contain"
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
                    {imagePreview ? "Change Image" : "Upload Certificate Image"}
                  </Button>
                  <input
                    ref={fileInputRef}
                    id="certificate-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                  {uploadingImage && (
                    <p className="text-sm text-muted-foreground">Uploading image...</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={isSubmitting || uploadingImage}
              className="w-full md:w-auto"
            >
              {isSubmitting ? "Creating..." : "Create Certificate"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
