"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Archive, CheckCircle, Eye, Filter, MoreHorizontal, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

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

interface PaginationData {
    total: number
    pages: number
    page: number
    limit: number
}

interface ContactsResponse {
    contacts: Contact[]
    pagination: PaginationData
}

export function DashboardContactsTable() {
    const router = useRouter()
    const { toast } = useToast()
    const [contacts, setContacts] = useState<Contact[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [pagination, setPagination] = useState<PaginationData>({
        total: 0,
        pages: 1,
        page: 1,
        limit: 10,
    })

    // Fetch contacts
    const fetchContacts = useCallback(
        async (page = 1, status?: string) => {
            setLoading(true)
            try {
                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: pagination.limit.toString(),
                })

                if (status && status !== "all") {
                    params.set("status", status)
                }

                const response = await fetch(`/api/contacts?${params.toString()}`)
                if (!response.ok) {
                    throw new Error("Failed to fetch contacts")
                }

                const data: ContactsResponse = await response.json()
                setContacts(data.contacts || [])
                setPagination(data.pagination || { total: 0, pages: 1, page: 1, limit: 10 })
            } catch (error) {
                console.error("Error fetching contacts:", error)
                toast({
                    title: "Error",
                    description: "Failed to load contacts",
                    variant: "destructive",
                })
                // Set default pagination on error
                setPagination({ total: 0, pages: 1, page: 1, limit: 10 })
            } finally {
                setLoading(false)
            }
        },
        [pagination.limit, toast],
    )

    // Initial fetch
    useEffect(() => {
        fetchContacts(1, statusFilter !== "all" ? statusFilter : undefined)
    }, [statusFilter, fetchContacts])

    // Handle status change
    async function handleStatusChange(contactId: string, newStatus: Contact["status"]) {
        try {
            const response = await fetch(`/api/contacts/${contactId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            })

            if (!response.ok) {
                throw new Error("Failed to update contact status")
            }

            // Update the contact in the local state
            setContacts((prevContacts) =>
                prevContacts.map((contact) => (contact.id === contactId ? { ...contact, status: newStatus } : contact)),
            )

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
    }

    // Handle delete
    async function handleDelete(contactId: string) {
        if (!confirm("Are you sure you want to delete this contact?")) {
            return
        }

        try {
            const response = await fetch(`/api/contacts/${contactId}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Failed to delete contact")
            }

            // Remove the contact from the local state
            setContacts((prevContacts) => prevContacts.filter((contact) => contact.id !== contactId))

            toast({
                title: "Contact deleted",
                description: "The contact has been deleted successfully",
            })
        } catch (error) {
            console.error("Error deleting contact:", error)
            toast({
                title: "Error",
                description: "Failed to delete contact",
                variant: "destructive",
            })
        }
    }

    // Handle page change
    function handlePageChange(newPage: number) {
        fetchContacts(newPage, statusFilter !== "all" ? statusFilter : undefined)
    }

    // Get status badge
    function getStatusBadge(status: string) {
        switch (status) {
            case "unread":
                return (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                        Unread
                    </Badge>
                )
            case "read":
                return (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                        Read
                    </Badge>
                )
            case "replied":
                return (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        Replied
                    </Badge>
                )
            case "archived":
                return (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                        Archived
                    </Badge>
                )
            default:
                return null
        }
    }

    // Filter contacts by search query
    const filteredContacts = contacts.filter(
        (contact) =>
            contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.subject.toLowerCase().includes(searchQuery.toLowerCase()),
    )

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
                            <SelectItem value="all">All Messages</SelectItem>
                            <SelectItem value="unread">Unread</SelectItem>
                            <SelectItem value="read">Read</SelectItem>
                            <SelectItem value="replied">Replied</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="relative">
                    <Input
                        placeholder="Search contacts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-[300px]"
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead>
                            <tr className="border-b transition-colors hover:bg-muted/50">
                                <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                                <th className="h-12 px-4 text-left align-middle font-medium">Subject</th>
                                <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                                <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                                <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <tr key={index} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4">Loading...</td>
                                        <td className="p-4">Loading...</td>
                                        <td className="p-4">Loading...</td>
                                        <td className="p-4">Loading...</td>
                                        <td className="p-4">Loading...</td>
                                    </tr>
                                ))
                            ) : filteredContacts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                        No contacts found
                                    </td>
                                </tr>
                            ) : (
                                filteredContacts.map((contact) => (
                                    <tr
                                        key={contact.id}
                                        className={`border-b transition-colors hover:bg-muted/50 ${contact.status === "unread" ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                                            }`}
                                    >
                                        <td className="p-4 font-medium">
                                            <div>{contact.name}</div>
                                            <div className="text-xs text-muted-foreground">{contact.email}</div>
                                        </td>
                                        <td className="p-4 max-w-[200px] truncate">{contact.subject || "No subject"}</td>
                                        <td className="p-4">{getStatusBadge(contact.status)}</td>
                                        <td className="p-4 text-muted-foreground">{format(new Date(contact.createdAt), "MMM d, yyyy")}</td>
                                        <td className="p-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => router.push(`/dashboard/contacts/${contact.id}`)}>
                                                        <Eye className="mr-2 h-4 w-4" /> View Details
                                                    </DropdownMenuItem>
                                                    {contact.status === "unread" && (
                                                        <DropdownMenuItem onClick={() => handleStatusChange(contact.id, "read")}>
                                                            <Eye className="mr-2 h-4 w-4" /> Mark as Read
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onClick={() => handleStatusChange(contact.id, "replied")}>
                                                        <CheckCircle className="mr-2 h-4 w-4" /> Mark as Replied
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(contact.id, "archived")}>
                                                        <Archive className="mr-2 h-4 w-4" /> Archive
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(contact.id)} className="text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                if (pagination?.page > 1) handlePageChange(pagination.page - 1)
                            }}
                        />
                    </PaginationItem>
                    {Array.from({ length: pagination?.pages || 1 }, (_, i) => (
                        <PaginationItem key={i}>
                            <PaginationLink
                                href="#"
                                isActive={pagination?.page === i + 1}
                                onClick={(e) => {
                                    e.preventDefault()
                                    handlePageChange(i + 1)
                                }}
                            >
                                {i + 1}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                if (pagination?.page < (pagination?.pages || 1)) handlePageChange(pagination.page + 1)
                            }}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    )
}
