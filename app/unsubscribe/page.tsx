"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2, CheckCircle, XCircle, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation"

export default function UnsubscribePage() {
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    const [status, setStatus] = useState<"loading" | "success" | "error" | "preferences">("loading")
    const [message, setMessage] = useState("")
    const [subscriberEmail, setSubscriberEmail] = useState("")
    const [preferences, setPreferences] = useState({
        projects: true,
        certificates: true,
        skills: true,
        careers: true,
    })
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (!token) {
            setStatus("error")
            setMessage("Invalid unsubscribe link. Please check your email and try again.")
            return
        }

        async function verifyToken() {
            try {
                const response = await fetch(`/api/newsletter/verify?token=${token}`)
                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.message || "Failed to verify subscription")
                }

                setSubscriberEmail(data.email)
                if (data.preferences) {
                    setPreferences(data.preferences)
                }
            } catch (error) {
                console.error("Token verification error:", error)
                setStatus("error")
                setMessage(error instanceof Error ? error.message : "Something went wrong")
            }
        }

        verifyToken()
    }, [token])

    async function handleUnsubscribe() {
        if (!token) return

        setStatus("loading")
        try {
            const response = await fetch(`/api/newsletter/unsubscribe`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || "Failed to unsubscribe")
            }

            setStatus("success")
            setMessage("You have been successfully unsubscribed from the newsletter.")
        } catch (error) {
            console.error("Unsubscribe error:", error)
            setStatus("error")
            setMessage(error instanceof Error ? error.message : "Something went wrong")
        }
    }

    function handleShowPreferences() {
        setStatus("preferences")
    }

    async function handleSavePreferences() {
        if (!token) return

        setIsSaving(true)
        try {
            const response = await fetch(`/api/newsletter/preferences`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token, preferences }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || "Failed to save preferences")
            }

            setStatus("success")
            setMessage("Your newsletter preferences have been updated successfully.")
        } catch (error) {
            console.error("Save preferences error:", error)
            setStatus("error")
            setMessage(error instanceof Error ? error.message : "Something went wrong")
        } finally {
            setIsSaving(false)
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
                        <div className="container px-4 md:px-6 max-w-md mx-auto">
                            <Card className="border border-purple-200 dark:border-purple-800 bg-background/60 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-2xl">Manage Newsletter Subscription</CardTitle>
                                    {subscriberEmail && <CardDescription>Email: {subscriberEmail}</CardDescription>}
                                </CardHeader>
                                <CardContent>
                                    {status === "loading" && (
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                                            <p>Verifying your request...</p>
                                        </div>
                                    )}

                                    {status === "success" && (
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                                            <p className="text-center">{message}</p>
                                        </div>
                                    )}

                                    {status === "error" && (
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <XCircle className="h-12 w-12 text-red-500 mb-4" />
                                            <p className="text-center">{message}</p>
                                        </div>
                                    )}

                                    {status === "preferences" && (
                                        <div className="space-y-4 py-4">
                                            <h3 className="text-lg font-medium">Newsletter Preferences</h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Select the types of updates you'd like to receive:
                                            </p>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <label htmlFor="projects" className="text-sm font-medium">
                                                        New Projects
                                                    </label>
                                                    <input
                                                        type="checkbox"
                                                        id="projects"
                                                        checked={preferences.projects}
                                                        onChange={(e) => setPreferences({ ...preferences, projects: e.target.checked })}
                                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <label htmlFor="certificates" className="text-sm font-medium">
                                                        New Certificates
                                                    </label>
                                                    <input
                                                        type="checkbox"
                                                        id="certificates"
                                                        checked={preferences.certificates}
                                                        onChange={(e) => setPreferences({ ...preferences, certificates: e.target.checked })}
                                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <label htmlFor="skills" className="text-sm font-medium">
                                                        New Skills
                                                    </label>
                                                    <input
                                                        type="checkbox"
                                                        id="skills"
                                                        checked={preferences.skills}
                                                        onChange={(e) => setPreferences({ ...preferences, skills: e.target.checked })}
                                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <label htmlFor="careers" className="text-sm font-medium">
                                                        Career Updates
                                                    </label>
                                                    <input
                                                        type="checkbox"
                                                        id="careers"
                                                        checked={preferences.careers}
                                                        onChange={(e) => setPreferences({ ...preferences, careers: e.target.checked })}
                                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>

                                <CardFooter className="flex flex-col space-y-2">
                                    {status !== "success" && status !== "error" && (
                                        <>
                                            {status === "loading" && (
                                                <div className="flex space-x-2">
                                                    <Button variant="outline" onClick={handleUnsubscribe}>
                                                        Unsubscribe
                                                    </Button>
                                                    <Button variant="outline" onClick={handleShowPreferences}>
                                                        <Settings className="mr-2 h-4 w-4" />
                                                        Preferences
                                                    </Button>
                                                </div>
                                            )}

                                            {status === "preferences" && (
                                                <div className="flex space-x-2 w-full">
                                                    <Button variant="outline" onClick={() => setStatus("loading")} className="flex-1">
                                                        Cancel
                                                    </Button>
                                                    <Button onClick={handleSavePreferences} disabled={isSaving} className="flex-1">
                                                        {isSaving ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Saving...
                                                            </>
                                                        ) : (
                                                            "Save Preferences"
                                                        )}
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {(status === "success" || status === "error") && (
                                        <Link href="/" passHref>
                                            <Button variant="outline" className="w-full">
                                                Return to Homepage
                                            </Button>
                                        </Link>
                                    )}
                                </CardFooter>
                            </Card>
                        </div>
                    </section>
                </main>

                <SiteFooter />
            </div>
        </div>
    )
}
