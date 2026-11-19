import { NextResponse } from "next/server"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { v4 as uuidv4 } from "uuid"

import { isAdminSession, requireSession } from "@/lib/authz"
import prisma from "@/lib/db"

const EXTENSION_BY_MIME_TYPE = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/gif", ".gif"],
  ["image/webp", ".webp"],
  ["image/avif", ".avif"],
  ["image/svg+xml", ".svg"],
])

// POST /api/upload - Upload a file
export async function POST(req: Request) {
  try {
    const auth = await requireSession()

    if (!auth.ok) {
      return auth.response
    }

    const { session } = auth

    const userId = session.user.id as string
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // The stored file extension is derived from the MIME type, never from the client file name.
    const isAdmin = await isAdminSession(session)
    const fileExtension = EXTENSION_BY_MIME_TYPE.get(file.type)

    // SVG files can carry scripts, so only admins may upload them (e.g. logos).
    if (!fileExtension || (file.type === "image/svg+xml" && !isAdmin)) {
      return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 415 })
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    await mkdir(uploadsDir, { recursive: true })

    const originalName = file.name || "upload"
    const fileName = `${uuidv4()}${fileExtension}`
    const filePath = path.join(uploadsDir, fileName)

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    const imageUrl = `/uploads/${fileName}`

    const media = await prisma.media.create({
      data: {
        userId,
        originalName,
        fileName,
        mimeType: file.type || null,
        size: Number(file.size),
        url: imageUrl,
      },
    })

    return NextResponse.json({ imageUrl, mediaId: media.id, originalName: media.originalName })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
