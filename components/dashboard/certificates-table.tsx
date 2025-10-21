"use client"

import { useState, useEffect, useCallback } from "react"
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
import type { Certificate } from "@/types/database"

interface PaginationData {
    total: number
    pages: number
    page: number
    limit: number
}

interface CertificatesResponse {
    certificates: Certificate[]
    pagination: PaginationData
}

export function DashboardCertificatesTable() {
    const router = useRouter()
    const { toast } = useToast()
    const [certificates, setCertificates] = useState<Certificate[]>([])
    const [loading, setLoading] = useState(true)
    const [issuerFilter, setIssuerFilter] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [pagination, setPagination] = useState<PaginationData>({
        total: 0,
        pages: 1,
        page: 1,
        limit: 10,
    })

    // Fetch certificates
    const fetchCertificates = useCallback(
        async (page = 1, issuer?: string) => {
            setLoading(true)
            try {
                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: pagination.limit.toString(),
                })

                if (issuer && issuer !== "all") {
                    params.set("issuer", issuer)
                }

                const response = await fetch(`/api/certificates?${params.toString()}`)
                if (!response.ok) {
                    throw new Error("Failed to fetch certificates")
                }

                const data: CertificatesResponse = await response.json()
                setCertificates(data.certificates || [])
                setPagination(data.pagination || { total: 0, pages: 1, page: 1, limit: 10 })
            } catch (error) {
                console.error("Error fetching certificates:", error)
                toast({
                    title: "Error",
                    description: "Failed to load certificates",
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
        fetchCertificates(1, issuerFilter !== "all" ? issuerFilter : undefined)
    }, [issuerFilter, fetchCertificates])

    // Handle delete
    async function handleDeleteCertificate(id: string) {
        if (!confirm("Are you sure you want to delete this certificate?")) {
            return
        }

        try {
            const response = await fetch(`/api/certificates/${id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Failed to delete certificate")
            }

            // Remove the certificate from the local state
            setCertificates((prevCertificates) => prevCertificates.filter((certificate) => certificate.id !== id))

            toast({
                title: "Certificate deleted",
                description: "The certificate has been deleted successfully",
            })
        } catch (error) {
            console.error("Error deleting certificate:", error)
            toast({
                title: "Error",
                description: "Failed to delete certificate",
                variant: "destructive",
            })
        }
    }

    // Handle page change
    function handlePageChange(newPage: number) {
        fetchCertificates(newPage, issuerFilter !== "all" ? issuerFilter : undefined)
    }

    // Get unique issuers for filter
    const uniqueIssuers = Array.from(new Set(certificates.map((cert) => cert.issuer)))

    // Filter certificates by search query
    const filteredCertificates = certificates.filter(
        (certificate) =>
            certificate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            certificate.issuer.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={issuerFilter} onValueChange={setIssuerFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by issuer" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Issuers</SelectItem>
                            {uniqueIssuers.map((issuer) => (
                                <SelectItem key={issuer} value={issuer}>
                                    {issuer}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="relative">
                    <Input
                        placeholder="Search certificates..."
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
                                <TableHead>Name</TableHead>
                                <TableHead>Issuer</TableHead>
                                <TableHead>Date</TableHead>
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
                            ) : filteredCertificates.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                                        <p>No certificates found</p>
                                        <Link href="/dashboard/certificates/new" className="mt-2 inline-block">
                                            <Button size="sm">Add your first certificate</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCertificates.map((certificate) => {
                                    // Convert Date to string for display
                                    const dateString =
                                        typeof certificate.date === "string" ? certificate.date : new Date(certificate.date).toISOString()

                                    return (
                                        <TableRow key={certificate.id}>
                                            <TableCell className="font-medium">{certificate.name}</TableCell>
                                            <TableCell>{certificate.issuer}</TableCell>
                                            <TableCell>{format(new Date(dateString), "MMM d, yyyy")}</TableCell>
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
                                                        <DropdownMenuItem onClick={() => router.push(`/dashboard/certificates/${certificate.id}`)}>
                                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDeleteCertificate(certificate.id)}>
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
