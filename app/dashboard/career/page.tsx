import Link from "next/link"
import { Suspense } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardCareerTable } from "@/components/dashboard/career-table"
import { CareerTableSkeleton } from "@/components/skeletons/career-table-skeleton"

export default function CareerPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader heading="Career" text="Manage your professional experience">
        <Link href="/dashboard/career/new">
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" /> Add Position
          </Button>
        </Link>
      </DashboardHeader>

      <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
        <div className="p-6">
          <Suspense fallback={<CareerTableSkeleton />}>
            <DashboardCareerTable />
          </Suspense>
        </div>
      </Card>
    </div>
  )
}
