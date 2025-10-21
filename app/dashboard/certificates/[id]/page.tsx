"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { DashboardHeader } from "@/components/dashboard-header"
import { FileUpload } from "@/components/file-upload"
import type { Certificate } from "@/types/database"

interface EditCertificatePageProps {
  params: {
    id?: string
  }
}

export default function EditCertificatePage({ params }: EditCertificatePageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [imageUrl, setImageUrl] = useState("")
  const [certificateId, setCertificateId] = useState<string | null>(null)

  useEffect(() => {
    if (!params?.id) {
      console.error("Missing certificate id in route params")
      toast({
        title: "Invalid route",
        description: "The certificate identifier is missing from the URL.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    setCertificateId(params.id)
  }, [params, toast])

  useEffect(() => {
    if (!certificateId) {
      return
    }

    async function fetchCertificate() {
      try {
        const response = await fetch(`/api/certificates/${certificateId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch certificate")
        }

        const data: { certificate: Certificate } = await response.json()
        setCertificate(data.certificate)
        setImageUrl(data.certificate.imageUrl || "")
      } catch (error) {
        console.error("Error fetching certificate:", error)
        toast({
          title: "Error",
          description: "Failed to load certificate details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCertificate()
  }, [certificateId, toast])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    if (!certificateId) {
      toast({
        title: "Missing certificate",
        description: "We couldn't determine which certificate should be updated.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    const formData = new FormData(event.currentTarget)
    const name = formData.get("name") as string
    const issuer = formData.get("issuer") as string
    const date = formData.get("date") as string
    const link = formData.get("link") as string

    try {
      const response = await fetch(`/api/certificates/${certificateId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          issuer,
          date,
          link,
          imageUrl,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update certificate")
      }

      toast({
        title: "Certificate updated",
        description: "Your certificate has been updated successfully.",
      })

      router.push("/dashboard/certificates")
      router.refresh()
    } catch (error) {
      console.error("Certificate update error:", error)
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
    if (!confirm("Are you sure you want to delete this certificate?")) {
      return
    }

    if (!certificateId) {
      toast({
        title: "Missing certificate",
        description: "We couldn't determine which certificate should be deleted.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/certificates/${certificateId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete certificate")
      }

      toast({
        title: "Certificate deleted",
        description: "Your certificate has been deleted successfully.",
      })

      router.push("/dashboard/certificates")
      router.refresh()
    } catch (error) {
      console.error("Certificate deletion error:", error)
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
        <DashboardHeader heading="Edit Certificate" text="Loading certificate details..." />
        <div className="flex items-center justify-center h-32">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!certificate) {
    return (
      <div>
        <DashboardHeader heading="Edit Certificate" text="Certificate not found" />
        <div className="flex flex-col items-center justify-center h-32 gap-4">
          <p>The requested certificate could not be found.</p>
          <Link href="/dashboard/certificates">
            <Button>Back to Certificates</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Format date string for input field (yyyy-MM-dd)
  const formatDateForInput = (dateValue: string | Date) => {
    const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue
    return date.toISOString().split("T")[0]
  }

  return (
    <div>
      <DashboardHeader heading="Edit Certificate" text="Update your certificate details">
        <Link href="/dashboard/certificates">
          <Button variant="outline" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Certificates
          </Button>
        </Link>
      </DashboardHeader>
      <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle>Certificate Details</CardTitle>
          <CardDescription>Update the details of your certificate.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Certificate Name</Label>
              <Input id="name" name="name" defaultValue={certificate.name} placeholder="Certificate name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issuer">Issuer</Label>
              <Input
                id="issuer"
                name="issuer"
                defaultValue={certificate.issuer}
                placeholder="Certificate issuer"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" defaultValue={formatDateForInput(certificate.date)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link">Certificate Link</Label>
              <Input
                id="link"
                name="link"
                defaultValue={certificate.link || ""}
                placeholder="https://example.com/certificate"
              />
            </div>
            <FileUpload
              id="certificate-image"
              label="Certificate Image"
              value={imageUrl}
              onChange={setImageUrl}
              accept="image/*"
              maxSize={2}
            />
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete Certificate
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

