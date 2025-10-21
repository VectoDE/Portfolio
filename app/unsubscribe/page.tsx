import { Suspense } from "react"
import UnsubscribeClient from "@/components/unsubscribe-client"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation"

export default function UnsubscribePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <BackgroundGradientAnimation
        firstColor="rgba(125, 39, 255, 0.2)"
        secondColor="rgba(0, 87, 255, 0.2)"
        thirdColor="rgba(0, 214, 242, 0.2)"
      />

      <div className="relative z-10">
        <MainNav />

        <main className="flex-1">
          <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6 max-w-md mx-auto">
              <Suspense fallback={<UnsubscribeLoading />}>
                <UnsubscribeClient />
              </Suspense>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}

function UnsubscribeLoading() {
  return (
    <div className="border border-purple-200 dark:border-purple-800 bg-background/60 backdrop-blur-sm rounded-lg p-6">
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
