"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import {
  Clock,
  HeartHandshake,
  Lightbulb,
  MapPin,
  MessageSquare,
  NotebookPen,
  Phone,
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
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation"

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    if (!privacyAccepted) {
      toast({
        title: "Consent required",
        description: "Please confirm the privacy notice before submitting the form.",
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
          ...formData,
          status: "unread",
          createdAt: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to send message")
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
      <BackgroundGradientAnimation
        firstColor="rgba(125, 39, 255, 0.2)"
        secondColor="rgba(0, 87, 255, 0.2)"
        thirdColor="rgba(0, 214, 242, 0.2)"
      />

      <div className="relative z-10">
        <MainNav />

        <main className="flex-1">
          <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                    Get in Touch
                  </h1>
                  <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                    Have a question or want to work together? Feel free to reach out!
                  </p>
                </div>
              </div>

              <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                      Contact Information
                    </h2>
                    <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                      Feel free to reach out through any of these channels
                    </p>
                  </div>
                  <div className="grid gap-6">
                    <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Email</CardTitle>
                          <CardDescription>
                            <a href="mailto:tim.hauke@hauknetz.de" className="hover:underline">
                              tim.hauke@hauknetz.de
                            </a>
                          </CardDescription>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <Phone className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Phone</CardTitle>
                          <CardDescription>
                            <a href="tel:+491726166860" className="hover:underline">
                              +49 172 6166860
                            </a>
                          </CardDescription>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
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
                  </div>
                  <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <Clock className="h-6 w-6 text-primary" />
                        <h3 className="text-xl font-semibold">What happens after you reach out</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Every enquiry lands directly in my inbox. I review project details personally before we jump on a call so
                        the conversation focuses on solutions, not introductions.
                      </p>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="mt-0.5 h-4 w-4 text-primary" />
                          <span>Share your mission, current challenges, and desired launch window—context helps me prepare.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <NotebookPen className="mt-0.5 h-4 w-4 text-primary" />
                          <span>You'll receive a summary of our discussion with next steps, timelines, and responsibilities.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <HeartHandshake className="mt-0.5 h-4 w-4 text-primary" />
                          <span>We collaborate transparently—no hidden costs, and you keep full access to code and documentation.</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
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
                            required
                            value={formData.subject}
                            onChange={handleChange}
                          />
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
                            I agree that my details may be used to process and respond to my enquiry in
                            accordance with the information provided in the{" "}
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
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                          disabled={isSubmitting || !privacyAccepted}
                        >
                          {isSubmitting ? "Sending..." : "Send Message"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30 backdrop-blur-sm">
            <div className="container px-4 md:px-6">
              <div className="grid gap-12 md:grid-cols-[1.2fr_1fr] md:items-center">
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                    Let's tell your story together
                  </h2>
                  <p className="text-gray-500 md:text-xl/relaxed dark:text-gray-400">
                    I'm passionate about spotlighting the people behind every initiative. Whether you represent a sports club,
                    an association, or an early-stage startup, we'll co-create digital touchpoints that reflect your culture and
                    aspirations.
                  </p>
                  <p className="text-gray-500 md:text-lg/relaxed dark:text-gray-400">
                    If you're unsure where to start, share your current stack or favourite toolset—I can audit your setup and
                    suggest small but high-impact changes before we plan a full project.
                  </p>
                </div>
                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold">Helpful resources</h3>
                    <p className="text-sm text-muted-foreground">
                      These links offer a deeper look at how I work and what to expect.
                    </p>
                    <div className="grid gap-3">
                      <Link
                        href="/projects"
                        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                      >
                        Explore detailed project breakdowns
                      </Link>
                      <Link href="/about" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                        Learn more about my background
                      </Link>
                      <Link href="/#faq" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                        Read common questions and support options
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}
