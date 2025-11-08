import { unstable_noStore as noStore } from "next/cache"

import prisma from "@/lib/db"
import type { Certificate } from "@/types/database"

export async function getAllCertificates(limit?: number): Promise<Certificate[]> {
  noStore()
  try {
    // Get the first user (assuming it's the portfolio owner)
    const user = await prisma.user.findFirst()

    if (!user) {
      return []
    }

    const query = {
      where: {
        userId: user.id,
      },
      orderBy: {
        date: "desc" as const,
      },
    }

    if (limit) {
      return await prisma.certificate.findMany({
        ...query,
        take: limit,
      })
    }

    return await prisma.certificate.findMany(query)
  } catch (error) {
    console.error("Error fetching all certificates:", error)
    return []
  }
}

export async function getCertificateById(id: string): Promise<Certificate | null> {
  noStore()
  try {
    const certificate = await prisma.certificate.findUnique({
      where: {
        id,
      },
    })

    return certificate
  } catch (error) {
    console.error(`Error fetching certificate with id ${id}:`, error)
    return null
  }
}
