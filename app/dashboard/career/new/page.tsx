"use client"

import type React from "react"

import { useState } from "react"
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

export default function NewCareerPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPresentPosition, setIsPresentPosition] = useState(false)
  const [logoUrl, setLogoUrl] = useState("")

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
            <FileUpload
              id="company-logo"
              label="Company Logo"
              value={logoUrl}
              onChange={setLogoUrl}
              accept="image/*"
              maxSize={1}
            />
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
            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
              {isSubmitting ? "Creating..." : "Create Position"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

