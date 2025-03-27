import prisma from "@/lib/db"
import type { Skill } from "@/types/database"

export async function getAllSkills(): Promise<Skill[]> {
    try {
        const skills = await prisma.skill.findMany({
            orderBy: [{ category: "asc" }, { level: "desc" }, { name: "asc" }],
        })

        return skills
    } catch (error) {
        console.error("Error fetching all skills:", error)
        return []
    }
}

export async function getSkillById(id: string): Promise<Skill | null> {
    try {
        const skill = await prisma.skill.findUnique({
            where: {
                id,
            },
        })

        return skill
    } catch (error) {
        console.error(`Error fetching skill with id ${id}:`, error)
        return null
    }
}

export async function getSkillsByCategory(category: string): Promise<Skill[]> {
    try {
        // Get the first user (assuming it's the portfolio owner)
        const user = await prisma.user.findFirst()

        if (!user) {
            return []
        }

        const skills = await prisma.skill.findMany({
            where: {
                userId: user.id,
                category,
            },
            orderBy: [{ level: "desc" }, { name: "asc" }],
        })

        return skills
    } catch (error) {
        console.error(`Error fetching skills for category ${category}:`, error)
        return []
    }
}

