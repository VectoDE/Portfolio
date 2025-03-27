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
import { useSkills } from "@/hooks/use-skills"
import type { Skill } from "@/types/database"

export function DashboardSkillsTable() {
    const router = useRouter()
    const { toast } = useToast()
    const { skills, isLoading, mutate } = useSkills()

    const handleDeleteSkill = async (id: string) => {
        if (!confirm("Are you sure you want to delete this skill?")) {
            return
        }

        try {
            const response = await fetch(`/api/skills/${id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Failed to delete skill")
            }

            toast({
                title: "Skill deleted",
                description: "Your skill has been deleted successfully.",
            })

            mutate()
        } catch (error) {
            console.error("Error deleting skill:", error)
            toast({
                title: "Error",
                description: "Failed to delete skill. Please try again.",
                variant: "destructive",
            })
        }
    }

    if (isLoading) {
        return <p>Loading skills...</p>
    }

    if (!skills?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-muted-foreground mb-4">No skills found</p>
                <Link href="/dashboard/skills/new">
                    <Button size="sm">Add your first skill</Button>
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
                        <TableHead>Category</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Years</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {skills.map((skill: Skill) => (
                        <TableRow key={skill.id}>
                            <TableCell className="font-medium">{skill.name}</TableCell>
                            <TableCell>{skill.category}</TableCell>
                            <TableCell>{skill.level}</TableCell>
                            <TableCell>{skill.years}</TableCell>
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
                                        <DropdownMenuItem onClick={() => router.push(`/dashboard/skills/${skill.id}`)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDeleteSkill(skill.id)}>
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

