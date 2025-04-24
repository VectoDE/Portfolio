"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Eye, EyeOff, KeyRound, Mail, Upload, User, Bell, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { DashboardHeader } from "@/components/dashboard-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function SettingsPage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(session?.user?.image || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [settings, setSettings] = useState({
    adminEmail: "",
    emailFrom: "",
    smtpServer: "",
    smtpPort: "",
    smtpUser: "",
    smtpPassword: "",
    sendAutoReply: false,
  })

  useEffect(() => {
    // Fetch email settings from the API
    async function fetchEmailSettings() {
      try {
        const response = await fetch("/api/settings/email")
        if (!response.ok) {
          throw new Error("Failed to fetch email settings")
        }

        const data = await response.json()
        setSettings({
          ...settings,
          adminEmail: data.adminEmail || "",
          emailFrom: data.emailFrom || "",
          smtpServer: data.smtpServer || "",
          smtpPort: data.smtpPort || "",
          smtpUser: data.smtpUser || "",
          smtpPassword: "", // Password is not returned for security
          sendAutoReply: data.sendAutoReply || false,
        })
      } catch (error) {
        console.error("Error fetching email settings:", error)
        toast({
          title: "Error",
          description: "Failed to load email settings",
          variant: "destructive",
        })
      }
    }

    fetchEmailSettings()
  }, [toast])

  async function handleProfileUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const imageUrl = session?.user?.image || null

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          imageUrl,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update profile")
      }

      // Update session
      if (session) {
        await update({
          ...session,
          user: {
            ...session.user,
            name,
            email,
            image: imageUrl,
          },
        })
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })

      router.refresh()
    } catch (error) {
      console.error("Profile update error:", error)
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handlePasswordUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirm password must match.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update password")
      }

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      })

      // Reset form
      event.currentTarget.reset()
    } catch (error) {
      console.error("Password update error:", error)
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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
        throw new Error(error.error || "Failed to upload image")
      }

      const data = await response.json()

      // Update session with new image URL
      if (session) {
        await update({
          ...session,
          user: {
            ...session.user,
            image: data.imageUrl,
          },
        })
      }

      toast({
        title: "Image uploaded",
        description: "Your profile image has been updated successfully.",
      })
    } catch (error) {
      console.error("Image upload error:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
      // Reset preview on error
      setImagePreview(session?.user?.image || null)
    } finally {
      setUploadingImage(false)
    }
  }

  function triggerFileInput() {
    fileInputRef.current?.click()
  }

  const userInitials = session?.user?.name
    ? session.user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
    : "U"

  async function handleEmailSettingsSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/settings/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save email settings")
      }

      toast({
        title: "Settings saved",
        description: "Your email notification settings have been saved.",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  async function handleSendTestEmail() {
    try {
      const response = await fetch("/api/settings/email/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: settings.adminEmail }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to send test email")
      }

      toast({
        title: "Test email sent",
        description: "A test notification has been sent to your email address.",
      })
    } catch (error) {
      console.error("Error sending test email:", error)
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      })
    }
  }

  return (
    <div>
      <DashboardHeader heading="Settings" text="Manage your account settings" />
      <div className="grid gap-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="profile" className="flex-1 md:flex-none">
              Profile
            </TabsTrigger>
            <TabsTrigger value="password" className="flex-1 md:flex-none">
              Password
            </TabsTrigger>
            <TabsTrigger value="email-notifications" className="flex-1 md:flex-none">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="email-smtp" className="flex-1 md:flex-none">
              SMTP Settings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your account profile information and email address.</CardDescription>
              </CardHeader>
              <form onSubmit={handleProfileUpdate}>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={imagePreview || undefined} alt={session?.user?.name || "User"} />
                        <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
                      </Avatar>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                        onClick={triggerFileInput}
                        disabled={uploadingImage}
                      >
                        <Upload className="h-4 w-4" />
                        <span className="sr-only">Upload profile picture</span>
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                    </div>
                    {uploadingImage && <p className="text-sm text-muted-foreground">Uploading image...</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        className="pl-10"
                        defaultValue={session?.user?.name || ""}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        className="pl-10"
                        defaultValue={session?.user?.email || ""}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading || uploadingImage}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          <TabsContent value="password" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure.</CardDescription>
              </CardHeader>
              <form onSubmit={handlePasswordUpdate}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showPassword ? "text" : "password"}
                        className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-10 w-10"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Eye className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-10 w-10"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Eye className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className="sr-only">{showNewPassword ? "Hide password" : "Show password"}</span>
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showNewPassword ? "text" : "password"}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Password"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          <TabsContent value="email-notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Configure how you receive notifications for new contacts.</CardDescription>
              </CardHeader>
              <form onSubmit={handleEmailSettingsSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Notification Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="adminEmail"
                        name="adminEmail"
                        type="email"
                        placeholder="admin@example.com"
                        className="pl-10"
                        value={settings.adminEmail}
                        onChange={handleChange}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      New contact notifications will be sent to this email address.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailFrom">From Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="emailFrom"
                        name="emailFrom"
                        placeholder="noreply@yourdomain.com"
                        className="pl-10"
                        value={settings.emailFrom}
                        onChange={handleChange}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This will be used as the sender email address for notifications.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sendAutoReply"
                      name="sendAutoReply"
                      checked={settings.sendAutoReply}
                      onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, sendAutoReply: checked }))}
                    />
                    <Label htmlFor="sendAutoReply">Send auto-reply to contacts</Label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Save Settings
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Notification</CardTitle>
                <CardDescription>Send a test email to verify your notification settings.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={handleSendTestEmail}>
                  <Bell className="mr-2 h-4 w-4" /> Send Test Email
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email-smtp" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>SMTP Settings</CardTitle>
                <CardDescription>Configure your SMTP server for sending emails.</CardDescription>
              </CardHeader>
              <form onSubmit={handleEmailSettingsSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpServer">SMTP Server</Label>
                    <Input
                      id="smtpServer"
                      name="smtpServer"
                      placeholder="smtp.example.com"
                      value={settings.smtpServer}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      name="smtpPort"
                      placeholder="587"
                      value={settings.smtpPort}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtpUser">SMTP Username</Label>
                    <Input
                      id="smtpUser"
                      name="smtpUser"
                      placeholder="user@example.com"
                      value={settings.smtpUser}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <Input
                      id="smtpPassword"
                      name="smtpPassword"
                      type="password"
                      placeholder="••••••••"
                      value={settings.smtpPassword}
                      onChange={handleChange}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Save SMTP Settings
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
