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

interface CertificateEntry {
  id: string
  name: string
  issuer: string
  date: string
  link: string
}

// Mock data for certificates
const initialCertificates: CertificateEntry[] = [
  {
    id: "1",
    name: "AWS Certified Solutions Architect",
    issuer: "Amazon Web Services",
    date: "2023-05-15",
    link: "https://example.com/cert1",
  },
  {
    id: "2",
    name: "Professional Scrum Master I",
    issuer: "Scrum.org",
    date: "2022-11-10",
    link: "https://example.com/cert2",
  },
  {
    id: "3",
    name: "Google Professional Cloud Developer",
    issuer: "Google Cloud",
    date: "2023-02-22",
    link: "https://example.com/cert3",
  },
]

export function CertificatesTable() {
  const [certificates, setCertificates] = useState<CertificateEntry[]>(initialCertificates)
  const [open, setOpen] = useState(false)
  const [editingCertificate, setEditingCertificate] = useState<CertificateEntry | null>(null)

  const handleAddCertificate = (formData: FormData) => {
    const newCertificate = {
      id: Date.now().toString(),
      name: formData.get("name") as string,
      issuer: formData.get("issuer") as string,
      date: formData.get("date") as string,
      link: formData.get("link") as string,
    }

    setCertificates([...certificates, newCertificate])
    setOpen(false)
  }

  const handleEditCertificate = (formData: FormData) => {
    if (!editingCertificate) {
      return
    }

    const updatedCertificate: CertificateEntry = {
      id: editingCertificate.id,
      name: formData.get("name") as string,
      issuer: formData.get("issuer") as string,
      date: formData.get("date") as string,
      link: formData.get("link") as string,
    }

    setCertificates(certificates.map((c) => (c.id === editingCertificate.id ? updatedCertificate : c)))
    setOpen(false)
    setEditingCertificate(null)
  }

  const handleDeleteCertificate = (id: string) => {
    setCertificates(certificates.filter((c) => c.id !== id))
  }

  const openEditDialog = (certificate: CertificateEntry) => {
    setEditingCertificate(certificate)
    setOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Certificates</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" /> Add Certificate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCertificate ? "Edit Certificate" : "Add Certificate"}</DialogTitle>
              <DialogDescription>
                {editingCertificate
                  ? "Update the certificate details below."
                  : "Add a new certificate to your portfolio."}
              </DialogDescription>
            </DialogHeader>
            <form action={editingCertificate ? handleEditCertificate : handleAddCertificate}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Certificate Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingCertificate?.name || ""}
                    placeholder="Certificate name"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="issuer">Issuer</Label>
                  <Input
                    id="issuer"
                    name="issuer"
                    defaultValue={editingCertificate?.issuer || ""}
                    placeholder="Certificate issuer"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" name="date" type="date" defaultValue={editingCertificate?.date || ""} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="link">Certificate Link</Label>
                  <Input
                    id="link"
                    name="link"
                    defaultValue={editingCertificate?.link || ""}
                    placeholder="https://example.com/certificate"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingCertificate ? "Save Changes" : "Add Certificate"}</Button>
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
              <TableHead>Issuer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certificates.map((certificate) => (
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
                      <DropdownMenuItem onClick={() => openEditDialog(certificate)}>
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
    </div>
  )
}

