import prisma from "@/lib/db"
import type { Career } from "@/types/database"

export async function getAllCareerEntries(): Promise<Career[]> {
    try {
        const careers = await prisma.career.findMany({
            orderBy: {
                startDate: "desc",
            },
        })

        return careers
    } catch (error) {
        console.error("Error fetching all career entries:", error)
        return []
    }
}

export async function getCareerEntryById(id: string): Promise<Career | null> {
    try {
        // Get the first user (assuming it's the portfolio owner)
        const user = await prisma.user.findFirst()

        if (!user) {
            return null;
        }

        const career = await prisma.career.findUnique({
            where: {
                id,
                userId: user.id,
            },
        })

        return career
    } catch (error) {
        console.error(`Error fetching career entry with id ${id}:`, error)
        return null
    }
}

