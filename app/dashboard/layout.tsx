import type React from "react"
import type { Metadata } from "next"
import { getServerSession } from "next-auth"

import { DashboardNav } from "@/components/dashboard-nav"
import { authOptions } from "@/lib/auth"
import { requireDashboardAdmin } from "@/lib/dashboard-guard"

export const metadata: Metadata = {
  title: "Dashboard | Tim Hauke",
  description: "Manage your portfolio content",
}

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // The middleware only sees the role stored in the session token. Check the role in the
  // database here as well, so demoted or deleted accounts lose access right away.
  const session = await getServerSession(authOptions)
  await requireDashboardAdmin(session)

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="relative z-10 flex-1 flex flex-col">
        <DashboardNav />
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
