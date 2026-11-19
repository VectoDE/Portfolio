import { unstable_noStore as noStore } from "next/cache"

import { getContentSkills, withContentFallback } from "@/lib/content"
import prisma from "@/lib/db"
import type { Skill } from "@/types/database"

export async function getAllSkills(): Promise<Skill[]> {
  noStore()
  return withContentFallback<Skill[]>(
    () =>
      prisma.skill.findMany({
        orderBy: [{ category: "asc" }, { name: "asc" }],
      }),
    getContentSkills,
    "skills",
  )
}

export async function getSkillById(id: string): Promise<Skill | null> {
  noStore()
  return withContentFallback<Skill | null>(
    () => prisma.skill.findUnique({ where: { id } }),
    () => getContentSkills().find((skill) => skill.id === id) ?? null,
    `skill ${id}`,
  )
}

export async function getSkillsByCategory(category: string): Promise<Skill[]> {
  const skills = await getAllSkills()
  return skills.filter((skill) => skill.category === category)
}
