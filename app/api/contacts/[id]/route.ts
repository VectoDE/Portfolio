import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

interface RouteParams {
    params: Promise<{
        id: string
    }>
}

// GET /api/contacts/[id] - Get a single contact (protected)
export async function GET(req: Request, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        const contact = await prisma.contact.findUnique({
            where: {
                id,
            },
        })

        if (!contact) {
            return NextResponse.json({ error: "Contact not found" }, { status: 404 })
        }

        return NextResponse.json({ contact })
    } catch (error) {
        console.error("Error fetching contact:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

// PATCH /api/contacts/[id] - Update a contact (protected)
export async function PATCH(req: Request, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { status, notes } = await req.json()

        const { id } = await params

        const contact = await prisma.contact.update({
            where: {
                id,
            },
            data: {
                status,
                notes,
            },
        })

        return NextResponse.json({ contact })
    } catch (error) {
        console.error("Error updating contact:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

// DELETE /api/contacts/[id] - Delete a contact (protected)
export async function DELETE(req: Request, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        await prisma.contact.delete({
            where: {
                id,
            },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting contact:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
