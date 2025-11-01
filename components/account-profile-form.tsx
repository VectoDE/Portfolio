"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { FileUpload } from "@/components/file-upload"

interface AccountProfileFormProps {
  user: {
    id: string
    name: string | null
    email: string
    username: string | null
    imageUrl: string | null
  }
}

export function AccountProfileForm({ user }: AccountProfileFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session, update } = useSession()
  const [isSaving, setIsSaving] = useState(false)
  const [name, setName] = useState(user.name ?? "")
  const [email, setEmail] = useState(user.email)
  const [username, setUsername] = useState(user.username ?? "")
  const [imageUrl, setImageUrl] = useState(user.imageUrl ?? "")

  const displaySource = (name || email || "User").trim()
  const initials = displaySource
    .split(/\s+/)
    .filter(Boolean)
    .map((value) => value[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2)
    .padEnd(1, "U")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          username: username.trim() || null,
          imageUrl: imageUrl.trim() || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error ?? "Unable to save profile")
      }

      const updatedUser = await response.json()

      toast({
        title: "Profile updated",
        description: "Your account information is now up to date.",
      })

      if (session?.user && typeof update === "function") {
        void update({
          ...session,
          user: {
            ...session.user,
            name: updatedUser.name,
            email: updatedUser.email,
          },
        })
      }

      router.refresh()
    } catch (error) {
      console.error("Failed to update profile", error)
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={imageUrl || undefined} alt={name || "User avatar"} />
          <AvatarFallback>{initials || "U"}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <CardTitle className="text-2xl font-semibold">Edit your profile</CardTitle>
          <p className="text-sm text-muted-foreground">
            Update the personal details other community members will see.
          </p>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="tim-hauke"
            />
            <p className="text-xs text-muted-foreground">
              Usernames are optional but help others mention you in discussions.
            </p>
          </div>
          <FileUpload
            id="avatar"
            label="Upload avatar image"
            value={imageUrl}
            onChange={(value) => setImageUrl(value)}
          />
          <div className="grid gap-2">
            <Label htmlFor="imageUrl">Or use an external image URL</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="https://cdn.example.com/avatar.png"
            />
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            This information is only visible to you and the site administrator.
          </p>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save profile"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
