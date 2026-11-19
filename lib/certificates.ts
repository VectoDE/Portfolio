import { unstable_noStore as noStore } from "next/cache"

import { getContentCertificates, withContentFallback } from "@/lib/content"
import prisma from "@/lib/db"
import type { Certificate } from "@/types/database"

export async function getAllCertificates(limit?: number): Promise<Certificate[]> {
  noStore()
  return withContentFallback<Certificate[]>(
    () =>
      prisma.certificate.findMany({
        orderBy: { date: "desc" },
        ...(limit ? { take: limit } : {}),
      }),
    () => {
      const certificates = getContentCertificates()
      return limit ? certificates.slice(0, limit) : certificates
    },
    "certificates",
  )
}

export async function getCertificateById(id: string): Promise<Certificate | null> {
  noStore()
  return withContentFallback<Certificate | null>(
    () => prisma.certificate.findUnique({ where: { id } }),
    () => getContentCertificates().find((certificate) => certificate.id === id) ?? null,
    `certificate ${id}`,
  )
}
