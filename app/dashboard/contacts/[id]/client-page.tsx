"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Archive, ArrowLeft, CheckCircle, Eye, Mail, Trash2, User } from "lucide-react"

import { AnimatedList } from "@/components/animated-list"
import { AnimatedSection } from "@/components/animated-section"
import { DashboardHeader } from "@/components/dashboard-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

interface Contact {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: "unread" | "read" | "replied" | "archived"
  notes?: string | null
  createdAt: string
}

interface ContactDetailsPageClientProps {
  id?: string
}

export default function ContactDetailsPageClient({ id }: ContactDetailsPageClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState("")
  const [savingNotes, setSavingNotes] = useState(false)

  useEffect(() => {
    if (id) {
      return
    }

    console.error("Missing contact id in route params")
    toast({
      title: "Invalid route",
      description: "The contact identifier is missing from the URL.",
      variant: "destructive",
    })
    setLoading(false)
  }, [id, toast])

  const handleStatusChange = useCallback(
    async (newStatus: Contact["status"]) => {
      if (!id) {
        toast({
          title: "Missing contact",
          description: "We couldn't determine which contact to update.",
          variant: "destructive",
        })
        return
      }

      try {
        const response = await fetch(`/api/contacts/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        })

        if (!response.ok) {
          throw new Error("Failed to update contact status")
        }

        const data = await response.json()
        setContact(data.contact)

        toast({
          title: "Status updated",
          description: `Contact marked as ${newStatus}`,
        })
      } catch (error) {
        console.error("Error updating contact status:", error)
        toast({
          title: "Error",
          description: "Failed to update contact status",
          variant: "destructive",
        })
      }
    },
    [id, toast],
  )

  useEffect(() => {
    if (!id) {
      return
    }

    async function fetchContact() {
      setLoading(true)
      try {
        const response = await fetch(`/api/contacts/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch contact")
        }

        const data = await response.json()
        setContact(data.contact)
        setNotes(data.contact.notes || "")

        if (data.contact.status === "unread") {
          await handleStatusChange("read")
        }
      } catch (error) {
        console.error("Error fetching contact:", error)
        toast({
          title: "Error",
          description: "Failed to load contact details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchContact()
  }, [id, toast, handleStatusChange])

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this contact?")) {
      return
    }

    if (!id) {
      toast({
        title: "Missing contact",
        description: "We couldn't determine which contact to delete.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete contact")
      }

      toast({
        title: "Contact deleted",
        description: "The contact has been deleted successfully",
      })

      router.push("/dashboard/contacts")
    } catch (error) {
      console.error("Error deleting contact:", error)
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      })
    }
  }

  async function saveNotes() {
    if (!id) {
      toast({
        title: "Missing contact",
        description: "We couldn't determine which contact to update.",
        variant: "destructive",
      })
      return
    }

    setSavingNotes(true)
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      })

      if (!response.ok) {
        throw new Error("Failed to save notes")
      }

      toast({
        title: "Notes saved",
        description: "Your notes have been saved successfully",
      })
    } catch (error) {
      console.error("Error saving notes:", error)
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive",
      })
    } finally {
      setSavingNotes(false)
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "unread":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
          >
            Unread
          </Badge>
        )
      case "read":
        return (
          <Badge
            variant="secondary"
            className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
          >
            Read
          </Badge>
        )
      case "replied":
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
          >
            Replied
          </Badge>
        )
      case "archived":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
          >
            Archived
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <AnimatedSection className="space-y-6">
      <DashboardHeader heading="Contact Details" text="View and manage contact message">
        <Link href="/dashboard/contacts">
          <Button variant="outline" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Contacts
          </Button>
        </Link>
      </DashboardHeader>

      {loading ? (
        <AnimatedSection className="space-y-4">
          <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
            <CardHeader>
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </AnimatedSection>
      ) : contact ? (
        <AnimatedList className="grid gap-6" initialDelay={0.05}>
          <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{contact.subject || "No Subject"}</CardTitle>
                  <CardDescription>
                    Received on {format(new Date(contact.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                  </CardDescription>
                </div>
                <div>{getStatusBadge(contact.status)}</div>
              </div>
            </CardHeader>
            <CardContent>
              <AnimatedList className="space-y-6" stagger={0.1}>
                <div className="flex flex-col gap-1 rounded-lg border border-primary/10 bg-muted/20 p-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{contact.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                      {contact.email}
                    </a>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 font-medium">Message</h3>
                  <div className="rounded-lg border border-primary/10 bg-background/60 p-4 whitespace-pre-wrap shadow-sm">
                    {contact.message}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-2 font-medium">Notes</h3>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add your notes here..."
                    rows={4}
                    className="resize-none"
                  />
                  <Button onClick={saveNotes} disabled={savingNotes} className="mt-2">
                    {savingNotes ? "Saving..." : "Save Notes"}
                  </Button>
                </div>
              </AnimatedList>
            </CardContent>
            <CardFooter>
              <AnimatedList
                className="flex w-full flex-col gap-4 border-t border-primary/10 pt-6 sm:flex-row sm:items-center sm:justify-between"
                stagger={0.12}
              >
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange("read")}
                    disabled={contact.status === "read"}
                  >
                    <Eye className="mr-2 h-4 w-4" /> Mark as Read
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange("replied")}
                    disabled={contact.status === "replied"}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" /> Mark as Replied
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange("archived")}
                    disabled={contact.status === "archived"}
                  >
                    <Archive className="mr-2 h-4 w-4" /> Archive
                  </Button>
                </div>
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </AnimatedList>
            </CardFooter>
          </Card>

          <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle>Reply to Contact</CardTitle>
              <CardDescription>Send an email response to this contact</CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatedList className="space-y-4" stagger={0.1}>
                <AnimatedList className="grid grid-cols-1 gap-4 md:grid-cols-2" stagger={0.1} initialDelay={0.05}>
                  <div>
                    <label className="text-sm font-medium">To</label>
                    <div className="mt-1 rounded-md border border-primary/10 bg-background/60 p-2">
                      {contact.email}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Subject</label>
                    <div className="mt-1 rounded-md border border-primary/10 bg-background/60 p-2">
                      Re: {contact.subject || "No Subject"}
                    </div>
                  </div>
                </AnimatedList>
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    placeholder="Type your reply here..."
                    rows={6}
                    className="mt-1 resize-none"
                    defaultValue={`Dear ${contact.name},\n\nThank you for your message. \n\n\n\nBest regards,\nYour Name`}
                  />
                </div>
              </AnimatedList>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => {
                  toast({
                    title: "Email functionality not implemented",
                    description: "This is a demo. Email sending is not implemented.",
                  })
                  handleStatusChange("replied")
                }}
              >
                Send Reply
              </Button>
            </CardFooter>
          </Card>
        </AnimatedList>
      ) : (
        <AnimatedSection>
          <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-2">
              <h3 className="text-lg font-medium">Contact not found</h3>
              <p className="text-muted-foreground">
                The contact you're looking for doesn't exist or has been deleted.
              </p>
              <Button asChild className="mt-2">
                <Link href="/dashboard/contacts">Back to Contacts</Link>
              </Button>
            </CardContent>
          </Card>
        </AnimatedSection>
      )}
    </AnimatedSection>
  )
}
