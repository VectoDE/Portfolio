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
import { useCareer } from "@/hooks/use-career"
import type { Career } from "@/types/database"

export function DashboardCareerTable() {
    const router = useRouter()
    const { toast } = useToast()
    const { careers, isLoading, mutate } = useCareer()

    const handleDeleteCareer = async (id: string) => {
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

            toast({
                title: "Career entry deleted",
                description: "Your career entry has been deleted successfully.",
            })

            mutate()
        } catch (error) {
            console.error("Error deleting career entry:", error)
            toast({
                title: "Error",
                description: "Failed to delete career entry. Please try again.",
                variant: "destructive",
            })
        }
    }

    if (isLoading) {
        return <p>Loading career entries...</p>
    }

    if (!careers?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-muted-foreground mb-4">No career entries found</p>
                <Link href="/dashboard/career/new">
                    <Button size="sm">Add your first career entry</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="rounded-md border">
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
                    {careers.map((item: Career) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.position}</TableCell>
                            <TableCell>{item.company}</TableCell>
                            <TableCell>
                                {new Date(item.startDate).toLocaleDateString()} -{" "}
                                {item.endDate === "Present" ? "Present" : new Date(item.endDate as string).toLocaleDateString()}
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
                                        <DropdownMenuItem onClick={() => router.push(`/dashboard/career/${item.id}`)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDeleteCareer(item.id)}>
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

