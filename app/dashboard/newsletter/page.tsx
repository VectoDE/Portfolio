import Link from "next/link"
import { Suspense } from "react"
import { Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { NewsletterTable } from "@/components/dashboard/newsletter-table"
import { NewsletterTableSkeleton } from "@/components/skeletons/newsletter-table-skeleton"

export default function NewsletterPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Newsletter"
        text="Manage your newsletter subscribers and send updates"
      >
        <Link href="/dashboard/newsletter/send">
          <Button size="sm" className="gap-1">
            <Send className="h-4 w-4" /> Send Newsletter
          </Button>
        </Link>
      </DashboardHeader>

      <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
        <div className="p-6">
          <Suspense fallback={<NewsletterTableSkeleton />}>
            <NewsletterTable />
          </Suspense>
        </div>
      </Card>
    </div>
  )
}
