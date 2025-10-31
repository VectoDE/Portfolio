import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

// POST /api/upload - Upload a file
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id as string
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/avif",
      "image/svg+xml",
    ]

    if (!file.type || !allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only image uploads are allowed" },
        { status: 415 }
      )
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    await mkdir(uploadsDir, { recursive: true })

    const originalName = file.name || "upload"
    const fileExtension = path.extname(originalName) || ""
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
