"use client"

import { useState } from "react"
import { Edit, MoreHorizontal, Plus, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

interface ProjectTableEntry {
  id: string
  title: string
  description: string
  technologies: string[]
  link: string
  featured: boolean
}

// Mock data for projects
const initialProjects: ProjectTableEntry[] = [
  {
    id: "1",
    title: "E-commerce Platform",
    description: "A modern e-commerce platform with advanced features",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Prisma"],
    link: "https://example.com/project1",
    featured: true,
  },
  {
    id: "2",
    title: "Task Management App",
    description: "A collaborative task management application",
    technologies: ["React", "Node.js", "Express", "MongoDB"],
    link: "https://example.com/project2",
    featured: true,
  },
  {
    id: "3",
    title: "Real-time Chat Application",
    description: "A real-time messaging platform with video calls",
    technologies: ["Next.js", "Socket.io", "WebRTC", "Supabase"],
    link: "https://example.com/project3",
    featured: true,
  },
]

export function ProjectsTable() {
  const [projects, setProjects] = useState<ProjectTableEntry[]>(initialProjects)
  const [open, setOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectTableEntry | null>(null)

  const handleAddProject = (formData: FormData) => {
    const newProject: ProjectTableEntry = {
      id: Date.now().toString(),
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      technologies: (formData.get("technologies") as string).split(",").map((t) => t.trim()),
      link: formData.get("link") as string,
      featured: Boolean(formData.get("featured")),
    }

    setProjects([...projects, newProject])
    setOpen(false)
  }

  const handleEditProject = (formData: FormData) => {
    if (!editingProject) {
      return
    }

    const updatedProject: ProjectTableEntry = {
      id: editingProject.id,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      technologies: (formData.get("technologies") as string).split(",").map((t) => t.trim()),
      link: formData.get("link") as string,
      featured: Boolean(formData.get("featured")),
    }

    setProjects(projects.map((p) => (p.id === editingProject.id ? updatedProject : p)))
    setOpen(false)
    setEditingProject(null)
  }

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id))
  }

  const openEditDialog = (project: ProjectTableEntry) => {
    setEditingProject(project)
    setOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Projects</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" /> Add Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProject ? "Edit Project" : "Add Project"}</DialogTitle>
              <DialogDescription>
                {editingProject ? "Update the project details below." : "Add a new project to your portfolio."}
              </DialogDescription>
            </DialogHeader>
            <form action={editingProject ? handleEditProject : handleAddProject}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={editingProject?.title || ""}
                    placeholder="Project title"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingProject?.description || ""}
                    placeholder="Project description"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="technologies">Technologies</Label>
                  <Input
                    id="technologies"
                    name="technologies"
                    defaultValue={editingProject?.technologies.join(", ") || ""}
                    placeholder="Next.js, TypeScript, Tailwind CSS"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="link">Project Link</Label>
                  <Input
                    id="link"
                    name="link"
                    defaultValue={editingProject?.link || ""}
                    placeholder="https://example.com/project"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="featured"
                    name="featured"
                    type="checkbox"
                    defaultChecked={editingProject?.featured || false}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="featured">Featured Project</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingProject ? "Save Changes" : "Add Project"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
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
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.title}</TableCell>
                <TableCell className="max-w-[300px] truncate">{project.description}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium"
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
                      <DropdownMenuItem onClick={() => openEditDialog(project)}>
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
    </div>
  )
}

