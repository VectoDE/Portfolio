"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import * as LucideIcons from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"

// Get all available Lucide icons
const iconNames = Object.keys(LucideIcons).filter(
  (key) => typeof LucideIcons[key as keyof typeof LucideIcons] === "function" && key !== "default",
)

interface EditSkillPageProps {
  params: {
    id: string
  }
}

export default function EditSkillPage({ params }: EditSkillPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [skill, setSkill] = useState<any>(null)
  const [selectedIcon, setSelectedIcon] = useState<string>("Code")

  // For icon preview
  const IconComponent = selectedIcon
    ? (LucideIcons[selectedIcon as keyof typeof LucideIcons] as React.FC<{ className?: string }>)
    : null

  useEffect(() => {
    async function fetchSkill() {
      try {
        const response = await fetch(`/api/skills/${params.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch skill")
        }

        const data = await response.json()
        setSkill(data.skill)
        if (data.skill.iconName) {
          setSelectedIcon(data.skill.iconName)
        }
      } catch (error) {
        console.error("Error fetching skill:", error)
        toast({
          title: "Error",
          description: "Failed to load skill details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSkill()
  }, [params.id, toast])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const name = formData.get("name") as string
    const category = formData.get("category") as string
    const level = formData.get("level") as string
    const years = formData.get("years") as string
    const iconName = selectedIcon

    try {
      const response = await fetch(`/api/skills/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          category,
          level,
          years,
          iconName,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update skill")
      }

      toast({
        title: "Skill updated",
        description: "Your skill has been updated successfully.",
      })

      router.push("/dashboard/skills")
      router.refresh()
    } catch (error) {
      console.error("Skill update error:", error)
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
    if (!confirm("Are you sure you want to delete this skill?")) {
      return
    }

    try {
      const response = await fetch(`/api/skills/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete skill")
      }

      toast({
        title: "Skill deleted",
        description: "Your skill has been deleted successfully.",
      })

      router.push("/dashboard/skills")
      router.refresh()
    } catch (error) {
      console.error("Skill deletion error:", error)
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
        <DashboardHeader heading="Edit Skill" text="Loading skill details..." />
        <div className="flex items-center justify-center h-32">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!skill) {
    return (
      <div>
        <DashboardHeader heading="Edit Skill" text="Skill not found" />
        <div className="flex flex-col items-center justify-center h-32 gap-4">
          <p>The requested skill could not be found.</p>
          <Link href="/dashboard/skills">
            <Button>Back to Skills</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <DashboardHeader heading="Edit Skill" text="Update your skill details">
        <Link href="/dashboard/skills">
          <Button variant="outline" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Skills
          </Button>
        </Link>
      </DashboardHeader>
      <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle>Skill Details</CardTitle>
          <CardDescription>Update the details of your skill.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Skill Name</Label>
              <Input id="name" name="name" defaultValue={skill.name} placeholder="Skill name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={skill.category}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Frontend">Frontend</SelectItem>
                  <SelectItem value="Backend">Backend</SelectItem>
                  <SelectItem value="Database">Database</SelectItem>
                  <SelectItem value="DevOps">DevOps</SelectItem>
                  <SelectItem value="Language">Language</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Select name="level" defaultValue={skill.level}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="years">Years of Experience</Label>
              <Input id="years" name="years" type="number" min="0" step="0.5" defaultValue={skill.years} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="iconName">Icon</Label>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                  {IconComponent && <IconComponent className="h-6 w-6" />}
                </div>
                <Select value={selectedIcon} onValueChange={setSelectedIcon}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {iconNames.map((iconName) => (
                      <SelectItem key={iconName} value={iconName}>
                        {iconName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete Skill
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

