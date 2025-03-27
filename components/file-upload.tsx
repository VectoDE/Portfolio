"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface FileUploadProps {
  id: string
  label: string
  value?: string
  onChange: (value: string) => void
  accept?: string
  maxSize?: number // in MB
}

export function FileUpload({ id, label, value, onChange, accept = "image/*", maxSize = 5 }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (convert maxSize from MB to bytes)
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`)
      return
    }

    setError(null)

    // Create a preview URL
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    // Convert to base64 for storage
    const reader = new FileReader()
    reader.onload = () => {
      const base64String = reader.result as string
      onChange(base64String)
    }
    reader.readAsDataURL(file)
  }

  const clearFile = () => {
    setPreview(null)
    onChange("")
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      <div className="flex flex-col gap-3">
        {preview && (
          <div className="relative w-full max-w-[200px] h-[150px] rounded-md overflow-hidden border">
            <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 rounded-full"
              onClick={clearFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {!preview && (
          <div className="flex items-center gap-2">
            <Input
              ref={fileInputRef}
              id={id}
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="hidden"
            />
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
              <Upload className="h-4 w-4" />
              Upload {label}
            </Button>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
        <p className="text-xs text-muted-foreground">
          Accepted formats: {accept.replace("image/*", "JPG, PNG, GIF, etc.")}. Max size: {maxSize}MB
        </p>
      </div>
    </div>
  )
}

