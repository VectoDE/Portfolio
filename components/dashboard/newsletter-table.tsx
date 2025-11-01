"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Mail,
  Send,
  Trash2,
  CheckCircle,
  XCircle,
  Filter,
  MoreHorizontal,
  Loader2,
  Settings2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

type Subscriber = {
  id: string
  email: string
  confirmed: boolean
  createdAt: string
  preferences: {
    projects: boolean
    certificates: boolean
    skills: boolean
    careers: boolean
  }
}

export function NewsletterTable() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isPreferencesDialogOpen, setIsPreferencesDialogOpen] = useState(false)
  const [activeSubscriber, setActiveSubscriber] = useState<Subscriber | null>(null)
  const [preferencesForm, setPreferencesForm] = useState({
    projects: true,
    certificates: true,
    skills: true,
    careers: true,
  })
  const [isUpdatingPreferences, setIsUpdatingPreferences] = useState(false)

  // Fetch subscribers
  const fetchSubscribers = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/newsletter/subscribers")
      if (!response.ok) {
        throw new Error("Failed to fetch subscribers")
      }

      const data = await response.json()
      setSubscribers(data.subscribers)
    } catch (error) {
      console.error("Error fetching subscribers:", error)
      toast({
        title: "Error",
        description: "Failed to load subscribers",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Initial fetch
  useEffect(() => {
    fetchSubscribers()
  }, [fetchSubscribers])

  useEffect(() => {
    setSelectedSubscribers((prev) => prev.filter((id) => subscribers.some((sub) => sub.id === id)))
  }, [subscribers])

  function handleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedSubscribers(filteredSubscribers.map((sub) => sub.id))
    } else {
      setSelectedSubscribers([])
    }
  }

  function handleSelectSubscriber(id: string, checked: boolean) {
    if (checked) {
      setSelectedSubscribers((prev) => [...prev, id])
    } else {
      setSelectedSubscribers((prev) => prev.filter((subId) => subId !== id))
    }
  }

  async function handleDeleteSubscribers() {
    if (!confirm(`Are you sure you want to delete ${selectedSubscribers.length} subscriber(s)?`)) {
      return
    }

    try {
      const response = await fetch("/api/newsletter/subscribers", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedSubscribers }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete subscribers")
      }

      toast({
        title: "Subscribers deleted",
        description: `${selectedSubscribers.length} subscriber(s) have been deleted`,
      })

      setSubscribers((prev) => prev.filter((sub) => !selectedSubscribers.includes(sub.id)))
      setSelectedSubscribers([])
    } catch (error) {
      console.error("Error deleting subscribers:", error)
      toast({
        title: "Error",
        description: "Failed to delete subscribers",
        variant: "destructive",
      })
    }
  }

  async function handleDeleteSubscriber(id: string) {
    if (!confirm("Are you sure you want to delete this subscriber?")) {
      return
    }

    try {
      const response = await fetch("/api/newsletter/subscribers", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: [id] }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete subscriber")
      }

      toast({
        title: "Subscriber deleted",
        description: "The subscriber has been removed successfully",
      })

      setSubscribers((prev) => prev.filter((sub) => sub.id !== id))
      setSelectedSubscribers((prev) => prev.filter((subId) => subId !== id))
    } catch (error) {
      console.error("Error deleting subscriber:", error)
      toast({
        title: "Error",
        description: "Failed to delete subscriber",
        variant: "destructive",
      })
    }
  }

  async function handleToggleConfirmation(subscriber: Subscriber) {
    try {
      const response = await fetch("/api/newsletter/subscribers", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: subscriber.id,
          isConfirmed: !subscriber.confirmed,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update confirmation status")
      }

      const data = await response.json()

      setSubscribers((prev) =>
        prev.map((sub) =>
          sub.id === subscriber.id
            ? { ...sub, confirmed: data.subscriber.confirmed ?? !subscriber.confirmed }
            : sub,
        ),
      )

      toast({
        title: subscriber.confirmed ? "Marked as pending" : "Subscriber confirmed",
        description: subscriber.confirmed
          ? `${subscriber.email} is now marked as pending confirmation`
          : `${subscriber.email} has been marked as confirmed`,
      })
    } catch (error) {
      console.error("Error updating confirmation status:", error)
      toast({
        title: "Error",
        description: "Failed to update confirmation status",
        variant: "destructive",
      })
    }
  }

  function openPreferencesDialog(subscriber: Subscriber) {
    setActiveSubscriber(subscriber)
    setPreferencesForm(subscriber.preferences)
    setIsPreferencesDialogOpen(true)
  }

  async function handleSavePreferences() {
    if (!activeSubscriber) {
      return
    }

    setIsUpdatingPreferences(true)
    try {
      const response = await fetch("/api/newsletter/subscribers", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: activeSubscriber.id,
          preferences: preferencesForm,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update preferences")
      }

      const data = await response.json()

      setSubscribers((prev) =>
        prev.map((sub) =>
          sub.id === activeSubscriber.id
            ? { ...sub, preferences: data.subscriber.preferences }
            : sub,
        ),
      )

      toast({
        title: "Preferences updated",
        description: `${activeSubscriber.email}'s preferences have been saved`,
      })

      setIsPreferencesDialogOpen(false)
      setActiveSubscriber(null)
    } catch (error) {
      console.error("Error updating preferences:", error)
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPreferences(false)
    }
  }

  // Filter subscribers by status and search query
  const filteredSubscribers = subscribers.filter((subscriber) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "confirmed" && subscriber.confirmed) ||
      (statusFilter === "pending" && !subscriber.confirmed)

    const matchesSearch = subscriber.email.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesSearch
  })

  const allSelected =
    filteredSubscribers.length > 0 &&
    filteredSubscribers.every((subscriber) =>
      selectedSubscribers.includes(subscriber.id),
    )

  // Add a function to navigate to the send newsletter page
  function handleSendNewsletter() {
    router.push("/dashboard/newsletter/send")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subscribers</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search subscribers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-[300px]"
          />
          <Button onClick={handleSendNewsletter}>
            <Send className="mr-2 h-4 w-4" /> Send Newsletter
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={
                      allSelected
                        ? true
                        : selectedSubscribers.length > 0
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={(checked) => handleSelectAll(checked === true)}
                  />
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Preferences</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Checkbox disabled />
                    </TableCell>
                    <TableCell>Loading...</TableCell>
                    <TableCell>Loading...</TableCell>
                    <TableCell>Loading...</TableCell>
                    <TableCell>Loading...</TableCell>
                    <TableCell>Loading...</TableCell>
                  </TableRow>
                ))
              ) : filteredSubscribers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium">No subscribers found</p>
                      <p className="text-sm text-muted-foreground">
                        {searchQuery
                          ? "Try a different search term"
                          : "When people subscribe to your newsletter, they will appear here."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedSubscribers.includes(subscriber.id)}
                        onCheckedChange={(checked) =>
                          handleSelectSubscriber(subscriber.id, checked === true)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">{subscriber.email}</TableCell>
                    <TableCell>
                      {subscriber.confirmed ? (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          <CheckCircle className="mr-1 h-3 w-3" /> Confirmed
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-amber-50 text-amber-700 border-amber-200"
                        >
                          <XCircle className="mr-1 h-3 w-3" /> Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {subscriber.preferences.projects && (
                          <Badge variant="secondary" className="text-xs">
                            Projects
                          </Badge>
                        )}
                        {subscriber.preferences.certificates && (
                          <Badge variant="secondary" className="text-xs">
                            Certificates
                          </Badge>
                        )}
                        {subscriber.preferences.skills && (
                          <Badge variant="secondary" className="text-xs">
                            Skills
                          </Badge>
                        )}
                        {subscriber.preferences.careers && (
                          <Badge variant="secondary" className="text-xs">
                            Careers
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(subscriber.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleConfirmation(subscriber)}>
                            {subscriber.confirmed ? (
                              <XCircle className="mr-2 h-4 w-4" />
                            ) : (
                              <CheckCircle className="mr-2 h-4 w-4" />
                            )}
                            {subscriber.confirmed ? "Mark as Pending" : "Mark as Confirmed"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openPreferencesDialog(subscriber)}>
                            <Settings2 className="mr-2 h-4 w-4" /> Manage Preferences
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              toast({
                                title: "Email action",
                                description: `Use the dashboard actions to send newsletters to ${subscriber.email}.`,
                              })
                            }
                          >
                            <Send className="mr-2 h-4 w-4" /> Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteSubscriber(subscriber.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedSubscribers.length > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {selectedSubscribers.length} subscriber{selectedSubscribers.length !== 1 ? "s" : ""}{" "}
            selected
          </div>
          <Button variant="destructive" size="sm" onClick={handleDeleteSubscribers}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected
          </Button>
        </div>
      )}

      <Dialog
        open={isPreferencesDialogOpen}
        onOpenChange={(open) => {
          setIsPreferencesDialogOpen(open)
          if (!open) {
            setActiveSubscriber(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage subscriber preferences</DialogTitle>
            <DialogDescription>
              {activeSubscriber
                ? `Control which updates ${activeSubscriber.email} will receive.`
                : "Adjust the content preferences for this subscriber."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <h4 className="text-sm font-medium">Content categories</h4>
              <p className="text-sm text-muted-foreground">
                Toggle the categories that should be included in newsletter updates for this
                subscriber.
              </p>
            </div>
            <Separator />
            <div className="space-y-3">
              {(
                [
                  { key: "projects", label: "Projects" },
                  { key: "certificates", label: "Certificates" },
                  { key: "skills", label: "Skills" },
                  { key: "careers", label: "Careers" },
                ] as const
              ).map(({ key, label }) => (
                <label key={key} className="flex items-start gap-3">
                  <Checkbox
                    checked={preferencesForm[key]}
                    onCheckedChange={(checked) =>
                      setPreferencesForm((prev) => ({
                        ...prev,
                        [key]: checked === true,
                      }))
                    }
                  />
                  <span className="text-sm leading-snug">
                    <span className="font-medium">{label}</span>
                    <span className="block text-muted-foreground">
                      Receive updates about new {label.toLowerCase()}.
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsPreferencesDialogOpen(false)
                setActiveSubscriber(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSavePreferences} disabled={isUpdatingPreferences}>
              {isUpdatingPreferences && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
