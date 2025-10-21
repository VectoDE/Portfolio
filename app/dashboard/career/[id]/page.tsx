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
import { FileUpload } from "@/components/file-upload"

interface EditCareerPageProps {
  params: Promise<{
    id: string
  }>
}

interface CareerEntry {
  id: string
  position: string
  company: string
  startDate: string
  endDate: string
  description: string
  location?: string | null
  logoUrl?: string | null
}

interface CareerEntry {
  id: string
  position: string
  company: string
  startDate: string
  endDate: string
  description: string
  location?: string | null
  logoUrl?: string | null
}

export default function EditCareerPage({ params }: EditCareerPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [careerEntry, setCareerEntry] = useState<CareerEntry | null>(null)
  const [isPresentPosition, setIsPresentPosition] = useState(false)
  const [logoUrl, setLogoUrl] = useState("")
  const [careerId, setCareerId] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    params
      .then((value) => {
        if (!isMounted) {
          return
        }

        if (!value?.id) {
          console.error("Missing career id in route params")
          toast({
            title: "Invalid route",
            description: "The career entry identifier is missing from the URL.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }

        setCareerId(value.id)
      })
      .catch((error) => {
        if (!isMounted) {
          return
        }

        console.error("Failed to resolve career route params:", error)
        toast({
          title: "Invalid route",
          description: "We were unable to read the career entry identifier from the URL.",
          variant: "destructive",
        })
        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [params, toast])

  useEffect(() => {
    if (!careerId) {
      return
    }

    async function fetchCareerEntry() {
      try {
        const response = await fetch(`/api/career/${careerId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch career entry")
        }

        const data: { career: CareerEntry } = await response.json()
        setCareerEntry(data.career)
        setIsPresentPosition(data.career.endDate === "Present")
        setLogoUrl(data.career.logoUrl || "")
      } catch (error) {
        console.error("Error fetching career entry:", error)
        toast({
          title: "Error",
          description: "Failed to load career entry details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCareerEntry()
  }, [careerId, toast])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    if (!careerId) {
      toast({
        title: "Missing career entry",
        description: "We couldn't determine which career entry should be updated.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    const formData = new FormData(event.currentTarget)
    const position = formData.get("position") as string
    const company = formData.get("company") as string
    const startDate = formData.get("startDate") as string
    const endDate = isPresentPosition ? "Present" : (formData.get("endDate") as string)
    const description = formData.get("description") as string
    const location = formData.get("location") as string

    try {
      const response = await fetch(`/api/career/${careerId}`, {
        method: "PUT",
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
        throw new Error(error.error || "Failed to update career entry")
      }

      toast({
        title: "Career entry updated",
        description: "Your career entry has been updated successfully.",
      })

      router.push("/dashboard/career")
      router.refresh()
    } catch (error) {
      console.error("Career entry update error:", error)
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
    if (!confirm("Are you sure you want to delete this career entry?")) {
      return
    }

    if (!careerId) {
      toast({
        title: "Missing career entry",
        description: "We couldn't determine which career entry should be deleted.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/career/${careerId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete career entry")
      }

      toast({
        title: "Career entry deleted",
        description: "Your career entry has been deleted successfully.",
      })

      router.push("/dashboard/career")
      router.refresh()
    } catch (error) {
      console.error("Career entry deletion error:", error)
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
        <DashboardHeader heading="Edit Career Entry" text="Loading career entry details..." />
        <div className="flex items-center justify-center h-32">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!careerEntry) {
    return (
      <div>
        <DashboardHeader heading="Edit Career Entry" text="Career entry not found" />
        <div className="flex flex-col items-center justify-center h-32 gap-4">
          <p>The requested career entry could not be found.</p>
          <Link href="/dashboard/career">
            <Button>Back to Career</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Format date string for input field (yyyy-MM-dd)
  const formatDateForInput = (dateString: string | null) => {
    if (!dateString || dateString === "Present") return ""
    const date = new Date(dateString)
    return date.toISOString().split("T")[0]
  }

  return (
    <div>
      <DashboardHeader heading="Edit Career Entry" text="Update your career position details">
        <Link href="/dashboard/career">
          <Button variant="outline" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Career
          </Button>
        </Link>
      </DashboardHeader>
      <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle>Position Details</CardTitle>
          <CardDescription>Update the details of your career position.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                name="position"
                defaultValue={careerEntry.position}
                placeholder="Job position"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                defaultValue={careerEntry.company}
                placeholder="Company name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                defaultValue={careerEntry.location || ""}
                placeholder="City, Country"
              />
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
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={formatDateForInput(careerEntry.startDate)}
                required
              />
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
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    defaultValue={formatDateForInput(careerEntry.endDate)}
                    required={!isPresentPosition}
                  />
                </>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={careerEntry.description}
                placeholder="Job description and responsibilities"
                rows={5}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete Entry
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

