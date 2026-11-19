import type React from "react"
import type { Metadata } from "next"
import { DashboardNav } from "@/components/dashboard-nav"

export const metadata: Metadata = {
  title: "Dashboard | Tim Hauke",
  description: "Manage your portfolio content",
}

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
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
