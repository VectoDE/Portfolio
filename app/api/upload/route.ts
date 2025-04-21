import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { writeFile } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const formData = await req.formData()
        const file = formData.get("file") as File

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
        }

        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const originalExt = file.name.split(".").pop()
        const filename = `${uuidv4()}.${originalExt}`

        const path = join(process.cwd(), "public/uploads", filename)
        await writeFile(path, buffer)

        const imageUrl = `/uploads/${filename}`

        return NextResponse.json({ imageUrl })
    } catch (error) {
        console.error("Error uploading file:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
