"use client"

import type React from "react"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  Clock,
  ExternalLink,
  HeartHandshake,
  Lightbulb,
  MapPin,
  MessageSquare,
  NotebookPen,
  Mail,
  Tag,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { AnimatedSection } from "@/components/animated-section"
import { AnimatedList } from "@/components/animated-list"
import profile from "@/content/profile.json"

// Linear-time replacement for /^[^\s@]+@[^\s@]+\.[^\s@]+$/ (same acceptance, no backtracking).
function isValidEmail(value: string): boolean {
  if (/\s/.test(value)) return false
  const parts = value.split("@")
  if (parts.length !== 2) return false
  const [local, domain] = parts
  if (local.length === 0) return false
  const dot = domain.indexOf(".", 1)
  return dot !== -1 && dot < domain.length - 1
}

export default function ContactPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [privacyAccepted, setPrivacyAccepted] = useState(false)

  const isFormValid = useMemo(() => {
    const trimmedName = formData.name.trim()
    const trimmedEmail = formData.email.trim()
    const trimmedMessage = formData.message.trim()

    return (
      trimmedName.length >= 2 &&
      isValidEmail(trimmedEmail) &&
      trimmedMessage.length >= 10 &&
      privacyAccepted
    )
  }, [formData, privacyAccepted])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    const trimmedData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
    }

    const errors: string[] = []

    if (trimmedData.name.length < 2) {
      errors.push("Please enter your full name (at least 2 characters).")
    }

    if (!isValidEmail(trimmedData.email)) {
      errors.push("Please provide a valid email address.")
    }

    if (trimmedData.message.length < 10) {
      errors.push("Messages must be at least 10 characters so I can understand your request.")
    }

    if (!privacyAccepted) {
      errors.push("Please confirm that you accept the privacy notice.")
    }

    if (errors.length > 0) {
      toast({
        title: "Update required",
        description: errors.join(" "),
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedData.name,
          email: trimmedData.email,
          subject: trimmedData.subject || undefined,
          message: trimmedData.message,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        const description =
          Array.isArray(error?.details?.formErrors) && error.details.formErrors.length > 0
            ? error.details.formErrors.join(" ")
            : error?.error || "Failed to send message"
        throw new Error(description)
      }

      toast({
        title: "Message sent",
        description: "Thank you for your message. I'll get back to you soon!",
      })

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
      setPrivacyAccepted(false)
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to send message. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative z-10">
        <MainNav />

        <main id="main" className="flex-1">
          <AnimatedSection className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display">
                    Get in Touch
                  </h1>
                  <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl">
                    Have a question or want to work together? Feel free to reach out!
                  </p>
                </div>
              </div>

              <AnimatedList className="grid gap-10 md:grid-cols-2 lg:gap-16" stagger={0.18}>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-3xl sm:text-4xl">Other ways to reach me</h2>
                    <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                      Write in German or English.
                    </p>
                  </div>
                  <AnimatedList className="grid gap-6" initialDelay={0.1}>
                    <Card className="">
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Email</CardTitle>
                          <CardDescription>
                            <a
                              href="mailto:contact@uplytech.de"
                              className="text-primary underline-offset-4 hover:underline"
                            >
                              contact@uplytech.de
                            </a>
                          </CardDescription>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="">
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Location</CardTitle>
                          <CardDescription>Itzehoe, Germany</CardDescription>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="">
                      <CardContent className="p-6 flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <ExternalLink className="h-6 w-6 text-primary" aria-hidden="true" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Profiles</CardTitle>
                          <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                            {profile.links.map((link) => (
                              <li key={link.url}>
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer me"
                                  className="text-primary underline-offset-4 hover:underline"
                                >
                                  {link.label}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedList>
                  <Card className="">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <Clock className="h-6 w-6 text-primary" />
                        <h3 className="text-xl font-semibold">What happens after you reach out</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Every enquiry lands directly in my inbox. I review project details
                        personally before we jump on a call so the conversation focuses on
                        solutions, not introductions.
                      </p>
                      <AnimatedList
                        className="space-y-2 text-sm text-muted-foreground"
                        stagger={0.12}
                      >
                        <div className="flex items-start gap-2">
                          <Lightbulb className="mt-0.5 h-4 w-4 text-primary" />
                          <span>
                            Share your mission, current challenges, and desired launch
                            window—context helps me prepare.
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <NotebookPen className="mt-0.5 h-4 w-4 text-primary" />
                          <span>
                            You'll receive a summary of our discussion with next steps, timelines,
                            and responsibilities.
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <HeartHandshake className="mt-0.5 h-4 w-4 text-primary" />
                          <span>
                            We collaborate transparently—no hidden costs, and you keep full access
                            to code and documentation.
                          </span>
                        </div>
                      </AnimatedList>
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <Card className="">
                    <CardHeader>
                      <CardTitle className="text-2xl">Send a Message</CardTitle>
                      <CardDescription>
                        Fill out the form below and I'll get back to you as soon as possible.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="flex items-center gap-2">
                            <User className="h-5 w-5 text-muted-foreground" />
                            Name
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="Your name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="flex items-center gap-2">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            Email
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Your email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subject" className="flex items-center gap-2">
                            <Tag className="h-5 w-5 text-muted-foreground" />
                            Subject
                          </Label>
                          <Input
                            id="subject"
                            name="subject"
                            placeholder="Subject of your message"
                            value={formData.subject}
                            onChange={handleChange}
                            aria-describedby="subject-helper"
                          />
                          <p id="subject-helper" className="text-xs text-muted-foreground">
                            Optional – leave blank if you would like me to suggest a topic.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="message" className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-muted-foreground" />
                            Message
                          </Label>
                          <Textarea
                            id="message"
                            name="message"
                            placeholder="Your message"
                            rows={5}
                            required
                            value={formData.message}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="flex items-start gap-3 rounded-md border border-muted/60 bg-background/80 p-3">
                          <Checkbox
                            id="privacy"
                            checked={privacyAccepted}
                            onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
                          />
                          <Label htmlFor="privacy" className="text-sm text-muted-foreground">
                            I agree that my details may be used to process and respond to my enquiry
                            in accordance with the information provided in the{" "}
                            <Link
                              href="/privacy"
                              className="font-medium text-primary underline-offset-4 hover:underline"
                            >
                              Privacy Policy
                            </Link>
                            .
                          </Label>
                        </div>
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isSubmitting || !isFormValid}
                          aria-disabled={isSubmitting || !isFormValid}
                        >
                          {isSubmitting ? "Sending..." : "Send Message"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </AnimatedList>
            </div>
          </AnimatedSection>

          <AnimatedSection className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
            <div className="container px-4 md:px-6">
              <AnimatedList
                className="grid gap-12 md:grid-cols-[1.2fr_1fr] md:items-center"
                stagger={0.18}
              >
                <div className="space-y-6">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-display">
                    Let's tell your story together
                  </h2>
                  <p className="text-muted-foreground md:text-xl/relaxed">
                    I'm passionate about spotlighting the people behind every initiative. Whether
                    you represent a sports club, an association, or an early-stage startup, we'll
                    co-create digital touchpoints that reflect your culture and aspirations.
                  </p>
                  <p className="text-muted-foreground md:text-lg/relaxed">
                    If you're unsure where to start, share your current stack or favourite toolset—I
                    can audit your setup and suggest small but high-impact changes before we plan a
                    full project.
                  </p>
                </div>
                <Card className="">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold">Helpful resources</h3>
                    <p className="text-sm text-muted-foreground">
                      These links offer a deeper look at how I work and what to expect.
                    </p>
                    <AnimatedList className="grid gap-3" stagger={0.1}>
                      <Link
                        href="/projects"
                        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                      >
                        Explore detailed project breakdowns
                      </Link>
                      <Link
                        href="/about"
                        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                      >
                        Learn more about my background
                      </Link>
                      <Link
                        href="/#faq"
                        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                      >
                        Read common questions and support options
                      </Link>
                    </AnimatedList>
                  </CardContent>
                </Card>
              </AnimatedList>
            </div>
          </AnimatedSection>
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}
