import type React from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { DashboardNav } from "@/components/dashboard-nav"
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation"
import { authOptions } from "@/lib/auth"
import { isAdminSession } from "@/lib/authz"
import {
  DASHBOARD_FORBIDDEN_PATH,
  DASHBOARD_LOGIN_PATH,
  decideDashboardAccess,
} from "@/lib/dashboard-access"

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
  const userId = session?.user?.id
  const isAdmin = session && userId ? await isAdminSession(session) : false
  const access = decideDashboardAccess({ userId, isAdmin })

  if (access === "login") {
    redirect(DASHBOARD_LOGIN_PATH)
  }

  if (access === "forbidden") {
    redirect(DASHBOARD_FORBIDDEN_PATH)
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <BackgroundGradientAnimation
        firstColor="rgba(125, 39, 255, 0.2)"
        secondColor="rgba(0, 87, 255, 0.2)"
        thirdColor="rgba(0, 214, 242, 0.2)"
        className="opacity-60"
      />
      <div className="relative z-10 flex-1 flex flex-col">
        <DashboardNav />
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
