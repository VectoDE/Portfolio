import type { Metadata } from "next"

import { pageMetadata } from "@/lib/seo"
import { Suspense } from "react"
import UnsubscribeClient from "@/components/unsubscribe-client"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { AnimatedSection } from "@/components/animated-section"

export const metadata: Metadata = pageMetadata({
  title: "Unsubscribe",
  description: "Unsubscribe from the newsletter or change which updates you get.",
  path: "/unsubscribe",
  noindex: true,
})

export default function UnsubscribePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative z-10">
        <MainNav />

        <main id="main" className="flex-1">
          <AnimatedSection className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6 max-w-md mx-auto">
              <Suspense fallback={<UnsubscribeLoading />}>
                <UnsubscribeClient />
              </Suspense>
            </div>
          </AnimatedSection>
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}

function UnsubscribeLoading() {
  return (
    <div className="border border-border bg-card rounded-lg p-6">
      <div className="space-y-2 mb-4">
        <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
      </div>
      <div className="space-y-4 py-4">
        <div className="h-24 bg-muted rounded animate-pulse" />
      </div>
      <div className="pt-4">
        <div className="h-10 bg-muted rounded animate-pulse" />
      </div>
    </div>
  )
}
