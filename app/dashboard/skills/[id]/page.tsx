"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, icons } from "lucide-react"
import * as LucideIcons from "lucide-react"

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
import { DashboardHeader } from "@/components/dashboard-header"
import type { Skill } from "@/types/database"
import { AnimatedSection } from "@/components/animated-section"
import { AnimatedList } from "@/components/animated-list"

// Get all available Lucide icons
const iconNames = Object.keys(icons)
  .filter((key) => key !== "default")
  .sort((a, b) => a.localeCompare(b))

interface EditSkillPageProps {
  params: {
    id?: string
  }
}

export default function EditSkillPage({ params }: EditSkillPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [skill, setSkill] = useState<Skill | null>(null)
  const [selectedIcon, setSelectedIcon] = useState<string>("Code")
  const [skillId, setSkillId] = useState<string | null>(null)

  // For icon preview
  const IconComponent = selectedIcon
    ? (LucideIcons[selectedIcon as keyof typeof LucideIcons] as React.FC<{ className?: string }>)
    : null

  useEffect(() => {
    if (!params?.id) {
      console.error("Missing skill id in route params")
      toast({
        title: "Invalid route",
        description: "The skill identifier is missing from the URL.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    setSkillId(params.id)
  }, [params, toast])

  useEffect(() => {
    if (!skillId) {
      return
    }

    async function fetchSkill() {
      try {
        const response = await fetch(`/api/skills/${skillId}`)

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
  }, [skillId, toast])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    if (!skillId) {
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
      const response = await fetch(`/api/skills/${skillId}`, {
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

    if (!skillId) {
      toast({
        title: "Missing skill",
        description: "We couldn't determine which skill should be deleted.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/skills/${skillId}`, {
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
        <CardHeader>
          <CardTitle>Skill Details</CardTitle>
          <CardDescription>Update the details of your skill.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <AnimatedList className="space-y-4" initialDelay={0.1}>
              <div className="space-y-2">
                <Label htmlFor="name">Skill Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={skill.name}
                  placeholder="Skill name"
                  required
                />
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
              <AnimatedList className="grid grid-cols-1 gap-4 md:grid-cols-2" stagger={0.12}>
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
                  <Input
                    id="years"
                    name="years"
                    type="number"
                    min="0"
                    step="0.5"
                    defaultValue={skill.years}
                    required
                  />
                </div>
              </AnimatedList>
              <div className="space-y-2">
                <Label htmlFor="iconName">Icon</Label>
                <AnimatedList className="flex flex-col gap-4 md:flex-row" stagger={0.12} initialDelay={0.05}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-md border border-primary/10 bg-muted/40">
                    {IconComponent ? (
                      <IconComponent className="h-6 w-6 text-primary" />
                    ) : (
                      <span className="text-xs text-muted-foreground">Preview</span>
                    )}
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
                </AnimatedList>
              </div>
            </AnimatedList>
          </CardContent>
          <CardFooter>
            <AnimatedList className="flex w-full flex-col gap-4 sm:flex-row sm:justify-between" stagger={0.12}>
              <Button type="button" variant="destructive" onClick={handleDelete}>
                Delete Skill
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </AnimatedList>
          </CardFooter>
        </form>
      </Card>
    </AnimatedSection>
  )
}
