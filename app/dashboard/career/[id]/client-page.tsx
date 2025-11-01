"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { AnimatedList } from "@/components/animated-list"
import { AnimatedSection } from "@/components/animated-section"
import { DashboardHeader } from "@/components/dashboard-header"
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

interface EditCareerPageClientProps {
  id?: string
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

export default function EditCareerPageClient({ id }: EditCareerPageClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [careerEntry, setCareerEntry] = useState<CareerEntry | null>(null)
  const [isPresentPosition, setIsPresentPosition] = useState(false)
  const [logoUrl, setLogoUrl] = useState("")

  useEffect(() => {
    if (id) {
      return
    }

    console.error("Missing career id in route params")
    toast({
      title: "Invalid route",
      description: "The career entry identifier is missing from the URL.",
      variant: "destructive",
    })
    setIsLoading(false)
  }, [id, toast])

  useEffect(() => {
    if (!id) {
      return
    }

    async function fetchCareerEntry() {
      try {
        const response = await fetch(`/api/career/${id}`)

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
  }, [id, toast])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    if (!id) {
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
      const response = await fetch(`/api/career/${id}`, {
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

    if (!id) {
      toast({
        title: "Missing career entry",
        description: "We couldn't determine which career entry should be deleted.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/career/${id}`, {
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
      <AnimatedSection className="space-y-6">
        <DashboardHeader heading="Edit Career Entry" text="Loading career entry details..." />
        <div className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AnimatedSection>
    )
  }

  if (!careerEntry) {
    return (
      <AnimatedSection className="space-y-6">
        <DashboardHeader heading="Edit Career Entry" text="Career entry not found" />
        <div className="flex flex-col items-center justify-center h-32 gap-4">
          <p className="text-muted-foreground">The requested career entry could not be found.</p>
          <Link href="/dashboard/career">
            <Button>Back to Career</Button>
          </Link>
        </div>
      </AnimatedSection>
    )
  }

  const formatDateForInput = (dateString: string | null) => {
    if (!dateString || dateString === "Present") return ""
    const date = new Date(dateString)
    return date.toISOString().split("T")[0]
  }

  return (
    <AnimatedSection className="space-y-6">
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
          <CardContent>
            <AnimatedList className="space-y-4" initialDelay={0.1}>
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
              <AnimatedList className="grid grid-cols-1 gap-4 md:grid-cols-2" stagger={0.12}>
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
                  <Label htmlFor="endDate">End Date</Label>
                  <div className="flex items-center gap-3 rounded-lg border border-primary/10 bg-muted/20 p-3">
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      defaultValue={
                        !isPresentPosition
                          ? formatDateForInput(careerEntry.endDate)
                          : ""
                      }
                      disabled={isPresentPosition}
                    />
                    <div className="flex items-center gap-2">
                      <input
                        id="present"
                        name="present"
                        type="checkbox"
                        checked={isPresentPosition}
                        onChange={(event) => setIsPresentPosition(event.target.checked)}
                        className="h-4 w-4 rounded border border-primary/20"
                      />
                      <Label htmlFor="present" className="text-sm">
                        Present
                      </Label>
                    </div>
                  </div>
                </div>
              </AnimatedList>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={careerEntry.description}
                  placeholder="Describe your responsibilities and achievements"
                  rows={5}
                  required
                />
              </div>
            </AnimatedList>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t border-primary/10 bg-muted/30 py-4">
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              Delete Entry
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </AnimatedSection>
  )
}
