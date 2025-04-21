"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Search, Upload, X } from "lucide-react"
import Image from "next/image"
import * as LucideIcons from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { DashboardHeader } from "@/components/dashboard-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IconRenderer } from "@/components/icon-renderer"

// Get icon names but filter out non-component exports
const iconNames = Object.keys(LucideIcons).filter(
  (key) =>
    typeof LucideIcons[key as keyof typeof LucideIcons] === "function" &&
    key !== "default" &&
    key !== "icons" &&
    key !== "createLucideIcon",
)

export default function NewSkillPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedIcon, setSelectedIcon] = useState<string>("Code")
  const [iconSearch, setIconSearch] = useState("")
  const [customIconUrl, setCustomIconUrl] = useState("")
  const [uploadingIcon, setUploadingIcon] = useState(false)
  const [iconPreview, setIconPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<string>("lucide")
  const [filteredIcons, setFilteredIcons] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setFilteredIcons(iconNames.slice(0, 100))
  }, [])

  useEffect(() => {
    if (iconSearch) {
      setFilteredIcons(iconNames.filter((name) => name.toLowerCase().includes(iconSearch.toLowerCase())))
    } else {
      setFilteredIcons(iconNames.slice(0, 100))
    }
  }, [iconSearch])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const name = formData.get("name") as string
    const category = formData.get("category") as string
    const level = formData.get("level") as string
    const years = formData.get("years") as string

    const iconData =
      activeTab === "lucide"
        ? { iconType: "lucide", iconName: selectedIcon }
        : { iconType: "custom", iconUrl: customIconUrl }

    try {
      const response = await fetch("/api/skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          category,
          level,
          years,
          ...iconData,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create skill")
      }

      toast({
        title: "Skill created",
        description: "Your skill has been added successfully.",
      })

      router.push("/dashboard/skills")
      router.refresh()
    } catch (error) {
      console.error("Skill creation error:", error)
      toast({
        title: "Creation failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleIconUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setIconPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    setUploadingIcon(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to upload icon")
      }

      const data = await response.json()
      setCustomIconUrl(data.imageUrl)

      toast({
        title: "Icon uploaded",
        description: "Custom icon has been uploaded successfully.",
      })
    } catch (error) {
      console.error("Icon upload error:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
      // Reset preview on error
      setIconPreview(null)
    } finally {
      setUploadingIcon(false)
    }
  }

  function triggerFileInput() {
    fileInputRef.current?.click()
  }

  function removeIcon() {
    setCustomIconUrl("")
    setIconPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div>
      <DashboardHeader heading="Add New Skill" text="Add a new skill to your portfolio">
        <Link href="/dashboard/skills">
          <Button variant="outline" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Skills
          </Button>
        </Link>
      </DashboardHeader>
      <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle>Skill Details</CardTitle>
          <CardDescription>Fill in the details of your new skill.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Skill Name</Label>
              <Input id="name" name="name" placeholder="Skill name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue="Frontend">
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
              <Select name="level" defaultValue="Intermediate">
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
              <Input id="years" name="years" type="number" min="0" step="0.5" defaultValue="1" required />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="lucide">Lucide Icons</TabsTrigger>
                  <TabsTrigger value="custom">Custom Icon</TabsTrigger>
                </TabsList>
                <TabsContent value="lucide" className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-muted">
                      {mounted && <IconRenderer iconName={selectedIcon} className="h-8 w-8" />}
                    </div>
                    <div className="flex-1">
                      <div className="relative mb-2">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search icons..."
                          value={iconSearch}
                          onChange={(e) => setIconSearch(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                      <Select value={selectedIcon} onValueChange={setSelectedIcon}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select icon" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {filteredIcons.length > 0 ? (
                            filteredIcons.map((iconName) => (
                              <SelectItem key={iconName} value={iconName}>
                                {iconName}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-center text-sm text-muted-foreground">No icons found</div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {mounted && (
                    <div className="grid grid-cols-6 gap-2 md:grid-cols-8 lg:grid-cols-10">
                      {filteredIcons.slice(0, 20).map((iconName) => (
                        <Button
                          key={iconName}
                          type="button"
                          variant={selectedIcon === iconName ? "default" : "outline"}
                          className="h-12 w-12 p-0"
                          onClick={() => setSelectedIcon(iconName)}
                          title={iconName}
                        >
                          <IconRenderer iconName={iconName} className="h-6 w-6" />
                        </Button>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="custom" className="space-y-4">
                  <div className="mt-2 flex flex-col gap-4">
                    {iconPreview && (
                      <div className="relative overflow-hidden rounded-md border">
                        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-md border bg-muted p-2">
                          <Image
                            src={iconPreview || "/placeholder.svg"}
                            alt="Icon preview"
                            width={64}
                            height={64}
                            className="object-contain"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute right-1 top-1 h-5 w-5 rounded-full"
                          onClick={removeIcon}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove icon</span>
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={triggerFileInput}
                        disabled={uploadingIcon}
                        className={iconPreview ? "w-auto" : "h-24 w-24 border-dashed"}
                      >
                        <Upload className={iconPreview ? "mr-2 h-4 w-4" : "h-6 w-6"} />
                        {iconPreview ? "Change" : "Upload"}
                      </Button>
                      <input
                        ref={fileInputRef}
                        id="skill-icon"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleIconUpload}
                        disabled={uploadingIcon}
                      />
                      {uploadingIcon && <p className="text-sm text-muted-foreground">Uploading icon...</p>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Upload a custom icon (PNG, SVG recommended). Square images work best.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={isSubmitting || uploadingIcon || (activeTab === "custom" && !customIconUrl)}
              className="w-full md:w-auto"
            >
              {isSubmitting ? "Creating..." : "Create Skill"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
