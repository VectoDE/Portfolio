"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { Edit, Filter, MoreHorizontal, Trash } from "lucide-react"

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
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import type { Career } from "@/types/database"

interface PaginationData {
    total: number
    pages: number
    page: number
    limit: number
}

export function DashboardCareerTable() {
    const router = useRouter()
    const { toast } = useToast()
    const [careers, setCareers] = useState<Career[]>([])
    const [loading, setLoading] = useState(true)
    const [companyFilter, setCompanyFilter] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [pagination, setPagination] = useState<PaginationData>({
        total: 0,
        pages: 1,
        page: 1,
        limit: 10,
    })

    // Fetch career entries
    async function fetchCareers(page = 1, company?: string) {
        setLoading(true)
        try {
            let url = `/api/career?page=${page}&limit=${pagination?.limit || 10}`
            if (company && company !== "all") {
                url += `&company=${company}`
            }

            const response = await fetch(url)
            if (!response.ok) {
                throw new Error("Failed to fetch career entries")
            }

            const data = await response.json()
            setCareers(data.careers || [])
            setPagination(data.pagination || { total: 0, pages: 1, page: 1, limit: 10 })
        } catch (error) {
            console.error("Error fetching career entries:", error)
            toast({
                title: "Error",
                description: "Failed to load career entries",
                variant: "destructive",
            })
            // Set default pagination on error
            setPagination({ total: 0, pages: 1, page: 1, limit: 10 })
        } finally {
            setLoading(false)
        }
    }

    // Initial fetch
    useEffect(() => {
        fetchCareers(1, companyFilter !== "all" ? companyFilter : undefined)
    }, [companyFilter])

    // Handle delete
    async function handleDeleteCareer(id: string) {
        if (!confirm("Are you sure you want to delete this career entry?")) {
            return
        }

        try {
            const response = await fetch(`/api/career/${id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Failed to delete career entry")
            }

            // Remove the career entry from the local state
            setCareers((prevCareers) => prevCareers.filter((career) => career.id !== id))

            toast({
                title: "Career entry deleted",
                description: "The career entry has been deleted successfully",
            })
        } catch (error) {
            console.error("Error deleting career entry:", error)
            toast({
                title: "Error",
                description: "Failed to delete career entry",
                variant: "destructive",
            })
        }
    }

    // Handle page change
    function handlePageChange(newPage: number) {
        fetchCareers(newPage, companyFilter !== "all" ? companyFilter : undefined)
    }

    // Get unique companies for filter
    const uniqueCompanies = Array.from(new Set(careers.map((career) => career.company)))

    // Filter career entries by search query
    const filteredCareers = careers.filter(
        (career) =>
            career.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
            career.company.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={companyFilter} onValueChange={setCompanyFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by company" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Companies</SelectItem>
                            {uniqueCompanies.map((company) => (
                                <SelectItem key={company} value={company}>
                                    {company}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="relative">
                    <Input
                        placeholder="Search career entries..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-[300px]"
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Position</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead>Period</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell>Loading...</TableCell>
                                        <TableCell>Loading...</TableCell>
                                        <TableCell>Loading...</TableCell>
                                        <TableCell>Loading...</TableCell>
                                    </TableRow>
                                ))
                            ) : filteredCareers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                                        <p>No career entries found</p>
                                        <Link href="/dashboard/career/new" className="mt-2 inline-block">
                                            <Button size="sm">Add your first career entry</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCareers.map((career) => {
                                    // Convert Date to string for display
                                    const startDateString =
                                        typeof career.startDate === "string" ? career.startDate : new Date(career.startDate).toISOString()

                                    const endDateString =
                                        career.endDate === "Present"
                                            ? "Present"
                                            : typeof career.endDate === "string"
                                                ? career.endDate
                                                : new Date(career.endDate as Date).toISOString()

                                    return (
                                        <TableRow key={career.id}>
                                            <TableCell className="font-medium">{career.position}</TableCell>
                                            <TableCell>{career.company}</TableCell>
                                            <TableCell>
                                                {format(new Date(startDateString), "MMM yyyy")} -{" "}
                                                {endDateString === "Present" ? "Present" : format(new Date(endDateString), "MMM yyyy")}
                                            </TableCell>
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
                                                        <DropdownMenuItem onClick={() => router.push(`/dashboard/career/${career.id}`)}>
                                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDeleteCareer(career.id)}>
                                                            <Trash className="mr-2 h-4 w-4" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
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
