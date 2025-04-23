import Link from "next/link"
import { Suspense } from "react"
import { MailPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardContactsTable } from "@/components/dashboard/contacts-table"
import { ContactsTableSkeleton } from "@/components/skeletons/contacts-table-skeleton"

export default function ContactsPage() {
    return (
        <div className="space-y-6">
            <DashboardHeader heading="Contacts" text="Manage and respond to contact form submissions">
                <Link href="/dashboard/contacts/new">
                    <Button size="sm" className="gap-1">
                        <MailPlus className="h-4 w-4" /> New Message
                    </Button>
                </Link>
            </DashboardHeader>

            <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                <div className="p-6">
                    <Suspense fallback={<ContactsTableSkeleton />}>
                        <DashboardContactsTable />
                    </Suspense>
                </div>
            </Card>
        </div>
    )
}
