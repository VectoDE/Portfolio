"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, icons } from "lucide-react"
import * as LucideIcons from "lucide-react"

import { AnimatedList } from "@/components/animated-list"
import { AnimatedSection } from "@/components/animated-section"
import { DashboardHeader } from "@/components/dashboard-header"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import type { Skill } from "@/types/database"

const iconNames = Object.keys(icons)
  .filter((key) => key !== "default")
  .sort((a, b) => a.localeCompare(b))

interface EditSkillPageClientProps {
  id?: string
}

export default function EditSkillPageClient({ id }: EditSkillPageClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [skill, setSkill] = useState<Skill | null>(null)
  const [selectedIcon, setSelectedIcon] = useState<string>("Code")

  const IconComponent = selectedIcon
    ? (LucideIcons[selectedIcon as keyof typeof LucideIcons] as React.FC<{ className?: string }>)
    : null

  useEffect(() => {
    if (id) {
      return
    }

    console.error("Missing skill id in route params")
    toast({
      title: "Invalid route",
      description: "The skill identifier is missing from the URL.",
      variant: "destructive",
    })
    setIsLoading(false)
  }, [id, toast])

  useEffect(() => {
    if (!id) {
      return
    }

    async function fetchSkill() {
      try {
        const response = await fetch(`/api/skills/${id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch skill")
        }

        const data: { skill: Skill } = await response.json()
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
  }, [id, toast])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    if (!id) {
      toast({
        title: "Missing skill",
        description: "We couldn't determine which skill should be updated.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    const formData = new FormData(event.currentTarget)
    const name = formData.get("name") as string
    const category = formData.get("category") as string
    const level = formData.get("level") as string
    const years = Number(formData.get("years"))
    const iconName = selectedIcon

    try {
      const response = await fetch(`/api/skills/${id}`, {
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

    if (!id) {
      toast({
        title: "Missing skill",
        description: "We couldn't determine which skill should be deleted.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/skills/${id}`, {
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
      <AnimatedSection className="space-y-6">
        <DashboardHeader heading="Edit Skill" text="Loading skill details..." />
        <div className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AnimatedSection>
    )
  }

  if (!skill) {
    return (
      <AnimatedSection className="space-y-6">
        <DashboardHeader heading="Edit Skill" text="Skill not found" />
        <div className="flex flex-col items-center justify-center h-32 gap-4">
          <p className="text-muted-foreground">The requested skill could not be found.</p>
          <Link href="/dashboard/skills">
            <Button>Back to Skills</Button>
          </Link>
        </div>
      </AnimatedSection>
    )
  }

  return (
    <AnimatedSection className="space-y-6">
      <DashboardHeader heading="Edit Skill" text="Update your skill details">
        <Link href="/dashboard/skills">
          <Button variant="outline" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Skills
          </Button>
        </Link>
      </DashboardHeader>
      <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Skill Details</CardTitle>
            <CardDescription>Update the details of your skill.</CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatedList className="space-y-4" initialDelay={0.1}>
              <div className="space-y-2">
                <Label htmlFor="name">Skill Name</Label>
                <Input id="name" name="name" defaultValue={skill.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" defaultValue={skill.category || ""} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Skill Level</Label>
                <Select name="level" defaultValue={skill.level}>
                  <SelectTrigger id="level">
                    <SelectValue placeholder="Select skill level" />
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
                <Input id="years" name="years" type="number" min={0} defaultValue={skill.years || 0} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Select value={selectedIcon} onValueChange={setSelectedIcon}>
                  <SelectTrigger id="icon">
                    <SelectValue placeholder="Select an icon">
                      {selectedIcon}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {iconNames.map((iconName) => (
                      <SelectItem key={iconName} value={iconName}>
                        {iconName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {IconComponent && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconComponent className="h-5 w-5" />
                    <span>Preview</span>
                  </div>
                )}
              </div>
            </AnimatedList>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t border-primary/10 bg-muted/30 py-4">
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              Delete Skill
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
