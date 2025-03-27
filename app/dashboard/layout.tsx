import type React from "react"
import type { Metadata } from "next"
import { DashboardNav } from "@/components/dashboard-nav"
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation"

export const metadata: Metadata = {
    title: "Dashboard | Tim Hauke",
    description: "Manage your portfolio content",
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
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

