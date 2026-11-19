import { unstable_noStore as noStore } from "next/cache"

import { getContentCareer, withContentFallback } from "@/lib/content"
import prisma from "@/lib/db"
import type { Career } from "@/types/database"

export async function getAllCareerEntries(): Promise<Career[]> {
  noStore()
  return withContentFallback<Career[]>(
    async () =>
      (await prisma.career.findMany({
        orderBy: { startDate: "desc" },
      })) as Career[],
    getContentCareer,
    "career entries",
  )
}

export async function getCareerEntryById(id: string): Promise<Career | null> {
  noStore()
  return withContentFallback<Career | null>(
    async () => (await prisma.career.findUnique({ where: { id } })) as Career | null,
    () => getContentCareer().find((entry) => entry.id === id) ?? null,
    `career entry ${id}`,
  )
}
