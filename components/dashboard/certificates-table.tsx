"use client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Edit, MoreHorizontal, Trash } from "lucide-react"

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
import { useCertificates } from "@/hooks/use-certificates"

// Add proper type for certificates
import type { Certificate } from "@/types/database"

export function DashboardCertificatesTable() {
    const router = useRouter()
    const { toast } = useToast()
    // Update the useCertificates hook return type
    const { certificates, isLoading, mutate } = useCertificates()

    const handleDeleteCertificate = async (id: string) => {
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

            toast({
                title: "Certificate deleted",
                description: "Your certificate has been deleted successfully.",
            })

            mutate()
        } catch (error) {
            console.error("Error deleting certificate:", error)
            toast({
                title: "Error",
                description: "Failed to delete certificate. Please try again.",
                variant: "destructive",
            })
        }
    }

    if (isLoading) {
        return <p>Loading certificates...</p>
    }

    if (!certificates?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-muted-foreground mb-4">No certificates found</p>
                <Link href="/dashboard/certificates/new">
                    <Button size="sm">Add your first certificate</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="rounded-md border">
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
                    {/* Fix the map function by adding proper type */}
                    {certificates.map((certificate: Certificate) => (
                        <TableRow key={certificate.id}>
                            <TableCell className="font-medium">{certificate.name}</TableCell>
                            <TableCell>{certificate.issuer}</TableCell>
                            <TableCell>{new Date(certificate.date).toLocaleDateString()}</TableCell>
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
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDeleteCertificate(certificate.id)}>
                                            <Trash className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

