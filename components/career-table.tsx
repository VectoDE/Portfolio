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

// Mock data for career
const initialCareer = [
  {
    id: "1",
    position: "Senior Full Stack Developer",
    company: "Tech Innovations Inc.",
    startDate: "2021-06-01",
    endDate: "Present",
    description: "Leading the development of enterprise web applications using Next.js, React, and Node.js.",
  },
  {
    id: "2",
    position: "Full Stack Developer",
    company: "Digital Solutions Ltd.",
    startDate: "2019-03-15",
    endDate: "2021-05-30",
    description: "Developed and maintained multiple client projects using React, Express, and MongoDB.",
  },
  {
    id: "3",
    position: "Frontend Developer",
    company: "WebCraft Agency",
    startDate: "2017-09-01",
    endDate: "2019-03-01",
    description: "Created responsive web interfaces for various clients using HTML, CSS, and JavaScript.",
  },
]

export function CareerTable() {
  const [career, setCareer] = useState(initialCareer)
  const [open, setOpen] = useState(false)
  const [editingCareer, setEditingCareer] = useState<any>(null)

  const handleAddCareer = (formData: FormData) => {
    const newCareer = {
      id: Date.now().toString(),
      position: formData.get("position") as string,
      company: formData.get("company") as string,
      startDate: formData.get("startDate") as string,
      endDate: (formData.get("endDate") as string) || "Present",
      description: formData.get("description") as string,
    }

    setCareer([...career, newCareer])
    setOpen(false)
  }

  const handleEditCareer = (formData: FormData) => {
    const updatedCareer = {
      id: editingCareer.id,
      position: formData.get("position") as string,
      company: formData.get("company") as string,
      startDate: formData.get("startDate") as string,
      endDate: (formData.get("endDate") as string) || "Present",
      description: formData.get("description") as string,
    }

    setCareer(career.map((c) => (c.id === editingCareer.id ? updatedCareer : c)))
    setOpen(false)
    setEditingCareer(null)
  }

  const handleDeleteCareer = (id: string) => {
    setCareer(career.filter((c) => c.id !== id))
  }

  const openEditDialog = (careerItem: any) => {
    setEditingCareer(careerItem)
    setOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Career</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" /> Add Career
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCareer ? "Edit Career" : "Add Career"}</DialogTitle>
              <DialogDescription>
                {editingCareer ? "Update the career details below." : "Add a new career entry to your portfolio."}
              </DialogDescription>
            </DialogHeader>
            <form action={editingCareer ? handleEditCareer : handleAddCareer}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    name="position"
                    defaultValue={editingCareer?.position || ""}
                    placeholder="Job position"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    defaultValue={editingCareer?.company || ""}
                    placeholder="Company name"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    defaultValue={editingCareer?.startDate || ""}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    defaultValue={editingCareer?.endDate !== "Present" ? editingCareer?.endDate : ""}
                    placeholder="Leave empty for 'Present'"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingCareer?.description || ""}
                    placeholder="Job description and responsibilities"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingCareer ? "Save Changes" : "Add Career"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
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
            {career.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.position}</TableCell>
                <TableCell>{item.company}</TableCell>
                <TableCell>
                  {new Date(item.startDate).toLocaleDateString()} -{" "}
                  {item.endDate === "Present" ? "Present" : new Date(item.endDate).toLocaleDateString()}
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
                      <DropdownMenuItem onClick={() => openEditDialog(item)}>
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
    </div>
  )
}

