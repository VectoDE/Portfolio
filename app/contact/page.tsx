"use client"

import type React from "react"

import { useState } from "react"
import { MapPin, Phone, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      toast({
        title: "Message sent",
        description: "Thank you for your message. I'll get back to you soon!",
      })

      setFormData({
        name: "",
        email: "",
        message: "",
      })
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
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
                            <a href="mailto:contact@example.com" className="hover:underline">
                              contact@example.com
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
                            <a href="tel:+1234567890" className="hover:underline">
                              +1 (234) 567-890
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
                          <CardDescription>San Francisco, California</CardDescription>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
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
                          <Label htmlFor="name">Name</Label>
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
                          <Label htmlFor="email">Email</Label>
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
                          <Label htmlFor="message">Message</Label>
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
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                          disabled={isSubmitting}
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
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}

