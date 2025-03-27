import Link from "next/link"
import { Suspense } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardCertificatesTable } from "@/components/dashboard/certificates-table"
import { CertificatesTableSkeleton } from "@/components/skeletons/certificates-table-skeleton"

export default function CertificatesPage() {
    return (
        <div className="space-y-6">
            <DashboardHeader heading="Certificates" text="Manage your certifications and achievements">
                <Link href="/dashboard/certificates/new">
                    <Button size="sm" className="gap-1">
                        <Plus className="h-4 w-4" /> Add Certificate
                    </Button>
                </Link>
            </DashboardHeader>

            <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                <div className="p-6">
                    <Suspense fallback={<CertificatesTableSkeleton />}>
                        <DashboardCertificatesTable />
                    </Suspense>
                </div>
            </Card>
        </div>
    )
}

