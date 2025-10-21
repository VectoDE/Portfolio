import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { writeFile } from "fs/promises"
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
        const file = formData.get("file") as File

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ error: "File must be an image" }, { status: 400 })
        }

        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
            return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
        }

        const uploadsDir = path.join(process.cwd(), "public", "uploads")
        try {
            await writeFile(path.join(uploadsDir, "test.txt"), "test")
        } catch {
            const fs = require("fs")
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true })
            }
        }

        const fileExtension = file.name.split(".").pop()
        const fileName = `${uuidv4()}.${fileExtension}`
        const filePath = path.join(uploadsDir, fileName)

        const buffer = Buffer.from(await file.arrayBuffer())
        await writeFile(filePath, buffer)

        const imageUrl = `/uploads/${fileName}`

        await prisma.user.update({
            where: { id: userId },
            data: { imageUrl },
        })

        return NextResponse.json({ imageUrl })
    } catch (error) {
        console.error("Error uploading file:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
