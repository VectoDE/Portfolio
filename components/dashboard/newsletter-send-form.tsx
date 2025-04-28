"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function NewsletterSendForm() {
    const router = useRouter()
    const { toast } = useToast()
    const [isSending, setIsSending] = useState(false)
    const [newsletterData, setNewsletterData] = useState({
        subject: "",
        content: "",
        contentType: "project" as "project" | "certificate" | "skill" | "career",
        contentId: "",
    })

    function handleNewsletterChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value } = e.target
        setNewsletterData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    function handleContentTypeChange(value: string) {
        setNewsletterData((prev) => ({
            ...prev,
            contentType: value as "project" | "certificate" | "skill" | "career",
        }))
    }

    async function handleSendNewsletter(e: React.FormEvent) {
        e.preventDefault()

        if (!newsletterData.subject || !newsletterData.content || !newsletterData.contentId) {
            toast({
                title: "Missing information",
                description: "Please fill in all required fields",
                variant: "destructive",
            })
            return
        }

        setIsSending(true)
        try {
            const response = await fetch("/api/newsletter/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    type: newsletterData.contentType,
                    contentId: newsletterData.contentId,
                    title: newsletterData.subject,
                    description: newsletterData.content,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to send newsletter")
            }

            const result = await response.json()

            toast({
                title: "Newsletter sent",
                description: `Successfully sent to ${result.sentCount} subscribers`,
            })

            // Reset form and redirect back to newsletter page
            setNewsletterData({
                subject: "",
                content: "",
                contentType: "project",
                contentId: "",
            })

            router.push("/dashboard/newsletter")
        } catch (error) {
            console.error("Error sending newsletter:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to send newsletter",
                variant: "destructive",
            })
        } finally {
            setIsSending(false)
        }
    }

    return (
        <form onSubmit={handleSendNewsletter} className="space-y-6">
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="contentType">Content Type</Label>
                        <Select value={newsletterData.contentType} onValueChange={handleContentTypeChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select content type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="project">Project</SelectItem>
                                <SelectItem value="certificate">Certificate</SelectItem>
                                <SelectItem value="skill">Skill</SelectItem>
                                <SelectItem value="career">Career</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contentId">Content ID</Label>
                        <Input
                            id="contentId"
                            name="contentId"
                            placeholder="Enter the ID of the content"
                            value={newsletterData.contentId}
                            onChange={handleNewsletterChange}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                        id="subject"
                        name="subject"
                        placeholder="Newsletter subject"
                        value={newsletterData.subject}
                        onChange={handleNewsletterChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                        id="content"
                        name="content"
                        placeholder="Write your newsletter content here..."
                        rows={8}
                        value={newsletterData.content}
                        onChange={handleNewsletterChange}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.push("/dashboard/newsletter")}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSending}>
                    {isSending ? (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Sending...
                        </>
                    ) : (
                        <>
                            <Send className="mr-2 h-4 w-4" /> Send Newsletter
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}
