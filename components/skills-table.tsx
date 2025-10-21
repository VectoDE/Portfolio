"use client"

import type React from "react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface SkillTableEntry {
  id: string
  name: string
  category: string
  level: string
  years: number
}

// Mock data for skills
const initialSkills: SkillTableEntry[] = [
  {
    id: "1",
    name: "React",
    category: "Frontend",
    level: "Expert",
    years: 4,
  },
  {
    id: "2",
    name: "Node.js",
    category: "Backend",
    level: "Advanced",
    years: 3,
  },
  {
    id: "3",
    name: "TypeScript",
    category: "Language",
    level: "Expert",
    years: 3,
  },
  {
    id: "4",
    name: "Next.js",
    category: "Frontend",
    level: "Advanced",
    years: 2,
  },
  {
    id: "5",
    name: "PostgreSQL",
    category: "Database",
    level: "Intermediate",
    years: 3,
  },
]

export function SkillsTable() {
  const [skills, setSkills] = useState<SkillTableEntry[]>(initialSkills)
  const [open, setOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<SkillTableEntry | null>(null)

  const handleAddSkill = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const newSkill: SkillTableEntry = {
      id: Date.now().toString(),
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      level: formData.get("level") as string,
      years: Number(formData.get("years")),
    }

    setSkills([...skills, newSkill])
    setOpen(false)
  }

  const handleEditSkill = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    if (!editingSkill) {
      return
    }

    const updatedSkill: SkillTableEntry = {
      id: editingSkill.id,
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      level: formData.get("level") as string,
      years: Number(formData.get("years")),
    }

    setSkills(skills.map((s) => (s.id === editingSkill.id ? updatedSkill : s)))
    setOpen(false)
    setEditingSkill(null)
  }

  const handleDeleteSkill = (id: string) => {
    setSkills(skills.filter((s) => s.id !== id))
  }

  const openEditDialog = (skill: SkillTableEntry) => {
    setEditingSkill(skill)
    setOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Skills</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" /> Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSkill ? "Edit Skill" : "Add Skill"}</DialogTitle>
              <DialogDescription>
                {editingSkill
                  ? "Update the skill details below."
                  : "Add a new skill to your portfolio."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={editingSkill ? handleEditSkill : handleAddSkill}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Skill Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingSkill?.name || ""}
                    placeholder="Skill name"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" defaultValue={editingSkill?.category || "Frontend"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Frontend">Frontend</SelectItem>
                      <SelectItem value="Backend">Backend</SelectItem>
                      <SelectItem value="Database">Database</SelectItem>
                      <SelectItem value="DevOps">DevOps</SelectItem>
                      <SelectItem value="Language">Language</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="level">Level</Label>
                  <Select name="level" defaultValue={editingSkill?.level || "Intermediate"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="years">Years of Experience</Label>
                  <Input
                    id="years"
                    name="years"
                    type="number"
                    min="0"
                    step="0.5"
                    defaultValue={editingSkill?.years || "1"}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingSkill ? "Save Changes" : "Add Skill"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
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
            {skills.map((skill) => (
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
                      <DropdownMenuItem onClick={() => openEditDialog(skill)}>
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
    </div>
  )
}
