import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { NewsletterSendForm } from "@/components/dashboard/newsletter-send-form"

export default function SendNewsletterPage() {
    return (
        <div className="space-y-6">
            <DashboardHeader heading="Send Newsletter" text="Create and send a newsletter to your subscribers">
                <Link href="/dashboard/newsletter">
                    <Button variant="outline" size="sm" className="gap-1">
                        <ArrowLeft className="h-4 w-4" /> Back to Subscribers
                    </Button>
                </Link>
            </DashboardHeader>

            <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                <div className="p-6">
                    <NewsletterSendForm />
                </div>
            </Card>
        </div>
    )
}
