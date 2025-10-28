"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
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
  isImage = true,
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setPreview(value || null)
    if (value) {
      const segments = value.split("/")
      setFileName((current) => current ?? segments[segments.length - 1] || null)
    } else {
      setFileName(null)
    }
  }, [value])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (convert maxSize from MB to bytes)
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`)
      return
    }

    setError(null)
    const previousPreview = preview
    let temporaryPreview: string | null = null

    if (isImage) {
      if (!file.type.startsWith("image/")) {
        setError("Selected file is not an image")
        return
      }
      temporaryPreview = URL.createObjectURL(file)
      setPreview(temporaryPreview)
    } else {
      setPreview(null)
    }

    try {
      setIsUploading(true)
      setFileName(file.name)

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to upload file" }))
        throw new Error(errorData.error || "Failed to upload file")
      }

      const data: { imageUrl?: string; originalName?: string } = await response.json()

      if (!data.imageUrl) {
        throw new Error("Upload response missing file URL")
      }

      onChange(data.imageUrl)
      if (data.originalName) {
        setFileName(data.originalName)
      }
      setPreview(isImage ? data.imageUrl : null)
      if (temporaryPreview) {
        URL.revokeObjectURL(temporaryPreview)
      }
    } catch (uploadError) {
      console.error("File upload error:", uploadError)
      setError(uploadError instanceof Error ? uploadError.message : "Failed to upload file")
      setFileName(null)
      setPreview(previousPreview)
      if (temporaryPreview) {
        URL.revokeObjectURL(temporaryPreview)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const clearFile = () => {
    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview)
    }
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
            <Image
              src={preview || "/placeholder.svg"}
              alt="Preview"
              fill
              className="object-cover"
              sizes="200px"
            />
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
              className={`gap-2 ${!isImage ? "w-auto" : "h-32 w-full border-dashed"}`}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4" />
              {isUploading ? "Uploading..." : `Upload ${isImage ? "Image" : "File"}`}
            </Button>
          </div>
        ) : null}

        {error && <p className="text-sm text-destructive">{error}</p>}
        {isUploading && !error && (
          <p className="text-xs text-muted-foreground">Uploading file, please wait...</p>
        )}
        <p className="text-xs text-muted-foreground">
          Accepted formats: {accept.replace("image/*", "JPG, PNG, GIF, etc.")}. Max size: {maxSize}
          MB
        </p>
      </div>
    </div>
  )
}
