"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { Upload, X, File } from "lucide-react"
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
  isImage?: boolean
}

export function FileUpload({
  id,
  label,
  value,
  onChange,
  accept = "image/*",
  maxSize = 5,
  isImage = true
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
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
    setFileName(file.name)

    // For images, create a preview URL
    if (isImage && file.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)
    } else if (isImage) {
      setError("Selected file is not an image")
      return
    } else {
      // For non-image files, we don't need a visual preview
      setPreview(null)
    }

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
    setFileName(null)
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
        {isImage && preview && (
          <div className="relative w-full max-w-[200px] h-[150px] rounded-md overflow-hidden border">
            <Image src={preview || "/placeholder.svg"} alt="Preview" fill className="object-cover" sizes="200px" />
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

        {!isImage && value && (
          <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/20 max-w-md">
            <File className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm truncate flex-1">{fileName || "File uploaded"}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFile}
              className="h-7 px-2 text-destructive"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Remove
            </Button>
          </div>
        )}

        {(!preview && isImage) || (!value && !isImage) ? (
          <div className="flex items-center gap-2">
            <Input
              ref={fileInputRef}
              id={id}
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className={`gap-2 ${!isImage ? 'w-auto' : 'h-32 w-full border-dashed'}`}
            >
              <Upload className="h-4 w-4" />
              Upload {isImage ? "Image" : "File"}
            </Button>
          </div>
        ) : null}

        {error && <p className="text-sm text-destructive">{error}</p>}
        <p className="text-xs text-muted-foreground">
          Accepted formats: {accept.replace("image/*", "JPG, PNG, GIF, etc.")}. Max size: {maxSize}MB
        </p>
      </div>
    </div>
  )
}