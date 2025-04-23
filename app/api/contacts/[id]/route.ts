import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/db"

// GET /api/contacts/[id] - Get a single contact (protected)
export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const contact = await prisma.contact.findUnique({
            where: {
                id: params.id,
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
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { status, notes } = await req.json()

        const contact = await prisma.contact.update({
            where: {
                id: params.id,
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
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await prisma.contact.delete({
            where: {
                id: params.id,
            },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting contact:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
