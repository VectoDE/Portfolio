"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import type { Skill } from "@/types/database"

interface PaginationData {
  total: number
  pages: number
  page: number
  limit: number
}

export function DashboardSkillsTable() {
  const router = useRouter()
  const { toast } = useToast()
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    pages: 1,
    page: 1,
    limit: 10,
  })

  // Fetch skills
  const fetchSkills = useCallback(
    async (page = 1, category?: string) => {
      setLoading(true)
      try {
        let url = `/api/skills?page=${page}&limit=${pagination?.limit || 10}`
        if (category && category !== "all") {
          url += `&category=${category}`
        }

        const response = await fetch(url)
        if (!response.ok) {
          throw new Error("Failed to fetch skills")
        }

        const data = await response.json()
        setSkills(data.skills || [])
        setPagination(data.pagination || { total: 0, pages: 1, page: 1, limit: 10 })
      } catch (error) {
        console.error("Error fetching skills:", error)
        toast({
          title: "Error",
          description: "Failed to load skills",
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
    fetchSkills(1, categoryFilter !== "all" ? categoryFilter : undefined)
  }, [categoryFilter, fetchSkills])

  // Handle delete
  async function handleDeleteSkill(id: string) {
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

      // Remove the skill from the local state
      setSkills((prevSkills) => prevSkills.filter((skill) => skill.id !== id))

      toast({
        title: "Skill deleted",
        description: "The skill has been deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting skill:", error)
      toast({
        title: "Error",
        description: "Failed to delete skill",
        variant: "destructive",
      })
    }
  }

  // Handle page change
  function handlePageChange(newPage: number) {
    fetchSkills(newPage, categoryFilter !== "all" ? categoryFilter : undefined)
  }

  // Filter skills by search query
  const filteredSkills = skills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="programming">Programming</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="soft-skills">Soft Skills</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative">
          <Input
            placeholder="Search skills..."
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
                <TableHead>Category</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Years</TableHead>
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
                    <TableCell>Loading...</TableCell>
                  </TableRow>
                ))
              ) : filteredSkills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                    <p>No skills found</p>
                    <Link href="/dashboard/skills/new" className="mt-2 inline-block">
                      <Button size="sm">Add your first skill</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSkills.map((skill) => (
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
                          <DropdownMenuItem
                            onClick={() => router.push(`/dashboard/skills/${skill.id}`)}
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteSkill(skill.id)}>
                            <Trash className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
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
                if (pagination?.page < (pagination?.pages || 1))
                  handlePageChange(pagination.page + 1)
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
