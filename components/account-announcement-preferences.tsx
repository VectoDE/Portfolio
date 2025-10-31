"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

interface AnnouncementPreferencesState {
  newProjects: boolean
  newCertificates: boolean
  newSkills: boolean
  newCareers: boolean
}

const DEFAULT_STATE: AnnouncementPreferencesState = {
  newProjects: true,
  newCertificates: true,
  newSkills: true,
  newCareers: true,
}

export function AccountAnnouncementPreferences() {
  const { toast } = useToast()
  const [state, setState] = useState<AnnouncementPreferencesState>(DEFAULT_STATE)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let ignore = false

    async function loadPreferences() {
      try {
        const response = await fetch("/api/newsletter/preferences")
        if (!response.ok) {
          throw new Error("Failed to fetch preferences")
        }
        const data = await response.json()
        if (!ignore) {
          setState((prev) => ({ ...prev, ...data }))
        }
      } catch (error) {
        console.error("Failed to load preferences", error)
        toast({
          title: "Could not load preferences",
          description: "We could not fetch your current announcement settings.",
          variant: "destructive",
        })
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadPreferences()

    return () => {
      ignore = true
    }
  }, [toast])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch("/api/newsletter/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          preferences: {
            projects: state.newProjects,
            certificates: state.newCertificates,
            skills: state.newSkills,
            careers: state.newCareers,
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error ?? "Unable to save preferences")
      }

      toast({
        title: "Preferences saved",
        description: "You'll receive announcements that match your interests.",
      })
    } catch (error) {
      console.error("Failed to update preferences", error)
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Announcement preferences</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose which updates land in your inbox. These settings only apply to your account.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <PreferenceToggle
            id="newProjects"
            label="New projects"
            description="Updates when fresh case studies or features launch."
            checked={state.newProjects}
            onCheckedChange={(checked) => setState((prev) => ({ ...prev, newProjects: checked }))}
            disabled={isLoading}
          />
          <PreferenceToggle
            id="newCertificates"
            label="New certifications"
            description="Emails when new qualifications or recognitions are published."
            checked={state.newCertificates}
            onCheckedChange={(checked) => setState((prev) => ({ ...prev, newCertificates: checked }))}
            disabled={isLoading}
          />
          <PreferenceToggle
            id="newSkills"
            label="Skill highlights"
            description="Occasional insights when new competencies join the stack."
            checked={state.newSkills}
            onCheckedChange={(checked) => setState((prev) => ({ ...prev, newSkills: checked }))}
            disabled={isLoading}
          />
          <PreferenceToggle
            id="newCareers"
            label="Career milestones"
            description="Notifications when major engagements or roles go live."
            checked={state.newCareers}
            onCheckedChange={(checked) => setState((prev) => ({ ...prev, newCareers: checked }))}
            disabled={isLoading}
          />
        </CardContent>
        <CardFooter className="flex items-center justify-end gap-4">
          <Button type="submit" disabled={isSaving || isLoading}>
            {isSaving ? "Saving..." : "Save preferences"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

interface PreferenceToggleProps {
  id: string
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}

function PreferenceToggle({ id, label, description, checked, onCheckedChange, disabled }: PreferenceToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border/60 bg-background/40 p-4">
      <div className="space-y-1">
        <Label htmlFor={id} className="text-base font-medium">
          {label}
        </Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  )
}
