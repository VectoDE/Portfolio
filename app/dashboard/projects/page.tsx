import Link from "next/link"
import { Suspense } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardProjectsTable } from "@/components/dashboard/projects-table"
import { ProjectsTableSkeleton } from "@/components/skeletons/projects-table-skeleton"

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader heading="Projects" text="Manage your portfolio projects">
        <Link href="/dashboard/projects/new">
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" /> Add Project
          </Button>
        </Link>
      </DashboardHeader>

      <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
        <div className="p-6">
          <Suspense fallback={<ProjectsTableSkeleton />}>
            <DashboardProjectsTable />
          </Suspense>
        </div>
      </Card>
    </div>
  )
}
