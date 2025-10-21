import Link from "next/link"
import { Suspense } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSkillsTable } from "@/components/dashboard/skills-table"
import { SkillsTableSkeleton } from "@/components/skeletons/skills-table-skeleton"

export default function SkillsPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader heading="Skills" text="Manage your professional skills">
        <Link href="/dashboard/skills/new">
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" /> Add Skill
          </Button>
        </Link>
      </DashboardHeader>

      <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
        <div className="p-6">
          <Suspense fallback={<SkillsTableSkeleton />}>
            <DashboardSkillsTable />
          </Suspense>
        </div>
      </Card>
    </div>
  )
}
