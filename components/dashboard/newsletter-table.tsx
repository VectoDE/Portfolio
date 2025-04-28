"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Mail, Send, Trash2, CheckCircle, XCircle, Filter, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

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
    const [selectAll, setSelectAll] = useState(false)
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [newsletterData, setNewsletterData] = useState({
        subject: "",
        content: "",
        contentType: "project" as "project" | "certificate" | "skill" | "career",
        contentId: "",
        targetEmail: "",
    })
    const [isSending, setIsSending] = useState(false)

    // Fetch subscribers
    async function fetchSubscribers() {
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
    }

    // Initial fetch
    useEffect(() => {
        fetchSubscribers()
    }, [])

    function handleSelectAll(checked: boolean) {
        setSelectAll(checked)
        if (checked) {
            setSelectedSubscribers(subscribers.map((sub) => sub.id))
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

    async function handleDeleteSubscribers() {
        if (!confirm(`Are you sure you want to delete ${selectedSubscribers.length} subscriber(s)?`)) {
            return
        }

        try {
            // This is a placeholder - implement the actual delete API call
            toast({
                title: "Subscribers deleted",
                description: `${selectedSubscribers.length} subscriber(s) have been deleted`,
            })

            // Remove the subscribers from the local state
            setSubscribers((prev) => prev.filter((sub) => !selectedSubscribers.includes(sub.id)))
            setSelectedSubscribers([])
            setSelectAll(false)
        } catch (error) {
            console.error("Error deleting subscribers:", error)
            toast({
                title: "Error",
                description: "Failed to delete subscribers",
                variant: "destructive",
            })
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
                                    <Checkbox checked={selectAll} onCheckedChange={(checked) => handleSelectAll(checked === true)} />
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
                                                onCheckedChange={(checked) => handleSelectSubscriber(subscriber.id, checked === true)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{subscriber.email}</TableCell>
                                        <TableCell>
                                            {subscriber.confirmed ? (
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                    <CheckCircle className="mr-1 h-3 w-3" /> Confirmed
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
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
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            // Set the subscriber email as the target
                                                            setNewsletterData((prev) => ({
                                                                ...prev,
                                                                targetEmail: subscriber.email,
                                                            }))

                                                            // Show a confirmation dialog
                                                            if (confirm(`Send a test newsletter to ${subscriber.email}?`)) {
                                                                setIsSending(true)

                                                                // Simulate sending (replace with actual API call)
                                                                setTimeout(() => {
                                                                    setIsSending(false)
                                                                    toast({
                                                                        title: "Test email sent",
                                                                        description: `A test newsletter was sent to ${subscriber.email}`,
                                                                    })
                                                                }, 1500)
                                                            }
                                                        }}
                                                    >
                                                        {isSending ? (
                                                            <>
                                                                <span className="mr-2 h-4 w-4 animate-spin">⏳</span> Sending...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Send className="mr-2 h-4 w-4" /> Send Email
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
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
                        {selectedSubscribers.length} subscriber{selectedSubscribers.length !== 1 ? "s" : ""} selected
                    </div>
                    <Button variant="destructive" size="sm" onClick={handleDeleteSubscribers}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Selected
                    </Button>
                </div>
            )}
        </div>
    )
}
