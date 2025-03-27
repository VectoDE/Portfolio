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
import { useProjects } from "@/hooks/use-projects"

// Add proper type for projects
import type { Project } from "@/types/database"

export function DashboardProjectsTable() {
    const router = useRouter()
    const { toast } = useToast()
    // Update the useProjects hook return type
    const { projects, isLoading, mutate } = useProjects()

    const handleDeleteProject = async (id: string) => {
        if (!confirm("Are you sure you want to delete this project?")) {
            return
        }

        try {
            const response = await fetch(`/api/projects/${id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Failed to delete project")
            }

            toast({
                title: "Project deleted",
                description: "Your project has been deleted successfully.",
            })

            mutate()
        } catch (error) {
            console.error("Error deleting project:", error)
            toast({
                title: "Error",
                description: "Failed to delete project. Please try again.",
                variant: "destructive",
            })
        }
    }

    if (isLoading) {
        return <p>Loading projects...</p>
    }

    if (!projects?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-muted-foreground mb-4">No projects found</p>
                <Link href="/dashboard/projects/new">
                    <Button size="sm">Add your first project</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Technologies</TableHead>
                        <TableHead>Featured</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {/* Fix the map function by adding proper type */}
                    {projects.map((project: Project) => (
                        <TableRow key={project.id}>
                            <TableCell className="font-medium">{project.title}</TableCell>
                            <TableCell className="max-w-[300px] truncate">{project.description}</TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {project.technologies.split(", ").map((tech: string) => (
                                        <span
                                            key={tech}
                                            className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </TableCell>
                            <TableCell>{project.featured ? "Yes" : "No"}</TableCell>
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
                                        <DropdownMenuItem onClick={() => router.push(`/dashboard/projects/${project.id}`)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDeleteProject(project.id)}>
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

